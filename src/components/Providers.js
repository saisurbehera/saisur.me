import Head from 'next/head'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import * as React from 'react'

const defaultSEO = {
  title: 'Sai Surbehera',
  description:
    'Software engineer living in NYC.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.saisur.me',
    site_name: 'Sai Surbehera',
    
  }
}

export function Providers() {
  return (
    <>
      <DefaultSeo {...defaultSEO} />
      <Head>
        <link rel="icon" href="/static/meta/computer.png" sizes="any" />
        <link
          rel="icon"
          href="/static/.png"
          type="image/png"
          sizes="any"
        />
        <link rel="apple-touch-icon" href="/static/meta/computer.png" />
        <link rel="manifest" href="/static/meta/manifest.webmanifest" />
        <meta
          name="theme-color"
          content="#fff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="rgb(23, 23, 23)"
          media="(prefers-color-scheme: dark)"
        />

        {/* OpenGraph */}
        <meta property="og:title" content="Sai Surbehera" key="title" />
      </Head>


      {/* Theme Toggler - supports light, dark, and blue themes */}
      <Script id="theme-toggler">
        {`
          if (localStorage.theme === 'blue') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('theme-blue')
          } else if (localStorage.theme === 'dark') {
            document.documentElement.classList.remove('theme-blue')
            document.documentElement.classList.add('dark')
          } else {
            localStorage.theme = 'light'
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.remove('theme-blue')
          }
        `}
      </Script>
    </>
  )
}
