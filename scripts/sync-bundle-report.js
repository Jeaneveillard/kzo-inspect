/**
 * One-off sync: report-layout.js, report.js, norm-texts.js -> bundle.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bundlePath = path.join(root, 'js', 'bundle.js');
let b = fs.readFileSync(bundlePath, 'utf8').replace(/^\uFEFF/, '');

function stripModuleSyntax(src) {
  return src
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n/gm, '')
    .replace(/^export\s+(const|function|async function)\s+/gm, '$1 ')
    .replace(/^export\s+\{[^}]+\};?\s*\n/gm, '')
    .replace(/^export\s+default\s+/gm, '');
}

function indentBundle(src) {
  return src
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : '  ' + line))
    .join('\n');
}

// 1. norm-texts
const normSrc = fs.readFileSync(path.join(root, 'js', 'norm-texts.js'), 'utf8');
let normBody = stripModuleSyntax(normSrc);
normBody = normBody.replace(/function escapeHtml\([\s\S]*?^}\n\n/m, '');
normBody = normBody.replace(/\bescapeHtml\b/g, 'escapeHtml5');
const normBlock = '  // js/norm-texts.js\n' + indentBundle(normBody).trimEnd() + '\n\n';

const normStart = b.indexOf('  // js/norm-texts.js');
const normEnd = b.indexOf('  // js/receipt-inspection.js');
if (normStart < 0 || normEnd < 0) throw new Error('norm-texts markers not found');
b = b.slice(0, normStart) + normBlock + b.slice(normEnd);

// 2. report-layout (before report.js)
const layoutSrc = fs.readFileSync(path.join(root, 'js', 'report-layout.js'), 'utf8');
let layoutBody = stripModuleSyntax(layoutSrc);
layoutBody = layoutBody
  .replace(/function escapeHtml\([\s\S]*?^}\n\n/m, '')
  .replace(/function stripNumbering\([\s\S]*?^}\n\n/m, '');
const layoutBlock = '  // js/report-layout.js\n' + indentBundle(layoutBody).trimEnd() + '\n\n';

const layoutStart = b.indexOf('  // js/report-layout.js');
const reportStart = b.indexOf('  // js/report.js');
if (layoutStart < 0 || reportStart < 0) throw new Error('report-layout or report.js marker not found');
b = b.slice(0, layoutStart) + layoutBlock + b.slice(reportStart);

// 3. report.js section updates
const reportSrc = fs.readFileSync(path.join(root, 'js', 'report.js'), 'utf8');
let reportBody = stripModuleSyntax(reportSrc);
reportBody = reportBody
  .replace(/\bescapeHtml\b/g, 'escapeHtml7')
  .replace(/\bstripNumbering\b/g, 'stripNumbering2');
reportBody = reportBody.replace(/function statusLabel\(value\)[\s\S]*?^}\n\n/m, '');
reportBody = reportBody.replace(/function renderReportItemRows[\s\S]*?^}\n\n/m, '');
reportBody = reportBody.replace(
  /buildPaginatedSectionsHtml\(inspection, statusLabel,/g,
  'buildPaginatedSectionsHtml(inspection, statusLabel2,',
);

const statusLabel2Fn = `function statusLabel2(value) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? "\\u2014";
}
`;
const reportBlock =
  '  // js/report.js\n' +
  indentBundle(statusLabel2Fn + reportBody).trimEnd() +
  '\n\n';

const reportJsStart = b.indexOf('  // js/report.js');
const reportEnd = b.indexOf('  // js/thank-you-letter.js');
if (reportJsStart < 0 || reportEnd < 0) throw new Error('report.js end marker not found');
b = b.slice(0, reportJsStart) + reportBlock + b.slice(reportEnd);

fs.writeFileSync(bundlePath, b, 'utf8');
console.log('bundle.js synced OK');
