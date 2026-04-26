import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function buildPrompt({ vibe, destination, sender, recipient, message, rewriteStrength }) {
  const strengthGuide = {
    light: 'Keep the original wording very close. Only polish grammar, warmth, and vintage texture.',
    balanced: 'Keep the original meaning clearly intact, but reshape the wording into a smoother vintage postcard.',
    rich: 'Preserve the original meaning, but elevate the language more noticeably with lush vintage phrasing.'
  };

  const vibeGuide = {
    romantic: 'soft-hearted, affectionate, warm, rose-tinted, intimate without being overdramatic',
    dreamy: 'hazy, moonlit, delicate, airy, gentle, wistful and luminous',
    melancholy: 'tenderly sorrowful, reflective, rain-touched, restrained and poetic',
    adventure: 'spirited, travel-worn, brave, lively, observant and full of movement',
    classic: 'elegant, polished, timeless, graceful and restrained',
    darkacademia: 'ink-rich, literary, antique, moody and scholarly'
  };

  return `You are an expert vintage postcard writer.

Write one complete postcard message in English.

STRICT RULES:
- Preserve the user's real meaning and details.
- Do not invent major new story events.
- Do not ignore the user's message.
- Write 4 to 7 full sentences.
- Make the postcard feel authentically vintage, never modern slang.
- Use this emotional mood: ${vibeGuide[vibe] || vibeGuide.classic}.
- ${strengthGuide[rewriteStrength] || strengthGuide.balanced}
- Mention the destination naturally only if it fits.
- If a recipient name is provided, address them naturally.
- End exactly with: Yours, ${sender || 'A Faithful Correspondent'}
- Return only the postcard text, no title, no bullets, no quotation marks.

Recipient: ${recipient || 'Not specified'}
Destination: ${destination}
Original message from user:
${message}`;
}

app.post('/api/generate', async (req, res) => {
  try {
    const { vibe, destination, sender, recipient, message, rewriteStrength } = req.body || {};

    if (!destination || !message) {
      return res.status(400).json({ error: 'Destination and message are required.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing in the .env file.' });
    }

    const prompt = buildPrompt({ vibe, destination, sender, recipient, message, rewriteStrength });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.65,
        max_tokens: 420,
        messages: [
          { role: 'system', content: 'You turn user messages into beautiful but faithful vintage postcards.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'AI generation failed.'
      });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text || text.length < 40) {
      return res.status(500).json({ error: 'Generated postcard text was too short. Please try again.' });
    }

    return res.json({ text, model: 'llama-3.3-70b-versatile' });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error.' });
  }
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Moonlit Post running at http://localhost:${port}`);
});
