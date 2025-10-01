/* ====== MAPEO DE IMÁGENES ====== */
const PACKS = {
  frescura: { title:'Frescura', front:'assets/frescura-front.png', back:'assets/frescura-back.png' },
  calma:    { title:'Calma',    front:'assets/calma-front.png',    back:'assets/calma-back.png'   },
  energia:  { title:'Energía',  front:'assets/energia-front.png',  back:'assets/energia-back.png' },
};

/* ====== REFERENCIAS ====== */
const dialog      = document.getElementById('modal');
const flipScene   = document.getElementById('flipScene');
const flipCard    = document.getElementById('flipCard');
const imgFront    = document.getElementById('imgFront');
const imgBack     = document.getElementById('imgBack');
const flipLoading = document.getElementById('flipLoading');
const svg         = document.getElementById('portada');

let currentKey = null;

/* ====== HELPERS ====== */
function waitFor(img){
  return new Promise(res => {
    if (img.complete && img.naturalWidth) return res();
    const done = () => { img.onload = img.onerror = null; res(); };
    img.onload = done; img.onerror = done;
  });
}

/* Ancho real de la portada (SVG renderizado) */
function getPortadaWidth(){
  const box = svg.getBoundingClientRect();
  return Math.max(1, Math.round(box.width));
}

/* Ajustar modal para que mida EXACTAMENTE lo mismo que la portada */
function syncModalSize(){
  const w = getPortadaWidth();
  // ancho
  flipScene.style.width = w + 'px';
  // alto según proporción de la imagen frontal (fallback 2000/1414)
  const ratio = (imgFront.naturalHeight && imgFront.naturalWidth)
    ? (imgFront.naturalHeight / imgFront.naturalWidth)
    : (2000/1414);
  flipScene.style.height = Math.round(w * ratio) + 'px';
}

/* ====== ABRIR / CERRAR MODAL ====== */
async function openPack(key){
  currentKey = key;
  const p = PACKS[key];

  flipLoading.style.display = 'grid';
  flipCard.classList.remove('is-flipped');

  // Setear ambas caras
  imgFront.src = p.front; imgFront.alt = `${p.title} – frente`;
  imgBack.src  = p.back;  imgBack.alt  = `${p.title} – reverso`;

  // Abrir primero para tener layout real
  dialog.showModal();

  // Esperar cargas y luego igualar tamaño al de la portada
  await Promise.all([waitFor(imgFront), waitFor(imgBack)]);
  syncModalSize();

  flipLoading.style.display = 'none';
}

function closeModal(){
  flipCard.classList.remove('is-flipped');
  imgFront.src = ''; imgBack.src = '';
  currentKey = null;
  dialog.close();
}

/* ====== INTERACCIÓN DEL FLIP ====== */
function toggleFlip(){
  if (!dialog.open || !currentKey) return;
  flipCard.classList.toggle('is-flipped');
}
flipScene.addEventListener('click', toggleFlip);
flipScene.addEventListener('keydown', e => {
  if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleFlip(); }
});
flipScene.tabIndex = 0;

/* ====== MODAL: ESC ====== */
dialog.addEventListener('cancel', e => { e.preventDefault(); closeModal(); });

/* ====== PORTADA: HOTSPOTS ====== */
svg.querySelectorAll('a[data-pack]').forEach(a=>{
  a.addEventListener('click', e => {
    e.preventDefault();
    openPack(a.getAttribute('data-pack'));
  });
});

/* Re-sincronizar si cambia el layout (rotación/resize) mientras está abierto */
window.addEventListener('resize', () => {
  if (dialog.open) syncModalSize();
});
