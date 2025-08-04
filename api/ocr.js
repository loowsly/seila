import Tesseract from 'tesseract.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
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

  console.log('OCR handler iniciado para URL:', url);

  try {
    const imageRes = await fetch(url);
    console.log('Status fetch imagem:', imageRes.status);
    if (!imageRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: m => console.log('Tesseract:', m),
    });

    console.log('Texto OCR:', result.data.text);

    return new Response(JSON.stringify({ text: result.data.text }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro OCR:', err);
    return new Response(JSON.stringify({ error: 'OCR failed' }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}
