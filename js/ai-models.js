/** Modèles IA proposés pour l'assistant (mode cloud) */

export const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4o, GPT-4.1)' },
  { value: 'anthropic', label: 'Anthropic (Claude 4)' },
  { value: 'gemini', label: 'Google Gemini (2.0/2.5)' },
  { value: 'xai', label: 'xAI (Grok)' }
];

export const AI_MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini', hint: 'Rapide et économique (OpenAI)', provider: 'openai' },
  { value: 'gpt-4o', label: 'GPT-4o', hint: 'Équilibre qualité / vision (OpenAI)', provider: 'openai' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini', hint: 'Dernière génération, compact', provider: 'openai' },
  { value: 'gpt-4.1', label: 'GPT-4.1', hint: 'Dernière génération, plus précis', provider: 'openai' },
  { value: 'o4-mini', label: 'o4-mini', hint: 'Raisonnement léger', provider: 'openai' },
  { value: 'o3-mini', label: 'o3-mini', hint: 'Raisonnement avancé', provider: 'openai' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', hint: 'Recommandé — inspection, vision, rapports', provider: 'anthropic' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6', hint: 'Maximum de qualité (Claude 4)', provider: 'anthropic' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', hint: 'Rapide et économique (Claude 4)', provider: 'anthropic' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Rapide, vision incluse (Google)', provider: 'gemini' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Ultra rapide, vision incluse (Google)', provider: 'gemini' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', hint: 'Très puissant pour le raisonnement', provider: 'gemini' },
  { value: 'grok-vision-beta', label: 'Grok Vision', hint: 'Analyse d\'image par xAI', provider: 'xai' },
];

export function normalizeAiModel(value) {
  const v = String(value ?? '').trim();
  return v || 'gpt-4o-mini';
}

export function isKnownAiModel(value) {
  const v = normalizeAiModel(value);
  return AI_MODEL_OPTIONS.some((m) => m.value === v);
}

/** HTML du sélecteur de modèle (Profil) */
export function aiModelSelectMarkup(currentModel, currentProvider, escapeAttr, escapeHtml) {
  const current = normalizeAiModel(currentModel);
  const provider = currentProvider || 'openai';
  const known = isKnownAiModel(current);
  const options = AI_MODEL_OPTIONS.filter(m => m.provider === provider).map((m) => {
    const label = m.hint ? `${m.label} — ${m.hint}` : m.label;
    return `<option value="${escapeAttr(m.value)}" ${current === m.value ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');

  return `
    <label id="ai-model-label">Modèle
      <select class="input" name="aiModel" id="ai-model-select">
        ${options}
        <option value="__custom__" ${!known ? 'selected' : ''}>Autre modèle (saisie manuelle)…</option>
      </select>
    </label>
    <label id="ai-model-custom-wrap" class="ai-model-custom" ${known ? 'hidden' : ''}>
      Identifiant du modèle personnalisé
      <input class="input" type="text" name="aiModelCustom" id="ai-model-custom" value="${escapeAttr(known ? '' : current)}" placeholder="Identifiant API" autocomplete="off" />
    </label>
    <p class="form-hint form-hint--compact" id="ai-model-hint">${escapeHtml(modelHintLabel(current))}</p>`;
}

export function modelHintLabel(modelId) {
  const known = AI_MODEL_OPTIONS.find((m) => m.value === modelId);
  if (known) return `Modèle actif : ${known.label}. ${known.hint || ''}`;
  return `Modèle actif : ${modelId}`;
}

export function resolveProfileAiModel(formData) {
  const picked = formData.get('aiModel');
  if (picked === '__custom__') {
    return normalizeAiModel(formData.get('aiModelCustom'));
  }
  return normalizeAiModel(picked);
}

export function bindAiModelSelect() {
  const select = document.getElementById('ai-model-select');
  const customWrap = document.getElementById('ai-model-custom-wrap');
  const customInput = document.getElementById('ai-model-custom');
  const hint = document.getElementById('ai-model-hint');
  if (!select || !customWrap) return;

  const sync = () => {
    const isCustom = select.value === '__custom__';
    customWrap.hidden = !isCustom;
    if (isCustom) customInput?.focus();
    const model = isCustom ? normalizeAiModel(customInput?.value) : normalizeAiModel(select.value);
    if (hint) hint.textContent = modelHintLabel(model);
  };

  select.addEventListener('change', sync);
  customInput?.addEventListener('input', sync);
  
  const providerSelect = document.getElementById('ai-provider-select');
  if (providerSelect) {
    providerSelect.addEventListener('change', () => {
      const p = providerSelect.value;
      const opts = AI_MODEL_OPTIONS.filter(m => m.provider === p).map((m) => {
        const label = m.hint ? `${m.label} — ${m.hint}` : m.label;
        return `<option value="${m.value}">${label}</option>`;
      }).join('');
      select.innerHTML = opts + `<option value="__custom__">Autre modèle (saisie manuelle)…</option>`;
      sync();
    });
  }
  
  sync();
}
