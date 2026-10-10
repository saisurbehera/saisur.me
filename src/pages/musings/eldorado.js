import Head from 'next/head';
import Atlas from '../../components/musings/eldorado/Atlas';
import accounts from '../../data/eldorado/accounts.json';
import summary from '../../data/eldorado/summary.json';
const canonical='https://www.saisur.me/musings/eldorado';
export default function Eldorado(){return <><Head><title>Eldorado: tracing the Amazon | Sai Surbehera</title><meta name="description" content="Search 28 historical Amazon expedition volumes and explore source-linked river journeys, places, and original illustrations."/><meta property="og:title" content="Eldorado: tracing the Amazon" key="title"/><meta property="og:description" content="Historical accounts, river paths, and the evidence connecting them."/><meta property="og:url" content={canonical}/><meta property="og:type" content="article"/><link rel="canonical" href={canonical}/><link rel="stylesheet" href="/static/eldorado/leaflet.css"/><link rel="stylesheet" href="/static/eldorado-page.css"/></Head><div className="eldorado-musing"><a className="eldorado-skip" href="#search">Skip to atlas search</a><Atlas accounts={accounts} summary={summary}/></div></>}
