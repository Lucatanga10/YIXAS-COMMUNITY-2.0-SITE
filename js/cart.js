// cart.js - used by cart.html
const CART_KEY = 'yixas_cart_v1';
function readCart(){try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch(e){return []}}
function writeCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c))}

const cartList = document.getElementById('cartList');
const totalText = document.getElementById('totalText');
const checkoutNow = document.getElementById('checkoutNow');
const clearCart = document.getElementById('clearCart');

function render(){
  const cart = readCart();
  cartList.innerHTML = '';
  if(cart.length===0){
    cartList.innerHTML = `
      <li class="cart-empty">
        <div class="empty-graphic">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ff3b3b"><path d="M7 4h10l1 2H6z"/><path d="M6 8h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" fill-opacity="0.85"/></svg>
        </div>
        <h3>Your cart is empty</h3>
        <p>Explore products and add them to your cart.</p>
        <a href="index.html" class="round-btn primary">Browse products</a>
      </li>`;
    totalText.textContent = 'Total: €0.00';
    return
  }
  let total = 0;
  // determine last added product name (for animation)
  const lastAdded = (()=>{ try{return localStorage.getItem('yixas_last_added')}catch(e){return null} })();
  let animatedIndex = -1;
  cart.forEach((it, idx)=>{
    const li = document.createElement('li');
    li.className = 'cart-row';
    li.style.display='flex'; li.style.justifyContent='space-between'; li.style.alignItems='center'; li.style.padding='8px';
    li.innerHTML = `<div><strong style="color:#fff">${it.name}</strong><div style="color:#ddd;font-size:12px">€${it.price.toFixed(2)} each</div></div>`;
    const ctr = document.createElement('div');
    const minus = document.createElement('button'); minus.textContent='-'; minus.className='round-btn'; minus.style.padding='6px';
    const qty = document.createElement('span'); qty.textContent = it.qty; qty.style.margin='0 8px'; qty.style.color='#fff';
    const plus = document.createElement('button'); plus.textContent='+'; plus.className='round-btn'; plus.style.padding='6px';
    const rem = document.createElement('button'); rem.textContent='Remove'; rem.className='round-btn'; rem.style.marginLeft='8px';

    minus.onclick = ()=>{
      if(it.qty>1){ it.qty--; writeCart(cart); render(); animateRowAtIndex(idx); }
      else { cart.splice(idx,1); writeCart(cart); render(); /* removed row - animation visually handled by render */ }
    };
    plus.onclick = ()=>{ it.qty++; writeCart(cart); render(); animateRowAtIndex(idx); };
    rem.onclick = ()=>{ cart.splice(idx,1); writeCart(cart); render(); };

    ctr.appendChild(minus); ctr.appendChild(qty); ctr.appendChild(plus); ctr.appendChild(rem);
    li.appendChild(ctr);
  // add entry animation class then append
  li.classList.add('cart-row-enter');
  cartList.appendChild(li);
    // if matches lastAdded, mark index for animation
    if(lastAdded && lastAdded === it.name){ animatedIndex = idx; }
    total += it.price * it.qty;
  });
  totalText.textContent = `Total: €${total.toFixed(2)}`;

  // pulse total for visual feedback
  totalText.classList.remove('total-pulse'); void totalText.offsetWidth; totalText.classList.add('total-pulse');

  // if we found a match, animate that row and clear the lastAdded marker
  if(animatedIndex >= 0){
    animateRowAtIndex(animatedIndex);
    try{ localStorage.removeItem('yixas_last_added'); }catch(e){}
  }
}

// helper: add flash class to the row at index (if exists) after rendering
function animateRowAtIndex(index){
  // small timeout to ensure DOM was updated by render()
  setTimeout(()=>{
    const rows = document.querySelectorAll('.cart-row');
    if(index>=0 && index < rows.length){
      const el = rows[index];
      el.classList.remove('cart-row-flash');
      // trigger reflow to restart animation
      void el.offsetWidth;
      el.classList.add('cart-row-flash');
      // remove after animation duration
      setTimeout(()=>el.classList.remove('cart-row-flash'), 1000);
    }
  }, 40);
}

if(checkoutNow){
  checkoutNow.onclick = ()=>{
    const cart = readCart();
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    if(total<=0){ alert('Your cart is empty.'); return }
    const username = (window.PAYPAL_ME_USERNAME || '').trim();
    if(!username || username==='YOUR_PAYPAL_ME'){
      if(!confirm('PayPal.me username is not set in config. Continue to test with €5?')) return;
      window.location.href = `https://www.paypal.me/${username || 'paypal'}/5`;
      return;
    }
    const amount = total.toFixed(2);
    // safe-encode username and amount
    const safeUser = encodeURIComponent(username);
    const safeAmount = encodeURIComponent(amount);
    window.location.href = `https://www.paypal.me/${safeUser}/${safeAmount}`;
  }
}

if(clearCart){ clearCart.onclick = ()=>{ if(confirm('Clear the cart?')){ localStorage.removeItem(CART_KEY); render(); } } }

render();
