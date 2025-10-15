// ====== configuration loaded from js/config.js =====
// js/config.js should set window.PAYPAL_ME_USERNAME
const PAYPAL_ME_USERNAME = (window.PAYPAL_ME_USERNAME || 'https://www.paypal.me/YousefAzizi608');
// optional Discord invite config (set window.DISCORD_INVITE in js/config.js)
const DISCORD_INVITE = (window.DISCORD_INVITE || 'https://discord.gg/hC8n8yFpUa');
// ====== animazione canvas background (gradient animato senza particelle) =====
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
// snow canvas (subtle grey flakes behind UI)
const snowCanvas = document.getElementById('snow');
const sctx = snowCanvas ? snowCanvas.getContext('2d') : null;
function resize(){canvas.width = innerWidth; canvas.height = innerHeight}
function resizeAll(){
  canvas.width = innerWidth; canvas.height = innerHeight;
  if(snowCanvas){ snowCanvas.width = innerWidth; snowCanvas.height = innerHeight; }
}
addEventListener('resize', resizeAll); resizeAll();

let phase = 0;
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // moving diagonal gradient (rosso/nero) that slowly shifts
  const g = ctx.createLinearGradient(0 + Math.sin(phase)*200, 0, canvas.width + Math.cos(phase)*200, canvas.height);
  g.addColorStop(0, '#0b0000');
  g.addColorStop(0.25, '#2a0000');
  g.addColorStop(0.5, '#4a0b0b');
  g.addColorStop(0.75, '#5a0d0d');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // soft animated vignette
  const vignette = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.2, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
  vignette.addColorStop(0, 'rgba(255,255,255,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  phase += 0.002;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ===== Snow particles =====
const snowflakes = [];
const SNOW_COUNT = 40; // subtle
function initSnow(){
  if(!sctx) return;
  snowflakes.length = 0;
  for(let i=0;i<SNOW_COUNT;i++){
    snowflakes.push({x:Math.random()*snowCanvas.width, y:Math.random()*snowCanvas.height, r:Math.random()*2+0.8, vx:(Math.random()-0.5)*0.3, vy:Math.random()*0.6+0.3, a:Math.random()*0.9+0.1});
  }
}
function drawSnow(){
  if(!sctx) return;
  sctx.clearRect(0,0,snowCanvas.width,snowCanvas.height);
  sctx.fillStyle = 'rgba(200,200,200,0.85)';
  for(const f of snowflakes){
    sctx.beginPath();
    sctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    sctx.fill();
    f.x += f.vx;
    f.y += f.vy;
    if(f.y > snowCanvas.height + 10){ f.y = -10; f.x = Math.random()*snowCanvas.width; }
    if(f.x < -20) f.x = snowCanvas.width + 20;
    if(f.x > snowCanvas.width +20) f.x = -20;
  }
}
initSnow();
function loopSnow(){ drawSnow(); requestAnimationFrame(loopSnow); }
requestAnimationFrame(loopSnow);

// ====== cursore intelligente: alone rosso/nero che segue il puntatore =====
const trail = document.getElementById('cursorTrail');
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
let haloX = mouseX, haloY = mouseY;

// crea l'alone del cursore
const halo = document.createElement('div');
halo.className = 'cursor-halo';
halo.style.opacity = '0';
trail.appendChild(halo);

function setHaloAppearanceForCursor(cursor) {
  // default appearance
  let size = 30;
  let inner = 'rgba(226,15,15,0.85)';
  let outer = 'rgba(10,4,4,0.18)';

  if (!cursor) cursor = 'auto';
  cursor = String(cursor).toLowerCase();
  if (cursor.includes('pointer')) {
    size = 44;
    inner = 'rgba(255,100,100,0.95)';
    outer = 'rgba(200,20,20,0.22)';
  } else if (cursor.includes('text') || cursor.includes('i-beam')) {
    size = 24;
    inner = 'rgba(200,60,60,0.9)';
    outer = 'rgba(20,6,6,0.12)';
  } else if (cursor.includes('wait') || cursor.includes('progress')) {
    size = 36;
    inner = 'rgba(255,140,100,0.95)';
    outer = 'rgba(120,20,20,0.2)';
  } else {
    // default/auto
    size = 30;
    inner = 'rgba(226,15,15,0.85)';
    outer = 'rgba(10,4,4,0.16)';
  }

  halo.style.width = size + 'px';
  halo.style.height = size + 'px';
  halo.style.background = `radial-gradient(circle at 40% 35%, ${inner}, ${outer})`;
}

// aggiorna posizione target e aspetto in base al cursore dell'elemento sotto il puntatore
addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // detect computed cursor style of element under point
  const el = document.elementFromPoint(mouseX, mouseY);
  let cursorStyle = 'auto';
  try { if (el) cursorStyle = getComputedStyle(el).cursor || 'auto'; } catch (err) { cursorStyle = 'auto'; }
  setHaloAppearanceForCursor(cursorStyle);
  halo.style.opacity = '1';
});

addEventListener('mouseleave', ()=>{ halo.style.opacity='0' });
addEventListener('mouseenter', ()=>{ halo.style.opacity='1' });

// animazione fluida dell'alone (lerp)
function animateHalo(){
  haloX += (mouseX - haloX) * 0.18;
  haloY += (mouseY - haloY) * 0.18;
  halo.style.left = haloX + 'px';
  halo.style.top = haloY + 'px';
  requestAnimationFrame(animateHalo);
}
requestAnimationFrame(animateHalo);

// ====== titolo animato (letter by letter) =====
const title = document.getElementById('title');
(function animateTitle(){
  const text = title.textContent.trim();
  title.textContent = '';
  for(let i=0;i<text.length;i++){
    const span = document.createElement('span');
    span.textContent = text[i];
    span.style.opacity = '0';
    span.style.display = 'inline-block';
    span.style.transform = 'translateY(8px)';
    span.style.transition = `all 500ms cubic-bezier(.2,.9,.3,1) ${i*60}ms`;
    title.appendChild(span);
    setTimeout(()=>{span.style.opacity='1'; span.style.transform='translateY(0)';}, 50+ i*60);
  }
})();

// ====== carrello semplice in localStorage =====
const cartKey = 'yixas_cart_v1';
function loadCart(){try{return JSON.parse(localStorage.getItem(cartKey))||[]}catch(e){return []}}
function saveCart(c){localStorage.setItem(cartKey,JSON.stringify(c))}
let cart = loadCart();

const cartCount = document.getElementById('cartCount');
const cartBtn = document.getElementById('cartBtn');
const cartDropdown = document.getElementById('cartDropdown');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

function renderCart(){
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach((it,idx)=>{
    const li = document.createElement('li');
    li.style.listStyle='none';
    li.style.padding='8px 6px';
    li.style.display='flex'; li.style.justifyContent='space-between'; li.style.alignItems='center';
    li.innerHTML = `<span>${it.name} x${it.qty}</span><span>€${(it.price*it.qty).toFixed(2)}</span>`;
    const rem = document.createElement('button'); rem.textContent='×'; rem.style.marginLeft='8px'; rem.className='round-btn'; rem.style.padding='6px';
    rem.onclick = ()=>{cart.splice(idx,1); saveCart(cart); renderCart()};
    li.appendChild(rem);
    cartItemsEl.appendChild(li);
    total += it.price*it.qty;
  });
  cartTotalEl.textContent = `Total: €${total.toFixed(2)}`;
}
renderCart();

// Open dedicated cart page when clicking Cart button (keeps dropdown as fallback)
cartBtn.onclick = ()=>{ window.location.href = 'cart.html' }

// Discord quick-join button behavior
const discordBtn = document.getElementById('discordBtn');
if(discordBtn){
  discordBtn.addEventListener('click', ()=>{
    // open invite in new tab
    const url = DISCORD_INVITE;
    try{ window.open(url, '_blank'); }catch(e){ window.location.href = url }
  });
}

// Community animation: arch -> launch arrow -> impact on discord icon
function runCommunityAnimation(){
  const overlay = document.getElementById('communityOverlay');
  const flying = document.getElementById('arrowTrail');
  const discord = document.querySelector('.discord-btn');
  if(!overlay || !flying || !discord) return;
  // find footer Community button
  const footerCommunityBtn = document.querySelector('.footer-link[data-target="community"]');
  if(!footerCommunityBtn) return;
  // compute start position (center of the Community button)
  const btnRect = footerCommunityBtn.getBoundingClientRect();
  // try to compute the text bounds (so the animation starts from the word 'Community')
  let startRect = btnRect;
  try{
    const textNode = Array.from(footerCommunityBtn.childNodes).find(n=>n.nodeType===3 && n.textContent && n.textContent.trim());
    if(textNode){
      const rng = document.createRange(); rng.selectNode(textNode);
      const r = rng.getBoundingClientRect(); if(r && r.width>0) startRect = r;
    }
  }catch(e){ /* fallback to whole button */ }
  const startX = startRect.left + startRect.width/2;
  const startY = startRect.top + startRect.height/2;
  // compute end position (center of Discord icon)
  const dRect = discord.getBoundingClientRect();
  const endX = dRect.left + dRect.width/2;
  const endY = dRect.top + dRect.height/2;

  // show overlay and position flying text at start using transform
  overlay.classList.remove('hidden');
  flying.style.display = 'block';
  flying.style.opacity = '1';
  // ensure the element is positioned at top-left of viewport so translate(x,y) maps to viewport coords
  flying.style.left = '0px';
  flying.style.top = '0px';
  // small offset so text doesn't overlap button too much (use small horizontal offset)
  const offsetX = 0; const offsetY = -6;
  // set initial transform to the start coordinates (text-centered)
  flying.style.transform = `translate(${startX + offsetX}px, ${startY + offsetY}px)`;
  // give it the slow-move class for a smooth, slow transition (CSS handles transform)
  flying.classList.add('slow-move');

  // animate along a quadratic Bezier curve with requestAnimationFrame for a curved path
  requestAnimationFrame(()=>{
  const duration = 3200; // ms (slower for readability)
    const startTime = performance.now();
    const endOffsetX = -20; const endOffsetY = -12;
    // control point above the two points to create an arc; make it scale with horizontal distance
    const cx = (startX + endX) / 2;
    const cy = Math.min(startY, endY) - Math.max(120, Math.abs(endX - startX) * 0.6);
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
    function step(now){
      const elapsed = now - startTime;
      const tRaw = Math.min(1, elapsed / duration);
      const t = easeOutCubic(tRaw);
      // quadratic bezier interpolation
      const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * cx + Math.pow(t, 2) * endX;
      const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * cy + Math.pow(t, 2) * endY;
      flying.style.transform = `translate(${x + offsetX}px, ${y + offsetY}px)`;
      if (tRaw < 1) requestAnimationFrame(step);
      else {
        // impact effect on discord
        discord.classList.remove('discord-impact'); void discord.offsetWidth; discord.classList.add('discord-impact');
        // fade out flying text slowly
        flying.style.opacity = '0';
        setTimeout(()=>{ flying.style.display = 'none'; overlay.classList.add('hidden'); flying.style.opacity = '1'; }, 800);
      }
    }
    requestAnimationFrame(step);
  });
}

// wire the community footer button to run the animation as well
document.querySelectorAll('.footer-link').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    if(btn.dataset.target === 'community'){
      // run the animation in addition to previous behavior
      setTimeout(()=>{ runCommunityAnimation(); }, 120); // slight delay so scroll/focus happens first
    }
  });
});

// add buttons
for(const btn of document.querySelectorAll('.addBtn')){
  btn.onclick = (e)=>{
    const card = e.currentTarget.closest('.product');
    const name = card.querySelector('h2').textContent;
    // card may not show a visible .price element; fall back to data-price attribute
    let price = 0;
    const priceEl = card.querySelector('.price');
    if(priceEl){
      price = parseFloat(priceEl.textContent.replace('€','')) || 0;
    } else {
      price = parseFloat(card.dataset.price || '0') || 0;
    }
    const existing = cart.find(c=>c.name===name);
    if(existing) existing.qty++;
    else cart.push({name,price,qty:1});
    saveCart(cart); renderCart();
    // bounce animation
    e.currentTarget.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:300});
    // bump cart button for feedback
    cartBtn.classList.remove('cart-bump');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('cart-bump');
    // pulse the product card briefly
    card.classList.remove('product-add-pulse');
    void card.offsetWidth;
    card.classList.add('product-add-pulse');
    // save last added product name so cart page can animate its row on load
    try{ localStorage.setItem('yixas_last_added', name); }catch(e){/* ignore */}
  }
}

// ====== checkout -> redirect to PayPal.me with total amount =====
checkoutBtn.onclick = ()=>{
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  if(total<=0) return alert('Your cart is empty');
  if(PAYPAL_ME_USERNAME === 'YOUR_PAYPAL_ME'){
    // warn user to set username
    if(!confirm('WARNING: you have not set your PayPal.me username in the config. Continue to test with €5?')) return;
  }
  // PayPal.me url: https://www.paypal.me/USERNAME/AMOUNT
  const amount = total.toFixed(2);
  const url = `https://www.paypal.me/${PAYPAL_ME_USERNAME}/${amount}`;
  // redirect
  window.location.href = url;
}

// small UX: close dropdown on outside click
addEventListener('click', (e)=>{
  if(!document.getElementById('cart').contains(e.target)) cartDropdown.classList.add('hidden');
});

// ====== Product modal logic ======
const productModal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalSpecs = document.getElementById('modalSpecs');
const modalPrice = document.getElementById('modalPrice');
const modalAddBtn = document.getElementById('modalAddBtn');
const modalOptions = document.getElementById('modalOptions');
const modalClose = productModal ? productModal.querySelector('.close') : null;

// initialize product thumbnails and attach click handlers
document.querySelectorAll('.product').forEach(prod => {
  const img = prod.dataset.image;
  if (img) {
    const thumb = prod.querySelector('.thumb');
    if (thumb) thumb.style.backgroundImage = `url('${img}')`;
  }

  // open modal when clicking the product (but ignore clicks on buttons)
  prod.addEventListener('click', (e)=>{
    if (e.target.closest('button')) return; // let buttons handle their own clicks
  const name = prod.dataset.name || prod.querySelector('h2')?.textContent || 'Product';
      const basePrice = parseFloat(prod.dataset.price || '0');
      const image = prod.dataset.image || '';
      const specs = prod.dataset.specs || '';
      const pricesJson = prod.dataset.prices || '[]';
      let plans = [];
      try{ plans = JSON.parse(pricesJson); }catch(e){ plans = [] }

    if (!productModal) return;
  modalTitle.textContent = name + ' — YIXAS COMMUNITY 2.0';
  modalSpecs.innerHTML = specs;
    // populate plan options
    modalOptions.innerHTML = '';
    let selectedPlan = null;
    if(plans.length>0){
      plans.forEach((p, i)=>{
        const el = document.createElement('button');
        el.className = 'plan-option';
        el.dataset.planId = p.id;
        el.dataset.planPrice = p.price;
        el.innerHTML = `<strong>${p.label}</strong><small>€${p.price}</small>`;
        el.addEventListener('click', ()=>{
          // toggle active
          modalOptions.querySelectorAll('.plan-option').forEach(x=>x.classList.remove('active'));
          el.classList.add('active');
          selectedPlan = p;
          modalPrice.textContent = `€${p.price.toFixed(2)}`;
        });
        modalOptions.appendChild(el);
        // auto-select first
        if(i===0){ el.classList.add('active'); selectedPlan = p; modalPrice.textContent = `€${p.price.toFixed(2)}`; }
      });
    } else {
      // no plan options, fallback to base price
      modalPrice.textContent = `€${basePrice.toFixed(2)}`;
    }
    if (image) modalImage.src = image; else modalImage.src = '';
    productModal.classList.remove('hidden');
    productModal.setAttribute('aria-hidden','false');
    // focus for accessibility
    modalAddBtn.focus();
  });
});

// close modal
if (modalClose) modalClose.addEventListener('click', ()=>{
  productModal.classList.add('hidden');
  productModal.setAttribute('aria-hidden','true');
});
// close clicking on backdrop
if (productModal) productModal.querySelector('.modal-backdrop').addEventListener('click', ()=>{
  productModal.classList.add('hidden');
  productModal.setAttribute('aria-hidden','true');
});

// add to cart from modal
if (modalAddBtn) modalAddBtn.addEventListener('click', ()=>{
  const titleText = modalTitle.textContent.replace(' — YIXAS COMMUNITY 2.0','') || 'Product';
  // determine selected plan and price
  const active = modalOptions ? modalOptions.querySelector('.plan-option.active') : null;
  let finalName = titleText;
  let finalPrice = 0;
  if(active){
    const planLabel = active.querySelector('strong')?.textContent || active.dataset.planId;
    finalPrice = parseFloat(active.dataset.planPrice || '0');
    finalName = `${titleText} — ${planLabel}`;
  } else {
    finalPrice = parseFloat(modalPrice.textContent.replace('€','')) || 0;
  }

  const existing = cart.find(c=>c.name===finalName && c.price===finalPrice);
  if (existing) existing.qty++; else cart.push({name:finalName,price:finalPrice,qty:1});
  saveCart(cart); renderCart();
  // close modal
  if (productModal){ productModal.classList.add('hidden'); productModal.setAttribute('aria-hidden','true'); }
});

// Populate the features section by reading product data-specs
function populateFeatures(){
  const container = document.getElementById('featuresList');
  if(!container) return;
  container.innerHTML = '';
  document.querySelectorAll('.product').forEach(p=>{
    const name = p.dataset.name || p.querySelector('h2')?.textContent;
    const specs = p.dataset.specs || '';
    const el = document.createElement('div');
    el.className = 'feature-item';
    el.innerHTML = `<h3>${name}</h3><div class="feature-specs">${specs}</div>`;
    container.appendChild(el);
  });
}
populateFeatures();

// Footer nav behavior
document.querySelectorAll('.footer-link').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = btn.dataset.target;
    // visual active state
    document.querySelectorAll('.footer-link').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    if(target === 'features'){
      // reveal features section but DO NOT auto-scroll; enable wheel-mode so the user can use mouse wheel to go down
      const feat = document.getElementById('features');
      if(feat) feat.classList.remove('hidden');
      populateFeatures();
  // set wheel-mode so the user can use the mouse wheel to enter Features
  // make it persistent until the user hides Features (clicks Products or scrolls up to hide)
  window.__features_wheel_mode = { persistent: true };
    } else if(target === 'products'){
      // hide features and scroll to products
      const feat = document.getElementById('features'); if(feat) { feat.classList.add('hidden'); }
  // disable wheel-mode when switching to products
  window.__features_wheel_mode = null;
      document.getElementById('products')?.scrollIntoView({behavior:'smooth',block:'start'});
    } else if(target === 'community'){
      // scroll to header/title area
      document.getElementById('title')?.scrollIntoView({behavior:'smooth',block:'center'});
      // highlight the discord icon strongly and play a small beep so users notice
      const d = document.querySelector('.discord-btn');
      if(d){
        d.classList.remove('discord-highlight-strong');
        void d.offsetWidth;
        d.classList.add('discord-highlight-strong');
      }
  // play a short voice cue that says 'Discord' to draw attention
  playDiscordVoice();
      // also focus it (keyboard accessible)
      setTimeout(()=>{ document.querySelector('.discord-btn')?.focus(); }, 500);
    }
  });
});

// speak 'Discord' using SpeechSynthesis when available, otherwise fallback to the small audio beep
function playDiscordVoice(){
  try{
    // prefer SpeechSynthesis for a spoken 'Discord' cue
    if(window.speechSynthesis){
      const utter = new SpeechSynthesisUtterance('Join, our Discord');
      utter.lang = 'en-US';
      utter.rate = 1.05;
      utter.volume = 0.9;
      // some browsers require user gesture; play fallback audio if speak fails
      try{ window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); }
      catch(err){ playBeepFallback(); }
    } else {
      playBeepFallback();
    }
  }catch(e){ /* ignore */ }
}

function playBeepFallback(){
  try{
    if(!window.__yixas_beep){
      const audio = document.createElement('audio');
      audio.id = '__yixas_beep_audio';
      audio.src = 'data:audio/wav;base64,UklGRtQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUQAAAB/////P8AAP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A';
      audio.load();
      window.__yixas_beep = audio;
    }
    window.__yixas_beep.currentTime = 0;
    window.__yixas_beep.play().catch(()=>{});
  }catch(e){/* ignore audio errors */}
}

// helpful: prefill cart with one item named "Donazione 5€" for demo (optional)
// cart = [{name:'Donazione 5€',price:5,qty:1}]; saveCart(cart); renderCart();

// Custom scrollbar logic
const scrollTrack = document.getElementById('scrollTrack');
const scrollThumb = document.getElementById('scrollThumb');
function updateThumb(){
  if(!scrollThumb) return;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  if(docH <= 0){ scrollThumb.style.height = '0px'; return; }
  // thumb height proportional to viewport
  const ratio = window.innerHeight / document.documentElement.scrollHeight;
  const trackHeight = (scrollTrack?.clientHeight) || (window.innerHeight - 24);
  const thumbH = Math.max(48, Math.min(trackHeight * ratio, trackHeight - 8));
  scrollThumb.style.height = thumbH + 'px';
  // position
  const scrollY = window.scrollY || window.pageYOffset;
  const maxTop = trackHeight - thumbH - 8;
  const top = (scrollY / docH) * maxTop;
  scrollThumb.style.transform = `translateY(${top}px)`;
}
updateThumb();
addEventListener('scroll', ()=>{ updateThumb(); scrollThumb.classList.add('scrolling'); clearTimeout(window.__scroll_thumb_to); window.__scroll_thumb_to = setTimeout(()=>scrollThumb.classList.remove('scrolling'), 250); });
addEventListener('resize', updateThumb);

// track clicking
if(scrollTrack){
  scrollTrack.addEventListener('click', (e)=>{
    if(e.target === scrollThumb) return; // ignore direct clicks on thumb
    const rect = scrollTrack.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const trackH = rect.height;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = (y / trackH);
    window.scrollTo({top: Math.max(0, Math.min(docH, docH * ratio)), behavior:'smooth'});
  });
}

// dragging the thumb
if(scrollThumb){
  let dragging = false; let startY=0; let startTop=0;
  scrollThumb.addEventListener('mousedown', (e)=>{ dragging = true; startY = e.clientY; startTop = parseFloat(scrollThumb.style.transform.replace('translateY(','').replace('px)','')) || 0; document.body.classList.add('no-select'); e.preventDefault(); });
  addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    const rect = scrollTrack.getBoundingClientRect();
    const trackH = rect.height;
    const thumbH = scrollThumb.clientHeight;
    const maxTop = trackH - thumbH - 8;
    let newTop = startTop + (e.clientY - startY);
    newTop = Math.max(0, Math.min(maxTop, newTop));
    // set scroll
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = newTop / maxTop;
    window.scrollTo({top: docH * ratio});
  });
  addEventListener('mouseup', ()=>{ if(dragging){ dragging=false; document.body.classList.remove('no-select'); } });
}

// Wheel behaviour: if user scrolls down from the top, reveal Features and jump to it.
// If user scrolls up while Features is visible and near top, hide it again.
let __wheel_debounce = null;
addEventListener('wheel', (e)=>{
  // small threshold to avoid accidental tiny scrolls
  if(Math.abs(e.deltaY) < 18) return;
  const feat = document.getElementById('features');
  // only react to wheel if the user has clicked Features and enabled wheel-mode
  const wm = window.__features_wheel_mode;
  if(!wm) return;

  // If wheel-mode is persistent, keep reacting until explicitly disabled.
  if(wm.persistent){
    if(e.deltaY > 0){ // wheel down: enter Features if hidden
      if(feat && feat.classList.contains('hidden')){
        feat.classList.remove('hidden');
        populateFeatures();
        document.getElementById('features')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    } else { // wheel up: if Features visible and near top, hide it and go to top
      if(feat && !feat.classList.contains('hidden')){
        const featTop = feat.getBoundingClientRect().top + window.scrollY;
        if((window.scrollY || window.pageYOffset) <= featTop + 40){
          feat.classList.add('hidden');
          window.scrollTo({top:0,behavior:'smooth'});
          window.__features_wheel_mode = null;
        }
      }
    }
    return;
  }

  // legacy non-persistent behavior (timed/counted)
  if(wm.expires && Date.now() > wm.expires) return;
  if(Math.abs(e.deltaY) < 18) return;
  if(e.deltaY > 0){ // wheel down: scroll into Features
    if(feat){
      document.getElementById('features')?.scrollIntoView({behavior:'smooth',block:'start'});
      if(typeof wm.remaining === 'number'){
        wm.remaining = Math.max(0, wm.remaining - 1);
        if(wm.remaining <= 0) window.__features_wheel_mode = null;
      } else {
        window.__features_wheel_mode = null;
      }
    }
  } else {
    if(feat && !feat.classList.contains('hidden')){
      const featTop = feat.getBoundingClientRect().top + window.scrollY;
      if((window.scrollY || window.pageYOffset) <= featTop + 40){
        feat.classList.add('hidden');
        window.scrollTo({top:0,behavior:'smooth'});
        window.__features_wheel_mode = null;
      }
    }
  }
  clearTimeout(__wheel_debounce);
  __wheel_debounce = setTimeout(()=>{ /* no-op, just debounce */ }, 300);
}, {passive:true});
