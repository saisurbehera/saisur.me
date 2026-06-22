import Head from 'next/head';
import Link from 'next/link';

const poem = [
  'Between two armies, Arjun lowered his bow.',
  'The field answered him with kinship and dust.',
  'Krishna did not move the war from his sight;',
  'he moved the sight within him.',
  '',
  'A self returned where fear had been speaking.',
  'Doubt loosened its hand from the string.',
  'The chariot stayed still, but the archer changed.',
  'I remember, he said. I will act.',
];

export default function ReflexivityMaxxing() {
  return (
    <>
      <Head>
        <title>Reflexivity Maxxing — Sai Surbehera</title>
        <meta property="og:title" content="Reflexivity Maxxing — Sai Surbehera" key="title" />
      </Head>
      <main className="min-h-screen bg-[#2544fe] p-6 font-mono text-white md:p-12">
        <article className="flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col md:min-h-[calc(100vh-6rem)]">
          <header className="mb-12">
            <Link
              href="/musings"
              className="mb-12 block w-fit py-1 text-sm uppercase tracking-wide opacity-70 transition-opacity hover:opacity-100"
            >
              ← MUSINGS
            </Link>
            <h1 className="mb-1 text-lg uppercase tracking-wide">REFLEXIVITY MAXXING</h1>
            <p className="text-sm uppercase tracking-wide opacity-70">After Bhagavad Gita 18.73</p>
          </header>

          <div className="space-y-5 text-sm uppercase leading-7 tracking-wide opacity-80">
            {poem.map((line, index) =>
              line ? <p key={line}>{line}</p> : <div key={`space-${index}`} className="h-3" />,
            )}
          </div>

          <p className="mt-12 max-w-xl text-sm leading-6 opacity-60">
            In the Gita&apos;s closing movement, Arjun tells Krishna that his delusion is destroyed, his
            memory is restored, his doubt is gone, and he is ready to act.
          </p>
        </article>
      </main>
    </>
  );
}
