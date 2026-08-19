export default async function handler(req, res) {
  const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  try {
    // Derive the root backend URL from the API base URL
    // E.g., 'https://api-domain.com/api' -> 'https://api-domain.com/sitemap.xml'
    const baseBackendUrl = backendUrl.replace(/\/api$/, '');
    const sitemapUrl = `${baseBackendUrl}/sitemap.xml`;
    
    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap from backend. Status: ${response.status}`);
    }
    
    const xml = await response.text();
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).send(`Error fetching sitemap: ${error.message}`);
  }
}
