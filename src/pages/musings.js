import Head from 'next/head';
import Link from 'next/link';

const musings = [
  {
    title: 'REFLEXIVITY MAXXING',
    date: 'ONGOING',
    dek: 'Notes on building systems that change the person using them.',
    href: '/musings/reflexivity-maxxing',
  },
];

export default function Musings() {
  return (
    <>
      <Head>
        <title>Musings — Sai Surbehera</title>
        <meta property="og:title" content="Musings — Sai Surbehera" key="title" />
      </Head>
      <main className="min-h-screen bg-[#2544fe] p-6 font-mono text-white md:p-12">
        <div className="flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col md:min-h-[calc(100vh-6rem)]">
          <header className="mb-12">
            <Link
              href="/"
              className="mb-12 block w-fit py-1 text-sm uppercase tracking-wide opacity-70 transition-opacity hover:opacity-100"
            >
              ← HOME
            </Link>
            <h1 className="mb-1 text-lg uppercase tracking-wide">MUSINGS</h1>
            <p className="text-sm uppercase tracking-wide opacity-70">
              Notes, drafts, and small observations.
            </p>
          </header>

          <section className="space-y-8" aria-label="Musings list">
            {musings.map((musing) => (
              <Link
                key={musing.title}
                href={musing.href}
                className="block max-w-xl opacity-80 transition-opacity hover:opacity-100"
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="text-sm uppercase tracking-wide">{musing.title}</h2>
                  <span className="text-sm uppercase tracking-wide opacity-60">{musing.date}</span>
                </div>
                <p className="text-sm leading-6 opacity-70">{musing.dek}</p>
              </Link>
            ))}
          </section>

          <div className="mt-auto pt-12">
            <a
              href="mailto:ss6365@columbia.edu"
              className="block w-fit py-1 text-sm uppercase tracking-wide opacity-70 transition-opacity hover:opacity-100"
            >
              EMAIL
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
