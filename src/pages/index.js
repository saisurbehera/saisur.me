import Head from 'next/head';
import { Home } from '../components/Home'

export default function home() {
  return (
    <>
      <Home/>
      <Head>
        <title>Sai Surbehera</title>
        <meta property="og:title" content="Sai Surbehera" key="title" />
      </Head>
    </>
  )
}
