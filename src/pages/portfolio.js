import Head from 'next/head';
import { Portfolio } from '../components/Portfolio'

export default function portfolio() {
  return (
    <>
      <Portfolio/>
      <Head>
        <title>Portfolio • Sai Surbehera</title>
        <meta property="og:title" content="Portfolio • Sai Surbehera" key="title" />
      </Head>
    </>
  )
}
