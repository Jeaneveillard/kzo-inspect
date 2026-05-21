import { loadProfile } from './storage.js';
import { compressImage, shrinkDataUrl } from './image-utils.js';
import { normalizeAiModel } from './ai-models.js';
import { analyzePhotoWithVision, canAnalyzePhotos } from './ai-vision.js';
import {
  QUICK_PROMPTS,
  answerLocally,
  buildContextSummary,
  formatAssistantMarkdown,
} from './ai-knowledge.js';

const HISTORY_KEY = 'kzo_ai_chat_history';
const PANEL_OPEN_KEY = 'kzo_ai_panel_open';
const MAX_HISTORY = 40;

let panelOpen = false;
let busy = false;
let getContextFn = () => ({});

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
}

function loadPanelOpenState() {
  try {
    const stored = sessionStorage.getItem(PANEL_OPEN_KEY);
    if (stored === '0') return false;
    if (stored === '1') return true;
  } catch {
    /* ignore */
  }
  const profile = loadProfile();
  return profile.aiAssistantOpen !== false;
}

function savePanelOpenState(open) {
  try {
    sessionStorage.setItem(PANEL_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function getWelcomeMessage() {
  return {
    role: 'assistant',
    html: formatAssistantMarkdown(
      'Bonjour, je suis l\'**assistant KZO Inspect**.\n\nJe vous aide sur les statuts, les réponses rapides, le rapport AIBQ/BNQ et **l\'analyse de photos** pour repérer des anomalies visibles (mode cloud).\n\nUtilisez **📷 Photo** ci-dessous, le bouton **✦** sur une photo de checklist, ou décrivez votre question.',
    ),
  };
}

function renderMessages(container, messages) {
  container.innerHTML = messages
    .map((m) => {
      const isUser = m.role === 'user';
      const thumb = m.imageThumb
        ? `<p class="ai-msg__photo"><img src="${m.imageThumb}" alt="Photo analysée" /></p>`
        : '';
      const body = isUser ? escapeHtml(m.text) : m.html || formatAssistantMarkdown(m.text);
      return `<div class="ai-msg ai-msg--${isUser ? 'user' : 'bot'}"><div class="ai-msg__bubble">${thumb}${body}</div></div>`;
    })
    .join('');
  container.scrollTop = container.scrollHeight;
}

function setBusy(isOn) {
  busy = isOn;
  const send = document.getElementById('ai-send');
  const input = document.getElementById('ai-input');
  const photoBtn = document.getElementById('ai-photo-label');
  if (send) send.disabled = isOn;
  if (input) input.disabled = isOn;
  if (photoBtn) photoBtn.classList.toggle('is-disabled', isOn);
  document.getElementById('ai-typing')?.toggleAttribute('hidden', !isOn);
}

async function askCloud(question, ctx, profile) {
  const key = (profile.aiApiKey || '').trim();
  if (!key) throw new Error('NO_KEY');

  const provider = profile.aiProvider || 'openai';
  const model = normalizeAiModel(profile.aiModel);

  const system = `Tu es l'assistant d'inspection KZO Inspect pour Jean Eveillard Cazeau, inspecteur au Québec.
Réponds en français canadien, concis, professionnel. Contexte inspection visuelle AIBQ/BNQ — pas de garantie légale.
Ne invente pas de mesures ou de codes; suggère un expert si hors champ.
Contexte dossier:
${buildContextSummary(ctx)}`;

  let text = '';

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        system,
        temperature: 0.4,
        max_tokens: 700,
        messages: [{ role: 'user', content: question }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erreur API Anthropic (${res.status})`);
    }
    const data = await res.json();
    text = data.content?.[0]?.text;

  } else if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: question }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
        }),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erreur API Gemini (${res.status})`);
    }
    const data = await res.json();
    text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  } else {
    // openai ou xai — même format de requête
    const baseUrl =
      provider === 'xai'
        ? 'https://api.x.ai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erreur API ${provider} (${res.status})`);
    }
    const data = await res.json();
    text = data.choices?.[0]?.message?.content;
  }

  if (!text) throw new Error('Réponse vide de l\'API');
  return text.trim();
}

function promptForQuick(id, ctx) {
  const map = {
    'help-point': ctx.itemLabel
      ? `J'ai besoin d'aide pour le point : ${ctx.itemLabel}`
      : ctx.sectionTitle
        ? `Comment inspecter la section : ${ctx.sectionTitle} ?`
        : 'Comment aborder les points de cette checklist ?',
    'nc-ac': 'Quelle est la différence entre non conforme et à corriger ?',
    presets: 'Comment utiliser les réponses rapides et le commentaire inspecteur ?',
    na: 'Quand dois-je utiliser N/A et quoi écrire ?',
    report: 'Comment préparer un bon rapport pour le client ?',
    app: 'Comment utiliser KZO Inspect efficacement ?',
    'analyze-photo': 'Comment analyser une photo pour détecter les anomalies visibles ?',
  };
  return map[id] || id;
}

async function submitPhotoAnalysis(imageDataUrl, ctxOverride = {}, userNote = '') {
  if (!imageDataUrl || busy) return;
  const profile = loadProfile();

  if (!canAnalyzePhotos(profile)) {
    ensureAiAssistant(getContextFn);
    togglePanel(true);
    const messagesEl = document.getElementById('ai-messages');
    let messages = loadHistory();
    const offline =
      '**Analyse photo — mode cloud requis**\n\nActivez **Utiliser OpenAI (mode cloud)** et une **clé API** dans **Profil**. Utilisez un modèle **vision** : **GPT-4o mini** ou **GPT-4o** (recommandé).\n\nL\'analyse d\'images nécessite Internet et n\'est pas disponible hors ligne.';
    messages.push({
      role: 'assistant',
      text: offline,
      html: formatAssistantMarkdown(offline),
    });
    saveHistory(messages);
    renderMessages(messagesEl, messages);
    return;
  }

  ensureAiAssistant(getContextFn);
  togglePanel(true);
  const ctx = { ...getContextFn(), ...ctxOverride };
  const label = ctx.itemLabel ? ` — ${ctx.itemLabel}` : '';
  let thumb = imageDataUrl;
  try {
    thumb = await shrinkDataUrl(imageDataUrl, 320, 0.7);
  } catch {
    /* keep original */
  }

  const messagesEl = document.getElementById('ai-messages');
  let messages = loadHistory();
  messages.push({
    role: 'user',
    text: `Analyse de photo${label}${userNote ? ` — ${userNote}` : ''}`,
    imageThumb: thumb,
  });
  renderMessages(messagesEl, messages);
  saveHistory(messages);

  setBusy(true);
  const typing = document.getElementById('ai-typing');
  if (typing) typing.textContent = 'Analyse de la photo…';

  try {
    const { text, model } = await analyzePhotoWithVision(imageDataUrl, ctx, profile, userNote);
    const header = `*Analyse vision (${model}) — aide à la décision, pas un certificat de conformité.*\n\n`;
    messages.push({
      role: 'assistant',
      text: header + text,
      html: formatAssistantMarkdown(header + text),
    });
  } catch (e) {
    const errText = `**Analyse photo impossible** : ${e.message}\n\nVérifiez la clé API, le modèle (GPT-4o mini recommandé) et la connexion Internet.`;
    messages.push({
      role: 'assistant',
      text: errText,
      html: formatAssistantMarkdown(errText),
    });
  }

  saveHistory(messages);
  renderMessages(messagesEl, messages);
  setBusy(false);
  if (typing) typing.textContent = 'Réflexion…';
}

export async function analyzeInspectionPhoto(imageDataUrl, ctxOverride = {}, userNote = '') {
  await submitPhotoAnalysis(imageDataUrl, ctxOverride, userNote);
}

async function submitQuestion(question) {
  const q = (question || '').trim();
  if (!q || busy) return;

  if (q.toLowerCase().includes('analyser') && q.toLowerCase().includes('photo')) {
    const profile = loadProfile();
    if (!canAnalyzePhotos(profile)) {
      const messagesEl = document.getElementById('ai-messages');
      let messages = loadHistory();
      messages.push({ role: 'user', text: q });
      const reply = answerLocally(q, getContextFn());
      messages.push({ role: 'assistant', text: reply, html: formatAssistantMarkdown(reply) });
      saveHistory(messages);
      renderMessages(messagesEl, messages);
      return;
    }
    document.getElementById('ai-photo-input')?.click();
    return;
  }

  const messagesEl = document.getElementById('ai-messages');
  let messages = loadHistory();
  messages.push({ role: 'user', text: q });
  renderMessages(messagesEl, messages);
  saveHistory(messages);

  setBusy(true);
  const profile = loadProfile();
  const ctx = getContextFn();
  let replyText;

  try {
    if (profile.aiUseCloud && profile.aiApiKey?.trim()) {
      replyText = await askCloud(q, ctx, profile);
    } else {
      replyText = answerLocally(q, ctx);
    }
  } catch (e) {
    if (e.message === 'NO_KEY') {
      replyText = answerLocally(q, ctx);
    } else {
      replyText = `**Mode cloud indisponible** (${e.message}).\n\n${answerLocally(q, ctx)}`;
    }
  }

  messages.push({
    role: 'assistant',
    text: replyText,
    html: formatAssistantMarkdown(replyText),
  });
  saveHistory(messages);
  renderMessages(messagesEl, messages);
  setBusy(false);

  const input = document.getElementById('ai-input');
  if (input) input.value = '';
}

function syncPanelDom() {
  const root = document.getElementById('ai-assistant-root');
  const panel = document.getElementById('ai-panel');
  const fab = document.getElementById('ai-fab');
  panel?.classList.toggle('is-open', panelOpen);
  fab?.classList.toggle('is-open', panelOpen);
  root?.classList.toggle('is-panel-open', panelOpen);
  fab?.setAttribute('aria-expanded', String(panelOpen));
  fab?.setAttribute('aria-label', panelOpen ? 'Réduire l\'assistant IA' : 'Ouvrir l\'assistant IA');
  document.body.classList.toggle('ai-panel-open', panelOpen);
}

export function togglePanel(force) {
  panelOpen = force !== undefined ? force : !panelOpen;
  savePanelOpenState(panelOpen);
  syncPanelDom();
  if (panelOpen) {
    document.getElementById('ai-input')?.focus();
    updateContextBadge();
  }
}

function updateContextBadge() {
  const el = document.getElementById('ai-context-badge');
  if (!el) return;
  const ctx = getContextFn();
  if (ctx.inspection) {
    el.textContent = ctx.itemLabel
      ? `Point : ${ctx.itemLabel.slice(0, 42)}${ctx.itemLabel.length > 42 ? '…' : ''}`
      : ctx.sectionTitle
        ? `Section : ${ctx.sectionTitle.slice(0, 40)}${ctx.sectionTitle.length > 40 ? '…' : ''}`
        : `${ctx.inspection.client || 'Dossier'} — ${ctx.inspection.progress}%`;
  } else {
    el.textContent = 'Aide générale · analyse photo (cloud)';
  }
}

function bindPanelEvents() {
  document.getElementById('ai-fab')?.addEventListener('click', () => togglePanel());
  document.getElementById('ai-close')?.addEventListener('click', () => togglePanel(false));
  document.getElementById('ai-minimize')?.addEventListener('click', () => togglePanel(false));
  document.getElementById('ai-send')?.addEventListener('click', () => {
    submitQuestion(document.getElementById('ai-input')?.value);
  });
  document.getElementById('ai-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion(e.target.value);
    }
  });
  document.getElementById('ai-clear')?.addEventListener('click', () => {
    const welcome = getWelcomeMessage();
    saveHistory([welcome]);
    renderMessages(document.getElementById('ai-messages'), [welcome]);
  });
  document.getElementById('ai-photo-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1280, 0.78);
      await submitPhotoAnalysis(dataUrl, getContextFn(), '');
    } catch {
      const reader = new FileReader();
      reader.onload = () => submitPhotoAnalysis(reader.result, getContextFn(), '');
      reader.readAsDataURL(file);
    }
  });
  document.getElementById('ai-quick-prompts')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ai-prompt]');
    if (!btn) return;
    const id = btn.dataset.aiPrompt;
    if (id === 'analyze-photo') {
      const profile = loadProfile();
      if (canAnalyzePhotos(profile)) {
        document.getElementById('ai-photo-input')?.click();
      } else {
        submitQuestion(promptForQuick(id, getContextFn()));
      }
      return;
    }
    submitQuestion(promptForQuick(id, getContextFn()));
  });
}

function mountUi() {
  if (document.getElementById('ai-assistant-root')) return;

  const root = document.createElement('div');
  root.id = 'ai-assistant-root';
  root.innerHTML = `
    <button type="button" class="ai-fab" id="ai-fab" aria-label="Ouvrir l'assistant IA" aria-expanded="false" title="Assistant IA — toujours disponible">
      <span class="ai-fab__icon" aria-hidden="true">✦</span>
      <span class="ai-fab__label">Aide</span>
    </button>
    <div class="ai-panel" id="ai-panel" role="dialog" aria-label="Assistant KZO Inspect" aria-modal="false">
      <header class="ai-panel__head">
        <div>
          <h2 class="ai-panel__title">Assistant KZO</h2>
          <p class="ai-panel__sub" id="ai-context-badge">Aide inspection</p>
        </div>
        <div class="ai-panel__head-actions">
          <button type="button" class="ai-panel__minimize" id="ai-minimize" title="Réduire">−</button>
          <button type="button" class="ai-panel__close" id="ai-close" aria-label="Fermer">×</button>
        </div>
      </header>
      <div class="ai-messages" id="ai-messages"></div>
      <p class="ai-typing" id="ai-typing" hidden>Réflexion…</p>
      <div class="ai-quick" id="ai-quick-prompts">
        ${QUICK_PROMPTS.map(
          (p) =>
            `<button type="button" class="ai-quick__btn" data-ai-prompt="${p.id}">${escapeHtml(p.label)}</button>`,
        ).join('')}
      </div>
      <footer class="ai-panel__foot">
        <textarea class="input ai-input" id="ai-input" rows="2" placeholder="Question ou contexte pour la photo…"></textarea>
        <div class="ai-panel__actions">
          <label class="btn btn--ghost btn--sm ai-photo-upload" id="ai-photo-label" title="Analyser une photo (anomalies)">
            📷 Photo
            <input type="file" accept="image/*" hidden id="ai-photo-input" />
          </label>
          <button type="button" class="btn btn--ghost btn--sm" id="ai-clear">Effacer</button>
          <button type="button" class="btn btn--primary btn--sm" id="ai-send">Envoyer</button>
        </div>
      </footer>
    </div>
  `;
  document.body.appendChild(root);

  const history = loadHistory();
  const welcome = history.length ? history : [getWelcomeMessage()];
  if (!history.length) saveHistory(welcome);
  renderMessages(document.getElementById('ai-messages'), welcome);
  bindPanelEvents();

  panelOpen = loadPanelOpenState();
  syncPanelDom();
}

export function initAiAssistant({ getContext } = {}) {
  if (getContext) getContextFn = getContext;
  mountUi();
  updateAiAssistantContext(getContextFn());
}

export function ensureAiAssistant(getContext) {
  if (getContext) getContextFn = getContext;
  mountUi();
  updateAiAssistantContext(getContextFn());
}

export function updateAiAssistantContext(ctx) {
  if (ctx && typeof ctx === 'object') {
    const prev = getContextFn;
    getContextFn = () => ({ ...prev(), ...ctx });
  }
  updateContextBadge();
}

export function openAiAssistant() {
  ensureAiAssistant(getContextFn);
  togglePanel(true);
}
