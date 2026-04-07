exports.handler = async function(event) {
if (event.httpMethod !== ‘POST’) {
return { statusCode: 405, body: ‘Method Not Allowed’ };
}

const { text, direction } = JSON.parse(event.body);

const systemPrompt = `Tu es un expert traducteur entre le français et le darija marocain. Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks. Pour français → darija : {"phonetic": "...", "arabic": "...", "note": ""} Pour darija → français : {"french": "...", "note": ""} Utilise le darija marocain authentique.`;

const userPrompt = direction === ‘fr-to-dar’
? `Traduis ce texte français en darija marocain : "${text}"`
: `Traduis ce texte darija marocain en français : "${text}"`;

const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’
},
body: JSON.stringify({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 1000,
system: systemPrompt,
messages: [{ role: ‘user’, content: userPrompt }]
})
});

const data = await response.json();
const raw = data.content.map(b => b.text || ‘’).join(’’);
const parsed = JSON.parse(raw.replace(/`json|`/g, ‘’).trim());

return {
statusCode: 200,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify(parsed)
};
};
