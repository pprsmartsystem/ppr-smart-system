export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/user/', '/corporate/', '/employee/', '/api/'],
    },
    sitemap: 'https://ppr-smart-system.vercel.app/sitemap.xml', // Replace with your actual domain
  };
}
