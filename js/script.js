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
  // strong black base with very subtle red accents
  const g = ctx.createLinearGradient(0 + Math.sin(phase)*120, 0, canvas.width + Math.cos(phase)*120, canvas.height);
  g.addColorStop(0, '#000000');
  g.addColorStop(0.35, '#200000');
  g.addColorStop(0.65, '#2b0000');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // single, very subtle red spotlight that drifts slowly with small amplitude
  const rx = canvas.width/2 + Math.cos(phase*0.7) * (canvas.width*0.08);
  const ry = canvas.height/2 + Math.sin(phase*0.6) * (canvas.height*0.06);
  const radial = ctx.createRadialGradient(rx, ry, 0, rx, ry, Math.max(canvas.width, canvas.height)*0.6);
  radial.addColorStop(0, 'rgba(90,8,8,0.04)');
  radial.addColorStop(0.35, 'rgba(60,6,6,0.02)');
  radial.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // soft vignette to darken edges
  const vignette = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.3, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height));
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  phase += 0.003; // slower, subtler movement
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// snow effect removed to simplify UI

// cursor halo removed as requested

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
  if(cartCount) cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
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
  if(cartTotalEl) cartTotalEl.textContent = `Total: €${total.toFixed(2)}`;
}
renderCart();

// Open dedicated cart page when clicking Cart button (keeps dropdown as fallback)
if(cartBtn){
  cartBtn.onclick = ()=>{ window.location.href = 'cart.html' }
  // support dropdown toggle for quick cart preview (aria)
  cartBtn.addEventListener('click', ()=>{
    if(!cartDropdown) return;
    const open = !cartDropdown.classList.contains('hidden');
    cartDropdown.classList.toggle('hidden');
    cartBtn.setAttribute('aria-expanded', String(!open));
  });
}

// Discord quick-join button behavior
const discordBtn = document.getElementById('discordBtn');
if(discordBtn){
  discordBtn.addEventListener('click', ()=>{
    // open invite in new tab
    const url = DISCORD_INVITE;
    try{ window.open(url, '_blank'); }catch(e){ window.location.href = url }
  });
}

// community animation removed (footer buttons were removed)

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

// modal close helpers and keyboard accessibility
function closeModal(){
  if(!productModal) return;
  productModal.classList.add('hidden');
  productModal.setAttribute('aria-hidden','true');
}
if(modalClose) modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });

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
