export const config = {
  runtime: 'edge',
};

const OPENROUTER_API_KEY = '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';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, request-id',
  };
}


export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
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

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json();
      return new Response(JSON.stringify({ error: errData.message || 'Erro desconhecido' }), {
        status: res.status,
        headers: corsHeaders()
      });
    }

    const data = await res.json();
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
