export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/user/', '/corporate/', '/employee/', '/api/'],
    },
    sitemap: 'https://www.pprsmart.com/sitemap.xml',
  };
}
