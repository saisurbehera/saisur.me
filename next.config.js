/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/api/eldorado/**': ['./src/data/eldorado/accounts.json', './data/eldorado/texts/*.txt'],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
