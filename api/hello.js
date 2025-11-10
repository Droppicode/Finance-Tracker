// Este é o formato de handler padrão do Vercel
// É muito similar a um handler do Express.js
export default function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow GET and OPTIONS methods
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // request.query contém os parâmetros da URL (ex: /api/hello?name=John)
  const { name } = request.query;

  // Envia uma resposta
  response.status(200).send(`Olá, ${name || 'mundo'}!`);
}