export type ArticleArtwork = {src: string; alt: string}

const ARTICLE_ARTWORK: Record<string, ArticleArtwork> = {
  'ceramic-coating-cost-ahmedabad-kochi': {
    src: '/images/articles/ceramic-coating-cost-ahmedabad-kochi.png',
    alt: 'Voxel illustration of ceramic coating a glossy car between Ahmedabad and Kochi',
  },
  'does-ppf-yellow-peel-self-heal-warranty': {
    src: '/images/articles/does-ppf-yellow-peel-self-heal-warranty.png',
    alt: 'Voxel illustration of clear paint protection film smoothing a fine scratch',
  },
  'ppf-installation-time-process-aftercare': {
    src: '/images/articles/ppf-installation-time-process-aftercare.png',
    alt: 'Voxel illustration of a technician applying paint protection film to a car',
  },
  'when-to-install-ppf-on-new-car': {
    src: '/images/articles/when-to-install-ppf-on-new-car.png',
    alt: 'Voxel illustration of paint protection film being applied to a new car',
  },
}

export function articleArtwork(slug: string | null | undefined): ArticleArtwork | null {
  return slug ? ARTICLE_ARTWORK[slug] ?? null : null
}
