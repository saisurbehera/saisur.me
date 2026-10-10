import MusingSeo from '../../components/musings/MusingSeo';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import results from '../../../public/static/searchable-memory/results.json';

const mb = bytes => (bytes / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const conditions = [
  { id: 'retrieved_packed', label: 'Retrieved memory', explanation: 'Search finds the source. The model reads its compressed, all-layer prefix and completes the four-digit code.' },
  { id: 'oracle_packed', label: 'Correct memory supplied', explanation: 'Hand the model the correct compressed prefix. This removes retrieval as a possible source of failure.' },
  { id: 'wrong_packed', label: 'Wrong memory', explanation: 'Give the model a different source’s prefix. None of the 128 answers are correct: merely having a cache is not enough.' },
  { id: 'no_memory', label: 'No memory', explanation: 'Remove the source entirely. None of the 128 answers are correct: these randomly assigned codes were not recoverable from the model alone.' },
];

function MemoryControls() {
  const [selected, setSelected] = useState(conditions[0]);
  const score = results.recall.conditions[selected.id];
  return (
    <figure className="memory-controls" aria-labelledby="controls-title">
      <figcaption id="controls-title">Change the evidence. See the recorded result.</figcaption>
      <div className="memory-options" role="group" aria-label="Recorded memory conditions">
        {conditions.map(condition => {
          const result = results.recall.conditions[condition.id];
          return <button key={condition.id} type="button" aria-pressed={selected.id === condition.id}
            aria-controls="memory-outcome" onClick={() => setSelected(condition)}>
            <span>{condition.label}</span><span>{result.accuracy * result.count}/{result.count}</span>
          </button>;
        })}
      </div>
      <div id="memory-outcome" className="memory-outcome" role="status" aria-live="polite" aria-atomic="true">
        <p className="memory-score"><strong>{score.accuracy * score.count}<span>/{score.count}</span></strong> exact answers</p>
        <p>{selected.explanation}</p>
      </div>
      <p className="memory-caption">Recorded aggregate results, not live inference. Each condition uses the same 128 questions.
        The 95% interval for 128/128 is 97.1–100%.</p>
    </figure>
  );
}

function StorageFigure() {
  const storage = results.storage;
  const width = bytes => `${bytes / storage.fp16_equivalent_bytes * 100}%`;
  return (
    <figure className="memory-storage" aria-labelledby="storage-title">
      <figcaption id="storage-title">Same model. Same source memory. Fewer stored bytes.</figcaption>
      <div className="memory-bar-label"><span>FP16 equivalent</span><strong>{mb(storage.fp16_equivalent_bytes)} MB</strong></div>
      <div className="memory-track" aria-hidden="true"><div className="memory-baseline" /></div>
      <div className="memory-bar-label"><span>Packed package</span><strong>{mb(storage.packed_directory_bytes)} MB</strong></div>
      <div className="memory-track" aria-hidden="true">
        <div className="memory-model" style={{ width: width(storage.model_directory_bytes) }} />
        <div className="memory-index" style={{ width: width(storage.deployed_index_bytes) }} />
      </div>
      <div className="memory-legend">
        <span><i className="memory-model" aria-hidden="true" />Model + tokenizer: {mb(storage.model_directory_bytes)} MB</span>
        <span><i className="memory-index" aria-hidden="true" />Search index: {mb(storage.deployed_index_bytes)} MB</span>
      </div>
      <p className="memory-caption">{(storage.reduction * 100).toFixed(1)}% less disk storage.
        Includes source text, actual token keys and values, and search metadata for 5,183 passages.
        MB = 1,000,000 bytes. Both sides exclude unused token padding.</p>
    </figure>
  );
}

export default function SearchableMemory() {
  return (
    <>
      <MusingSeo slug="searchable-memory" />
      <Head>
        <link rel="stylesheet" href="/static/searchable-memory/page.css" />
      </Head>
      <div className="memory-page">
        <a className="memory-skip" href="#memory-article">Skip to article</a>
        <div className="memory-shell">
          <header className="memory-masthead"><Link href="/musings">← Musings</Link></header>
          <main id="memory-article">
            <article>
              <header className="memory-opening">
                <h1>A memory you can search</h1>
                <p className="memory-eyebrow">October 2026 / Bulbul experiment notes</p>
                <p>Can a small language model keep useful information outside its weights,
                  make that memory searchable, and use less space?</p>
                <p>This experiment gets part of the way there: a 494-million-parameter model
                  plus 5,183 searchable passages in <strong>663.5 MB</strong>.
                  A separate recall test checks whether retrieved memory actually changes its answers.</p>
                <nav className="memory-jumps" aria-label="In this article">
                  <a href="#architecture">Architecture ↓</a><a href="#experiment">Results ↓</a><a href="#applications">Applications ↓</a>
                </nav>
              </header>

              <section className="memory-section" aria-labelledby="idea-title">
                <p className="memory-eyebrow">01 / The idea</p>
                <h2 id="idea-title">Give the model a library it can look through.</h2>
                <p>A transformer turns tokens into <strong>keys</strong>, which help attention find
                  relevant information, and <strong>values</strong>, which carry information forward.
                  Usually these intermediate vectors live inside a running model’s cache.
                  Here we also save them as a persistent, inspectable memory.</p>
                <p>The useful possibility is a small model with a source library you can update
                  without retraining its weights. The experiment asks two separate questions:
                  can we search that library, and can the model use what we retrieve?</p>
                <p>The starting point was <a href="https://arxiv.org/abs/2203.08913">Memorizing Transformers</a>.
                  The working prototype below uses a pretrained Qwen model, key-based search,
                  and a separate prefix-cache experiment. It is not a reproduction of the paper’s trained memory layer.</p>
              </section>

              <section className="memory-section" id="architecture" aria-labelledby="architecture-title">
                <p className="memory-eyebrow">02 / The architecture</p>
                <h2 id="architecture-title">Store once. Search when needed.</h2>
                <figure className="memory-architecture" aria-labelledby="architecture-caption">
                  <div className="memory-flow-heading">Build the library</div>
                  <ol className="memory-flow">
                    <li><span>01</span><strong>Source passages</strong><p>Up to 256 tokens each, with source IDs.</p></li>
                    <li><span>02</span><strong>Small Qwen model</strong><p>Capture projected keys and values at layer 11.</p></li>
                    <li><span>03</span><strong>Pack + save</strong><p>4-bit K/V, source text, token positions, keyword index.</p></li>
                  </ol>
                  <div className="memory-flow-heading">Ask a natural-language question</div>
                  <ol className="memory-flow">
                    <li><span>01</span><strong>Find candidates</strong><p>BM25 keyword search picks 50 passages.</p></li>
                    <li><span>02</span><strong>Compare keys</strong><p>The same model encodes the query and reranks candidates.</p></li>
                    <li><span>03</span><strong>Inspect the source</strong><p>Return passages and their stored token K/V pairs.</p></li>
                  </ol>
                  <figcaption id="architecture-caption" className="memory-caption">The search path uses one layer’s keys.
                    Values are stored and inspectable, but do not determine the search ranking.</figcaption>
                </figure>
                <p>Only candidate keys need unpacking. The query and document encoders must use
                  matching weights; changing the model means rebuilding its index. The local prototype
                  exposes a browser search box and an HTTP API, so other tools can query the same library.</p>
                <aside className="memory-note">
                  <strong>Search and generation need different memories.</strong>
                  <p>For the separate recall test, a retrieved source ID selects a saved prefix
                    containing keys and values from <em>all 24 layers</em>. That prefix is unpacked
                    and consumed during generation. One layer’s search vectors cannot substitute
                    for a complete generation cache.</p>
                </aside>
              </section>

              <section className="memory-section" id="experiment" aria-labelledby="experiment-title">
                <p className="memory-eyebrow">03 / The experiment</p>
                <h2 id="experiment-title">Compress the representation. Count the whole package.</h2>
                <p>We used <a href="https://huggingface.co/Qwen/Qwen2.5-0.5B">Qwen2.5-0.5B</a>.
                  Its decoder matrices use 4-bit storage, with an 8-bit shared embedding/output
                  matrix and calibration-based error compensation inspired by <a href="https://arxiv.org/abs/2210.17323">GPTQ</a>.
                  Keys and values in the search index use 4 bits each. Source text is stored once;
                  unused token padding is removed.</p>
                <StorageFigure />
                <p><strong>The model still has 494,032,768 parameters.</strong> These savings come
                  from lower precision and tighter storage. They do not establish an equivalent
                  reduction in working RAM, GPU memory, or latency: this implementation unpacks
                  weights and active prefixes into floating point.</p>
                <div className="memory-table-wrap">
                  <table>
                    <caption>What happened to quality?</caption>
                    <thead><tr><th scope="col">Check</th><th scope="col">Recorded result</th></tr></thead>
                    <tbody>
                      <tr><th scope="row">Language modeling<br /><small>WikiText regression</small></th><td>Perplexity +{(results.language.wiki.relative_ppl_increase * 100).toFixed(2)}%<small>Lower is better. 95% interval: +3.84–4.78%.</small></td></tr>
                      <tr><th scope="row">Question answering<br /><small>256 fresh ARC-Easy questions</small></th><td>56.25% → 56.25%<small>Same accuracy; difference interval −2.73 to +2.74 percentage points.</small></td></tr>
                      <tr><th scope="row">Passage search<br /><small>298 SciFact regression queries</small></th><td>{results.search.float_keys.ndcg10.toFixed(4)} → {results.search.four_bit_keys.metrics.ndcg10.toFixed(4)}<small>Float → 4-bit keys, same quantized encoder. nDCG@10; higher is better.</small></td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="memory-caption">nDCG measures whether relevant passages appear near the top.
                  The 4-bit search audit was done after inspecting the test cohort; its small score increase
                  is not evidence that compression improves retrieval. Model quality is compared with
                  the original FP32 model; FP16 above is a storage equivalent.</p>
                <h3>Some smaller versions failed.</h3>
                <p>Naive all-2-bit weights broke language modeling. Two-bit search keys lost more
                  relevance than the preset tolerance allowed. For generation prefixes, packing
                  every key per token badly damaged continuation quality. Grouping keys across
                  tokens and values across channels, inspired by <a href="https://arxiv.org/abs/2402.02750">KIVI</a>,
                  worked much better. The layout matters as much as the bit count.</p>
              </section>

              <section className="memory-section" aria-labelledby="recall-title">
                <p className="memory-eyebrow">04 / Does it use the memory?</p>
                <h2 id="recall-title">Take the source away.</h2>
                <p>We created 256 new station names with randomly assigned four-digit codes,
                  froze the configuration, and asked 128 questions. The combined setup used
                  the compressed model, matching search keys, and 4-bit all-layer prefix caches.</p>
                <MemoryControls />
                <p>That is evidence that retrieved memory supplies the answer in this controlled
                  task. The prompt follows a fixed station-code grammar; it does not demonstrate
                  general reasoning. This small fact bank is separate from the 5,183-passage,
                  663.5 MB search package.</p>
                <details className="memory-details">
                  <summary>What about data leakage?</summary>
                  <p>Calibration used training text. ARC questions and answer labels were kept
                    out of retrieval memory; the 256 questions above were unused in earlier
                    local experiments. The recall task is explicitly open-book: source facts
                    are allowed, evaluation questions and labels are not indexed.</p>
                  <p>WikiText and SciFact were already inspected, so their scores are regression
                    measurements. The search precision audit is post-hoc. Public-model pretraining
                    contamination remains unknown, and these custom subsets are not canonical
                    leaderboard scores. Equal observed accuracy is not proof of equal capability.</p>
                </details>
              </section>

              <section className="memory-section" id="applications" aria-labelledby="applications-title">
                <p className="memory-eyebrow">05 / Making it useful</p>
                <h2 id="applications-title">Start with a local reference library.</h2>
                <p>The clearest next application is a searchable collection of papers, manuals,
                  or project notes. A small model helps rank passages, while source IDs let a person
                  inspect where each result came from. New documents require indexing, not model retraining.</p>
                <p>Repeatedly used documents are also candidates for saved generation prefixes:
                  encode stable context once, then load the relevant prefix when needed. Whether
                  this beats retrieving text and encoding it normally still needs a latency and
                  memory comparison on the target device.</p>
                <ol className="memory-next">
                  <li><strong>Bring a real corpus.</strong> Split it into short passages, preserve
                    source links, and build the index with the exact model used for queries.</li>
                  <li><strong>Compare against ordinary retrieval.</strong> Use unseen questions,
                    keyword and embedding baselines, and questions the sources cannot answer.
                    Keep wrong-memory and no-memory controls.</li>
                  <li><strong>Measure the device cost.</strong> Count the model, index, and any
                    full prefix bank. Then measure peak working memory and end-to-end response time.</li>
                </ol>
                <p>The promising part is being able to store, inspect, and search useful source
                  memory cheaply. A production version still needs reliable document updates,
                  access controls, and a way to abstain when the library has no answer.</p>
              </section>

              <aside className="memory-sources" aria-label="Results and references">
                <h2>Look closer</h2>
                <a href="/static/searchable-memory/results.json" download>Download measured results + provenance ↗</a>
                <p>The download includes exact byte counts, confidence intervals, the model revision,
                  package versions, and experiment code hashes. This page explains recorded local
                  experiments; it does not run a model in your browser.</p>
                <div className="memory-source-links"><a href="https://arxiv.org/abs/2203.08913">Memorizing Transformers</a><a href="https://arxiv.org/abs/2210.17323">GPTQ</a><a href="https://arxiv.org/abs/2402.02750">KIVI</a></div>
              </aside>
            </article>
          </main>
          <footer className="memory-footer"><Link href="/musings">← More musings</Link><a href="mailto:ss6365@columbia.edu">Say hello ↗</a></footer>
        </div>
      </div>
    </>
  );
}
