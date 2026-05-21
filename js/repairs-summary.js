/** Sommaire des reparations — items NC / AC collectes, formates et presentes dans une dialog */

import { iterSectionItems } from './section-structure.js';
import { presetLabel } from './quick-responses.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────────────────────────── */

const PRIORITY_ORDER = { critique: 0, majeur: 1, mineur: 2 };

function priorityRank(p) {
  return PRIORITY_ORDER[p] ?? 99;
}

const LABEL_NUM_RE = /^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i;

function cleanLabel(label) {
  return (label || '').replace(LABEL_NUM_RE, '').trim();
}

/** Echappe les caracteres HTML dangereux pour les attributs data-* */
function rmEscHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. getRepairItems(inspection)
──────────────────────────────────────────────────────────────────────────────── */

export function getRepairItems(inspection) {
  const results = [];

  (inspection?.sections || []).forEach((sec) => {
    iterSectionItems(sec, (item) => {
      if (item.status !== 'non-conforme' && item.status !== 'a-corriger') return;

      const presets = (item.selectedPresets || []).map(presetLabel).filter(Boolean);
      const comment = (item.inspectorComment || '').trim();

      // Exclure les items sans documentation
      if (presets.length === 0 && !comment) return;

      results.push({
        sectionTitle: sec.title || '',
        label: item.label || '',
        status: item.status,
        priority: item.priority || '',
        presets,
        comment,
      });
    });
  });

  results.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));

  return results;
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. formatRepairItem(item)
──────────────────────────────────────────────────────────────────────────────── */

export function formatRepairItem(item) {
  const statusTag = item.status === 'non-conforme' ? 'NC' : 'AC';
  const priorityTag = item.priority ? item.priority.toUpperCase() : '';
  const prefix = priorityTag ? `[${statusTag} - ${priorityTag}]` : `[${statusTag}]`;

  const labelLine = `${prefix} ${item.sectionTitle}`;
  const labelClean = cleanLabel(item.label);

  const lines = [labelLine];

  if (item.presets.length > 0 && item.comment) {
    lines.push(`${labelClean} : ${item.presets.join(' · ')}`);
    lines.push(item.comment);
  } else if (item.presets.length > 0) {
    lines.push(`${labelClean} : ${item.presets.join(' · ')}`);
  } else {
    lines.push(`${labelClean} : ${item.comment}`);
  }

  return lines.join('\n');
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. initRepairsModal({ toast } = {})
──────────────────────────────────────────────────────────────────────────────── */

export function initRepairsModal({ toast } = {}) {
  // Supprimer toute dialog existante
  const existing = document.getElementById('repairs-modal');
  if (existing) existing.remove();

  const dlg = document.createElement('dialog');
  dlg.id = 'repairs-modal';

  dlg.innerHTML = [
    '<div class="rm-header">',
    '  <span class="rm-header__title">&#x1F527; Sommaire des Reparations</span>',
    '  <span class="rm-header__count" id="rm-count"></span>',
    '  <button type="button" class="rm-close" id="rm-close" aria-label="Fermer">&#x00D7;</button>',
    '</div>',
    '<div class="rm-list" id="rm-list"></div>',
    '<div class="rm-footer">',
    '  <button type="button" class="btn btn--ghost" id="rm-cancel">Fermer</button>',
    '  <button type="button" class="btn btn--primary" id="rm-copy">&#x1F4CB; Copier le resume</button>',
    '</div>',
  ].join('');

  document.body.appendChild(dlg);

  function doToast(msg, type) {
    if (typeof toast === 'function') {
      toast(msg, type);
    } else if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      // Fallback minimal
      console.info('[repairs-modal]', type, msg);
    }
  }

  dlg.querySelector('#rm-close').addEventListener('click', () => dlg.close());
  dlg.querySelector('#rm-cancel').addEventListener('click', () => dlg.close());

  dlg.querySelector('#rm-copy').addEventListener('click', () => {
    const checked = Array.from(dlg.querySelectorAll('.rm-item__check:checked'));
    if (checked.length === 0) {
      doToast('Aucun item selectionne.', 'warn');
      return;
    }
    const text = checked.map((cb) => cb.dataset.rmText).join('\n\n');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        doToast('✓ Resume copie !', 'success');
        dlg.close();
      })
      .catch(() => doToast('Erreur de copie — reessayez.', 'error'));
  });

  function priorityEmoji(priority) {
    switch (priority) {
      case 'critique': return '🔴';  // 🔴
      case 'majeur':   return '🟠';  // 🟠
      case 'mineur':   return '🟡';  // 🟡
      default:         return '⚪';         // ⚪
    }
  }

  function buildItemHtml(item) {
    const statusTag   = item.status === 'non-conforme' ? 'NC' : 'AC';
    const priorityTag = item.priority ? item.priority.toUpperCase() : '';
    const badgeLabel  = priorityTag
      ? `${priorityEmoji(item.priority)} ${statusTag} - ${priorityTag}`
      : `${priorityEmoji(item.priority)} ${statusTag}`;
    const badgeMod    = item.priority || 'none';

    const labelClean  = cleanLabel(item.label);
    const preview     = item.presets.length > 0
      ? item.presets[0]
      : item.comment.length > 70
        ? item.comment.slice(0, 70) + '…'
        : item.comment;

    const formatted   = formatRepairItem(item);
    const escapedText = rmEscHtml(formatted);

    return [
      '<label class="rm-item">',
      `  <input type="checkbox" class="rm-item__check" checked data-rm-text="${escapedText}" />`,
      '  <div class="rm-item__body">',
      `    <span class="rm-item__badge rm-item__badge--${rmEscHtml(badgeMod)}">${badgeLabel}</span>`,
      `    <span class="rm-item__section">${rmEscHtml(item.sectionTitle)}</span>`,
      `    <span class="rm-item__label">${rmEscHtml(labelClean)} : ${rmEscHtml(preview)}</span>`,
      '  </div>',
      '</label>',
    ].join('');
  }

  window._openRepairsModal = function (inspection) {
    const items = getRepairItems(inspection);

    const ncCount = items.filter((i) => i.status === 'non-conforme').length;
    const acCount = items.filter((i) => i.status === 'a-corriger').length;
    const countEl = dlg.querySelector('#rm-count');
    countEl.textContent = `${items.length} defaut(s) · ${ncCount} NC · ${acCount} AC`;

    const listEl = dlg.querySelector('#rm-list');

    if (items.length === 0) {
      listEl.innerHTML =
        '<p class="rm-empty">Aucun defaut NC ou AC documente dans cette inspection.</p>';
    } else {
      listEl.innerHTML = items.map(buildItemHtml).join('');
    }

    dlg.showModal();
  };
}
