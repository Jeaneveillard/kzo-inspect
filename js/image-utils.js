/** Compression d'images pour stockage local */

/**
 * Lit l'orientation EXIF d'un fichier JPEG (tag 0x0112).
 * Retourne 1 (normal) si absent ou illisible.
 * Nécessaire pour corriger les photos iPhone qui arrivent pivotées 90°.
 */
function readExifOrientation(file) {
  return new Promise(function(resolve) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new DataView(e.target.result);
        if (data.getUint16(0, false) !== 0xFFD8) return resolve(1); // pas un JPEG
        let offset = 2;
        while (offset + 4 < data.byteLength) {
          const marker = data.getUint16(offset, false);
          const segLen = data.getUint16(offset + 2, false);
          if (marker === 0xFFE1) { // APP1 — contient EXIF
            if (data.getUint32(offset + 4, false) !== 0x45786966) break; // pas 'Exif'
            const tiff = offset + 10;
            const le = data.getUint16(tiff, false) === 0x4949; // little-endian?
            const ifd0 = tiff + data.getUint32(tiff + 4, le);
            const tags = data.getUint16(ifd0, le);
            for (let i = 0; i < tags; i++) {
              const p = ifd0 + 2 + i * 12;
              if (data.getUint16(p, le) === 0x0112) {
                return resolve(data.getUint16(p + 8, le));
              }
            }
            break;
          }
          if (marker === 0xFFDA) break; // début des données image, stop
          if (segLen < 2) break;
          offset += 2 + segLen;
        }
      } catch (_) {}
      resolve(1);
    };
    reader.onerror = function() { resolve(1); };
    reader.readAsArrayBuffer(file.slice(0, 131072)); // 128 Ko suffisent pour EXIF
  });
}

export function compressImage(file, maxW = 1200, quality = 0.72) {
  return readExifOrientation(file).then(function(orientation) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function() {
        const img = new Image();
        img.onerror = reject;
        img.onload = function() {
          // Orientations 5-8 nécessitent un échange largeur/hauteur du canvas
          const swap = orientation >= 5 && orientation <= 8;
          const rawW = img.width, rawH = img.height;
          const dispW = swap ? rawH : rawW;
          const dispH = swap ? rawW : rawH;
          const scale = dispW > maxW ? maxW / dispW : 1;
          const cW = Math.round(dispW * scale);
          const cH = Math.round(dispH * scale);
          const drawW = Math.round(rawW * scale);
          const drawH = Math.round(rawH * scale);
          const c = document.createElement('canvas');
          c.width = cW;
          c.height = cH;
          const ctx = c.getContext('2d');
          ctx.save();
          // Applique la rotation EXIF avant de dessiner
          switch (orientation) {
            case 2: ctx.translate(cW, 0);  ctx.scale(-1, 1);         break; // miroir H
            case 3: ctx.translate(cW, cH); ctx.rotate(Math.PI);      break; // 180°
            case 4: ctx.translate(0, cH);  ctx.scale(1, -1);         break; // miroir V
            case 6: ctx.translate(cW, 0);  ctx.rotate(0.5 * Math.PI);  break; // 90° CW (iPhone portrait)
            case 8: ctx.translate(0, cH);  ctx.rotate(-0.5 * Math.PI); break; // 90° CCW
          }
          ctx.drawImage(img, 0, 0, drawW, drawH);
          ctx.restore();
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
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
