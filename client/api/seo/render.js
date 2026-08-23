export default async function handler(req, res) {
  const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  try {
    // Get the path parameter from query or default to '/'
    const pathVal = req.query.path || '/';
    
    // Construct the endpoint on the backend: /api/seo/render?path=<pathVal>
    const renderUrl = `${backendUrl}/seo/render?path=${encodeURIComponent(pathVal)}`;
    
    const response = await fetch(renderUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SEO metadata from backend. Status: ${response.status}`);
    }
    
    const html = await response.text();
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in SEO proxy render:', error);
    res.status(500).send(`Error rendering SEO: ${error.message}`);
  }
}
