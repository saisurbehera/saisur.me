import { NextSeo } from 'next-seo';
import previews from '../../data/musing-previews.json';

const origin = 'https://www.saisur.me';

export default function MusingSeo({ slug }) {
  const preview = previews[slug];
  const image = `${origin}${preview.image}`;
  const description = preview.socialDescription || preview.description;

  return <NextSeo
    title={preview.documentTitle || (slug === 'index' ? preview.title : `${preview.title} — Sai Surbehera`)}
    description={preview.description}
    canonical={`${origin}${preview.path}`}
    openGraph={{
      type: slug === 'index' ? 'website' : 'article',
      url: `${origin}${preview.path}`,
      title: preview.title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: preview.alt, type: 'image/png' }],
    }}
    twitter={{ cardType: 'summary_large_image' }}
    additionalMetaTags={[
      { name: 'twitter:title', content: preview.title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: preview.alt },
    ]}
  />;
}
