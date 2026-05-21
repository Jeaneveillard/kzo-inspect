/** Analyse de photos — détection d'anomalies (multi-provider vision) */

import { shrinkDataUrl } from './image-utils.js';
import { buildContextSummary } from './ai-knowledge.js';
import { normalizeAiModel } from './ai-models.js';

const VISION_MODEL_FALLBACK = 'gpt-4o-mini';

const VISION_OPENAI_PATTERN = /^(gpt-4o|gpt-4\.1|gpt-4-turbo|gpt-4-vision|o[34](-mini)?)/i;
const VISION_ANTHROPIC_PATTERN = /^claude-/i;
const VISION_GEMINI_PATTERN = /^gemini-/i;

/** Retourne le modèle vision à utiliser selon le provider actif. */
export function visionCapableModel(modelId, provider) {
  const id = normalizeAiModel(modelId);
  if (provider === 'anthropic' && VISION_ANTHROPIC_PATTERN.test(id)) return id;
  if (provider === 'gemini' && VISION_GEMINI_PATTERN.test(id)) return id;
  if (provider === 'xai') return id;
  if (VISION_OPENAI_PATTERN.test(id)) return id;
  return VISION_MODEL_FALLBACK;
}

export function canAnalyzePhotos(profile) {
  return Boolean(profile?.aiUseCloud && (profile?.aiApiKey || '').trim());
}

function parseDataUrl(dataUrl) {
  const m = String(dataUrl).match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!m) throw new Error('Format d\'image invalide');
  return { mime: m[1], base64: m[2] };
}

export function buildPhotoAnalysisPrompt(ctx, userNote = '') {
  const lines = [
    'Analyse cette photo prise lors d\'une **inspection visuelle de bâtiment au Québec** (pratiques AIBQ / BNQ).',
    'Tu assistes l\'inspecteur Jean Eveillard Cazeau — **ne remplace pas** son jugement professionnel.',
    '',
    '**Contexte dossier :**',
    buildContextSummary(ctx),
  ];
  if (ctx?.itemLabel) lines.push(`\n**Point de checklist visé :** ${ctx.itemLabel}`);
  if (ctx?.sectionTitle) lines.push(`**Section :** ${ctx.sectionTitle}`);
  if (userNote?.trim()) lines.push(`\n**Note de l'inspecteur :** ${userNote.trim()}`);

  lines.push(
    '',
    'Structure ta réponse en français canadien :',
    '1. **Ce que l\'on voit** — description factuelle',
    '2. **Anomalies ou signes préoccupants** — liste à puces (gravité : mineure / majeure / sécurité)',
    '3. **Statut suggéré** — C, NC, AC ou N/A avec justification courte',
    '4. **Formulations rapport** — 2 à 4 phrases pour le commentaire inspecteur',
    '5. **Priorité** — si NC/AC : critique, majeur ou mineur',
    '6. **Limites** — ce qu\'une photo seule ne permet pas de conclure ; expert à recommander si pertinent',
    '',
    'Ne invente pas de mesures ni d\'articles de code précis si non visibles. Rappelle que l\'inspection reste visuelle et non certifiante.',
  );
  return lines.join('\n');
}

export async function analyzePhotoWithVision(imageDataUrl, ctx, profile, userNote = '') {
  const key = (profile.aiApiKey || '').trim();
  if (!key) throw new Error('NO_KEY');
  if (!profile.aiUseCloud) throw new Error('CLOUD_OFF');

  const shrunk = await shrinkDataUrl(imageDataUrl, 1280, 0.8);
  const { mime, base64 } = parseDataUrl(shrunk);
  const model = profile.aiModel || 'gpt-4o-mini';
  const provider = profile.aiProvider || 'openai';
  const prompt = buildPhotoAnalysisPrompt(ctx, userNote);

  const system = `Tu es l'assistant vision de KZO Inspect — inspection de bâtiments au Québec.
Tu repères des anomalies *visibles* sur les photos : infiltration, fissures, corrosion, défauts électriques apparents, pourriture, moisissure, garde-corps, etc.
Tu ne certifies pas la conformité au Code du bâtiment. Tu suggères des statuts et formulations pour le rapport.`;

  let text = '';

  if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mime, data: base64 } }
            ]
          }
        ],
        generationConfig: { temperature: 0.35, maxOutputTokens: 1100 }
      })
    });
    if (!res.ok) throw new Error(`Erreur API Gemini (${res.status})`);
    const data = await res.json();
    text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } else if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model,
        system,
        temperature: 0.35,
        max_tokens: 1100,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
              { type: 'text', text: prompt }
            ]
          }
        ]
      })
    });
    if (!res.ok) throw new Error(`Erreur API Anthropic (${res.status})`);
    const data = await res.json();
    text = data.content?.[0]?.text;
  } else {
    // openai ou xai
    const baseUrl = provider === 'xai' ? 'https://api.x.ai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 1100,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}`, detail: 'high' } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Erreur API ${provider} (${res.status})`);
    const data = await res.json();
    text = data.choices?.[0]?.message?.content;
  }

  if (!text) throw new Error('Réponse vide de l\'API');
  return { text: text.trim(), model };
}
