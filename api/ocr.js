import Tesseract from 'tesseract.js';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const imageRes = await fetch(url);
    if (!imageRes.ok) return res.status(502).json({ error: 'Failed to fetch image' });

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await Tesseract.recognize(buffer, 'eng', {
      logger: m => console.log(m),
    });

    return res.status(200).json({ text: result.data.text });
  } catch (err) {
    console.error('OCR error:', err);
    return res.status(500).json({ error: 'OCR failed' });
  }
}

export const config = {
  runtime: 'nodejs', // NÃO usar edge aqui
};
