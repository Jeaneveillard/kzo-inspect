/** Stockage local des documents client (IndexedDB) */

export const FILE_CATEGORIES = [
  { value: 'bv', label: 'Bon de visite (BV)' },
  { value: 'convention', label: 'Convention de service' },
  { value: 'declaration', label: 'Déclaration du vendeur' },
  { value: 'mandat', label: 'Mandat / autorisation' },
  { value: 'plan', label: 'Plans, certificats, études' },
  { value: 'rbq', label: 'RBQ / permis / assurance' },
  { value: 'courtier', label: 'Documents courtier' },
  { value: 'photo-doc', label: 'Photos documentaires' },
  { value: 'autre', label: 'Autre' },
];

const DB_NAME = 'kzo_inspect_files_v1';
const STORE = 'blobs';
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 Mo par fichier

const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|webp|gif|txt|csv|mp4|mov|heic)$/i;
const BLOCKED_EXTENSIONS = /\.(html|htm|svg|xml|xhtml|js|mjs|ts|json|exe|bat|sh|php|py)$/i;

let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('inspectionId', 'inspectionId', { unique: false });
        }
      };
    });
  }
  return dbPromise;
}

export function categoryLabel(value) {
  return FILE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 o';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export async function listClientFiles(inspectionId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const index = store.index('inspectionId');
    const req = index.getAll(inspectionId);
    req.onsuccess = () => {
      const rows = (req.result ?? []).map(({ id, inspectionId: iid, name, category, mimeType, size, uploadedAt, note }) => ({
        id,
        inspectionId: iid,
        name,
        category,
        mimeType,
        size,
        uploadedAt,
        note,
      }));
      rows.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getClientFileBlob(fileId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(fileId);
    req.onsuccess = () => {
      const row = req.result;
      if (!row) resolve(null);
      else resolve({ meta: row, blob: row.blob });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addClientFile(inspectionId, file, { category = 'autre', note = '' } = {}) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`Fichier trop volumineux (max ${formatFileSize(MAX_FILE_BYTES)}).`);
  }

  const fileName = file.name || '';
  if (BLOCKED_EXTENSIONS.test(fileName)) {
    throw new Error(`Type de fichier non autorisé : ${fileName}`);
  }
  if (!ALLOWED_EXTENSIONS.test(fileName)) {
    throw new Error(`Extension non reconnue : ${fileName}`);
  }

  const id = crypto.randomUUID();
  const record = {
    id,
    inspectionId,
    name: file.name,
    category,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    note,
    blob: file,
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () =>
      resolve({
        id,
        inspectionId,
        name: record.name,
        category: record.category,
        mimeType: record.mimeType,
        size: record.size,
        uploadedAt: record.uploadedAt,
        note: record.note,
      });
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateClientFileMeta(fileId, { category, note }) {
  const db = await openDb();
  const existing = await getClientFileBlob(fileId);
  if (!existing) throw new Error('Fichier introuvable');

  const record = {
    ...existing.meta,
    category: category ?? existing.meta.category,
    note: note ?? existing.meta.note,
    blob: existing.blob,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteClientFile(fileId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllClientFiles(inspectionId) {
  const files = await listClientFiles(inspectionId);
  await Promise.all(files.map((f) => deleteClientFile(f.id)));
}

export async function downloadClientFile(fileId) {
  const data = await getClientFileBlob(fileId);
  if (!data) return;
  const url = URL.createObjectURL(data.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.meta.name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function openClientFile(fileId) {
  const data = await getClientFileBlob(fileId);
  if (!data) return;
  const url = URL.createObjectURL(data.blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function getTotalSize(inspectionId) {
  const files = await listClientFiles(inspectionId);
  return files.reduce((sum, f) => sum + (f.size || 0), 0);
}
