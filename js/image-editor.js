/** Éditeur d'image pour annoter (cercles, flèches, dessin) */

export function openImageEditor(originalDataUrl, onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.85)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.padding = '1rem';

  const toolbar = document.createElement('div');
  toolbar.style.display = 'flex';
  toolbar.style.gap = '0.5rem';
  toolbar.style.marginBottom = '1rem';
  toolbar.style.background = '#fff';
  toolbar.style.padding = '0.5rem';
  toolbar.style.borderRadius = '8px';
  toolbar.style.flexWrap = 'wrap';

  let currentColor = 'red';
  let currentTool = 'freehand';

  const btnStyle = 'padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f8fafc; font-weight: bold;';
  
  const btnFreehand = document.createElement('button');
  btnFreehand.textContent = '✏️ Dessin';
  btnFreehand.style.cssText = btnStyle + ' background: #e2e8f0;';
  
  const btnArrow = document.createElement('button');
  btnArrow.textContent = '↗️ Flèche';
  btnArrow.style.cssText = btnStyle;

  const btnCircle = document.createElement('button');
  btnCircle.textContent = '⭕ Cercle';
  btnCircle.style.cssText = btnStyle;

  const colorRed = document.createElement('button');
  colorRed.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 3px solid #000; background: red; cursor: pointer;';
  const colorYellow = document.createElement('button');
  colorYellow.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background: yellow; cursor: pointer;';
  const colorBlue = document.createElement('button');
  colorBlue.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background: blue; cursor: pointer;';

  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Annuler';
  btnCancel.style.cssText = btnStyle;

  const btnSave = document.createElement('button');
  btnSave.textContent = '💾 Enregistrer';
  btnSave.style.cssText = btnStyle + ' background: #22c55e; color: white; border: none;';

  toolbar.append(btnFreehand, btnArrow, btnCircle, colorRed, colorYellow, colorBlue, btnCancel, btnSave);
  
  const canvasContainer = document.createElement('div');
  canvasContainer.style.flex = '1';
  canvasContainer.style.position = 'relative';
  canvasContainer.style.maxWidth = '100%';
  canvasContainer.style.overflow = 'hidden';
  canvasContainer.style.display = 'flex';
  canvasContainer.style.alignItems = 'center';
  canvasContainer.style.justifyContent = 'center';

  const canvas = document.createElement('canvas');
  canvas.style.maxWidth = '100%';
  canvas.style.maxHeight = '100%';
  canvas.style.objectFit = 'contain';
  canvas.style.cursor = 'crosshair';
  canvasContainer.append(canvas);

  overlay.append(toolbar, canvasContainer);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  let isDrawing = false;
  let startX = 0, startY = 0;
  let snapshot = null;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.onerror = () => {
    overlay.remove();
    alert('Impossible de charger la photo pour annotation.');
  };
  img.src = originalDataUrl;

  function setTool(t, btn) {
    currentTool = t;
    btnFreehand.style.background = '#f8fafc';
    btnArrow.style.background = '#f8fafc';
    btnCircle.style.background = '#f8fafc';
    btn.style.background = '#e2e8f0';
  }

  function setColor(c, btn) {
    currentColor = c;
    colorRed.style.border = '1px solid #ccc';
    colorYellow.style.border = '1px solid #ccc';
    colorBlue.style.border = '1px solid #ccc';
    btn.style.border = '3px solid #000';
  }

  btnFreehand.onclick = () => setTool('freehand', btnFreehand);
  btnArrow.onclick = () => setTool('arrow', btnArrow);
  btnCircle.onclick = () => setTool('circle', btnCircle);

  colorRed.onclick = () => setColor('red', colorRed);
  colorYellow.onclick = () => setColor('yellow', colorYellow);
  colorBlue.onclick = () => setColor('blue', colorBlue);

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function drawArrow(context, fromx, fromy, tox, toy) {
    const headlen = 20; 
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
  }

  function drawCircle(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
  }

  function startPosition(e) {
    isDrawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = Math.max(4, canvas.width / 150);
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    if (currentTool === 'freehand') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      draw(e);
    }
  }

  function endPosition() {
    isDrawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === 'freehand') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (currentTool === 'arrow') {
      ctx.putImageData(snapshot, 0, 0);
      drawArrow(ctx, startX, startY, pos.x, pos.y);
    } else if (currentTool === 'circle') {
      ctx.putImageData(snapshot, 0, 0);
      const radius = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
      drawCircle(ctx, startX, startY, radius);
    }
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchstart', startPosition, { passive: false });
  canvas.addEventListener('touchend', endPosition);
  canvas.addEventListener('touchmove', draw, { passive: false });

  btnCancel.onclick = () => {
    document.body.removeChild(overlay);
  };

  btnSave.onclick = () => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    document.body.removeChild(overlay);
    onSave(dataUrl);
  };
}
