import Tesseract from 'tesseract.js';

export const config = {
  runtime: 'nodejs', // Node.js porque Tesseract precisa de ambiente Node
};

export default async function handler(req, res) {
  // Responder preflight CORS OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, request-id',
      },
    });
  }

  // Só aceitar GET
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: m => console.log(m),
    });

    return new Response(JSON.stringify({ text: result.data.text }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('OCR error:', err);
    return new Response(JSON.stringify({ error: 'OCR failed' }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
