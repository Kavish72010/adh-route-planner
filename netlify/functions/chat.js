// Serverless proxy for the "ADH Delivery Intelligence" chat tab.
// The Anthropic API key lives only in Netlify's environment variables
// (ANTHROPIC_API_KEY) and is never sent to the browser.

const ALLOWED_MODELS = ['claude-sonnet-4-6'];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: { message: 'Method not allowed' } });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(500, { error: { message: 'ANTHROPIC_API_KEY is not set in Netlify' } });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: { message: 'Invalid JSON' } });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(400, { error: { message: 'messages is required' } });
  }

  const payload = {
    model: ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0],
    max_tokens: Math.min(Number(body.max_tokens) || 1000, 1000),
    system: typeof body.system === 'string' ? body.system : undefined,
    messages: body.messages.slice(-20) // keep requests small
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return json(res.status, data);
  } catch (err) {
    return json(502, { error: { message: 'Could not reach the Anthropic API' } });
  }
};

function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
