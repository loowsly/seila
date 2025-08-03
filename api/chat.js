export const config = {
  runtime: 'nodejs',
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Title, HTTP-Referer',
  };
}


export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  try {
    const { modelId, messages, imageUrl } = await req.json();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://prova-paulista-hck.vercel.app/',
      'X-Title': 'HCK Prova Paulista',
    };

    const body = {
      model: modelId,
      messages,
    };

    if (imageUrl) {
      body.tools = [
        {
          type: "vision",
          input: {
            image_url: imageUrl,
          }
        }
      ];
    }

    const resFetch = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!resFetch.ok) {
      const errData = await resFetch.json();
      return new Response(JSON.stringify({ error: errData.message || 'Erro desconhecido' }), {
        status: resFetch.status,
        headers: corsHeaders()
      });
    }

    const data = await resFetch.json();
    return new Response(JSON.stringify({
      response: data.choices?.[0]?.message?.content ?? null,
      model: data.model,
      source: 'openrouter',
      details: {
        usage: data.usage,
        id: data.id,
      }
    }), {
      status: 200,
      headers: corsHeaders()
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro interno: ' + e.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
