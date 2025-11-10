// Este é o formato de handler padrão do Vercel
// É muito similar a um handler do Express.js
export default function handler(request, response) {
  // request.query contém os parâmetros da URL (ex: /api/hello?name=John)
  const { name } = request.query;

  // Envia uma resposta
  response.status(200).send(`Olá, ${name || 'mundo'}!`);
}