import type {MetadataRoute} from 'next'

/** Lets phones save the site to the home screen with a sharp icon and the brand colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AutoGlow Car Care Expert',
    short_name: 'AutoGlow',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#031533',
    icons: [
      {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
      {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
      {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
    ],
  }
}
