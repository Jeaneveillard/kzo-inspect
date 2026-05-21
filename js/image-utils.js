/** Compression d'images pour stockage local */

export function compressImage(file, maxW = 1200, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        c.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Réduit une image base64 avant envoi à l'API vision (limite de taille). */
export function shrinkDataUrl(dataUrl, maxW = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxW) {
        height = (height * maxW) / width;
        width = maxW;
      }
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = dataUrl;
  });
}

/**
 * Valide une URL d'image avant usage dans un attribut src.
 * Accepte : data URLs raster (jpeg/png/webp/gif) et chemins relatifs assets/.
 * Rejette : SVG (peut contenir <script>), URLs arbitraires, chaînes malveillantes.
 * Retourne '' si invalide.
 */
export function safeImgSrc(value) {
  if (!value || typeof value !== 'string') return '';
  // data URL raster uniquement
  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
  // Chemins relatifs assets (logo app, icônes)
  if (/^\.\/assets\/[a-zA-Z0-9._/-]+\.(png|jpg|jpeg|webp|gif|ico)$/.test(value)) return value;
  // URL https vers domaines de confiance (Google user photos, etc.)
  if (/^https:\/\/[a-zA-Z0-9.-]+\.(googleapis\.com|googleusercontent\.com)\//.test(value)) return value;
  console.warn('[Security] safeImgSrc: URL rejetée :', value.substring(0, 80));
  return '';
}
