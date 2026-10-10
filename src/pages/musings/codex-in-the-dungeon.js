import MusingSeo from '../../components/musings/MusingSeo';
import Head from 'next/head';
import Link from 'next/link';
import OrioleReplay, { DepthChart } from '../../components/musings/OrioleReplay';
import results from '../../data/oriole-results.json';


export default function CodexInTheDungeon() {
  return (
    <>
      <MusingSeo slug="codex-in-the-dungeon" />
      <Head>
        <link rel="stylesheet" href="/static/oriole/page.css" />
      </Head>
      <div className="oriole-musing">
        <a href="#oriole-article" className="oriole-skip">Skip to article</a>
        <div className="oriole-shell">
          <header className="oriole-masthead">
            <Link href="/musings">← Musings</Link>
          </header>
          <main id="oriole-article">
            <article>
              <header className="oriole-opening">
                <h1>Codex in the dungeon</h1>
                <p className="oriole-eyebrow"><time dateTime="2026-10-10">October 10, 2026</time> / Oriole field notes</p>
                <p className="oriole-lede">A coding agent, a dungeon, and five minutes to figure things out.
                  Four models started in the same place. One made it seven floors down.</p>
                <a className="oriole-jump-link" href="#recordings">Watch the recorded runs ↓</a>
              </header>

              <div className="oriole-summary" aria-label="Experiment at a glance">
                <div><strong>04</strong><span>models</span></div>
                <div><strong>05</strong><span>minutes each</span></div>
                <div><strong>07</strong><span>deepest floor</span></div>
              </div>

              <section className="oriole-reading" aria-labelledby="why-title">
                <p className="oriole-eyebrow">01 / The idea</p>
                <h2 id="why-title">What happens when the next task is a dungeon?</h2>
                <p>Codex can read a terminal, choose a command, and see what happened.
                  NetHack gives that loop a different kind of task: explore a map, deal with
                  monsters, watch your health, and find the stairs before you get stuck.</p>
                <p>Oriole already contained NetHack research code and a knowledge graph built
                  from the game’s wiki. The experiment was to give Codex a small, persistent
                  game interface and let it choose the next key itself.</p>
                <p>The game runs locally. The model uses the usual Codex CLI and a ChatGPT
                  subscription login. There is no separate API key, local language-model server,
                  or hand-written policy deciding its moves.</p>
              </section>

              <section className="oriole-section" aria-labelledby="loop-title">
                <div className="oriole-reading">
                  <p className="oriole-eyebrow">02 / The loop</p>
                  <h2 id="loop-title">Read the screen. Pick a key. Read again.</h2>
                </div>
                <ol className="oriole-loop">
                  <li><span>01</span><strong>Observe</strong><code>./play observe</code><p>Dungeon, health, turn, and message.</p></li>
                  <li><span>02</span><strong>Choose</strong><code>Codex reasons</code><p>The model chooses its next move.</p></li>
                  <li><span>03</span><strong>Act</strong><code>./play act north</code><p>A real key goes to the live game.</p></li>
                  <li><span>↺</span><strong>Inspect</strong><code>./play observe</code><p>See the consequences. Continue.</p></li>
                </ol>
                <div className="oriole-reading">
                  <p>The process keeps the game alive between commands. Codex can open inventory,
                    answer menus, fight, and descend stairs. It can also look up extracted wiki
                    facts through <code>./play knowledge</code>. Every key and resulting screen
                    goes into a replayable trace.</p>
                </div>
              </section>

              <section className="oriole-section" id="results" aria-labelledby="results-title">
                <div className="oriole-reading">
                  <p className="oriole-eyebrow">03 / The experiment</p>
                  <h2 id="results-title">The same starting room. Four different routes.</h2>
                  <p>Each model got seed 43, a lawful human Valkyrie, medium reasoning effort,
                    and a five-minute limit. The four games ran concurrently in separate sessions.
                    The starting screens were identical, verified by matching hashes.</p>
                </div>
                <DepthChart models={results.models} />
                <div className="oriole-table-scroll" tabIndex="0" aria-label="Scrollable model results">
                  <table className="oriole-results-table">
                    <caption className="oriole-visually-hidden">One five-minute NetHack trial per model, seed 43.</caption>
                    <thead><tr><th scope="col">Model</th><th scope="col">Deepest floor</th><th scope="col">Score</th><th scope="col">Keys</th><th scope="col">Final health</th></tr></thead>
                    <tbody>{results.models.map(model => <tr key={model.id}>
                      <th scope="row"><i style={{ background: model.color }} aria-hidden="true" />{model.label}</th>
                      <td>{model.deepestDepth}</td><td>{model.score}</td><td>{model.keys}</td><td>{model.hp}/{model.maxHp}</td>
                    </tr>)}</tbody>
                  </table>
                </div>
                <p className="oriole-caption">All four were alive when the supervisor stopped them. None ascended.
                  The limit was 300 seconds; shutdown adds about a second to elapsed time.</p>
              </section>

              <section className="oriole-section" id="recordings" aria-labelledby="recordings-title">
                <div className="oriole-reading">
                  <p className="oriole-eyebrow">04 / The recordings</p>
                  <h2 id="recordings-title">Follow the character down.</h2>
                  <p>Choose a model, drag the timeline, or jump to the moment it reached a new floor.
                    The initial view is GPT-6.1 Sol’s final screen. Hit play to watch its route
                    from the beginning.</p>
                </div>
                <OrioleReplay models={results.models} />
              </section>

              <section className="oriole-reading" aria-labelledby="looping-title">
                <p className="oriole-eyebrow">05 / A useful failure</p>
                <h2 id="looping-title">The first run mostly searched the same room.</h2>
                <p>Before the comparison, Luna played for ten minutes. It stayed on floor 1.
                  Of its 305 keys, 157 were searches. It survived, but kept revisiting the same area.</p>
                <p>That prompted adding visit counts to the observations and explicit instructions
                  to keep track of the route and avoid cycling. The paired trials above use that
                  updated setup. The earlier run is kept separate because its instructions and
                  recorded settings differ.</p>
                <p>This is the part I want to explore next: how much progress comes from the model,
                  and how much from giving it a useful way to remember where it has already been?</p>
              </section>

              <section className="oriole-reading" aria-labelledby="limits-title">
                <p className="oriole-eyebrow">06 / What this tells me</p>
                <h2 id="limits-title">A good start, with a long game ahead.</h2>
                <p>GPT-6.1 Sol reached the deepest floor in this run. Astra sent more keys.
                  These are useful observations from one seed, not a general model ranking.
                  Equal wall-clock time also gives faster models more chances to act.</p>
                <p>Five minutes measures early exploration. It does not show whether an agent
                  can manage a full inventory, survive deeper threats, or win NetHack.
                  The next experiment should use more seeds, repeat the runs, and give the
                  characters much longer to play.</p>
              </section>

              <section className="oriole-reading" aria-labelledby="try-title">
                <p className="oriole-eyebrow">07 / Run it locally</p>
                <h2 id="try-title">A subscription login and a few commands.</h2>
                <p>In an Oriole checkout with the gameplay tools installed, a bounded trial looks like this:</p>
                <pre className="oriole-command"><code>{`codex login
./play trial --model gpt-6-luna --seconds 600 --seed 43
./play results

# During a run, in another terminal:
./play results --live`}</code></pre>
                <p>The runner requires ChatGPT authentication and does not fall back to API-key
                  billing. Model availability and usage limits depend on the account.
                  OpenAI documents the <a href="https://learn.chatgpt.com/docs/auth">subscription sign-in flow</a>.</p>
                <div className="oriole-source-links">
                  <a href="/static/oriole/results.json" download>Download recorded results ↗</a>
                  <a href="/static/oriole/gpt-6.1-sol.json" download>Download the Sol 6.1 replay ↗</a>
                </div>
              </section>
            </article>
          </main>
          <footer className="oriole-footer"><Link href="/musings">← More musings</Link><a href="mailto:ss6365@columbia.edu">Say hello ↗</a></footer>
        </div>
      </div>
    </>
  );
}
