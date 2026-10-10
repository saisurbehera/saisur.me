import MusingSeo from '../../components/musings/MusingSeo';
import Head from 'next/head';
import Atlas from '../../components/musings/eldorado/Atlas';
import accounts from '../../data/eldorado/accounts.json';
import summary from '../../data/eldorado/summary.json';
export default function Eldorado(){return <><MusingSeo slug="eldorado" />
      <Head>
        <link rel="stylesheet" href="/static/eldorado/leaflet.css"/>
        <link rel="stylesheet" href="/static/eldorado-page.css"/>
      </Head><div className="eldorado-musing"><a className="eldorado-skip" href="#search">Skip to atlas search</a><Atlas accounts={accounts} summary={summary}/></div></>}
