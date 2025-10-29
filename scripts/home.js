import { readStore, writeStore } from './store.js';
import { getSession, updateCartCount } from './session.js';
import { apiGetCategories, apiGetProducts } from './api.js';
import { toast } from './ui.js';

// 🔧 Normaliza cualquier ruta vieja (public/img, img, vacías) → /img/...
function normalizeImgPath(path) {
  const p = String(path || '');
  let fixed = p.replace(/^public\//, '/').replace(/^\.?\/?img\//, '/img/');
  if (!fixed.startsWith('/img/')) fixed = '/img/default.png';
  return fixed;
}

(function init(){
  const s = getSession();
  if (!s) { location.href = 'login.html'; return; }

  const catsEl = document.getElementById('categories-list');
  const grid   = document.getElementById('products-grid');
  const search = document.getElementById('search');
  const sort   = document.getElementById('sort');

  let cats = [], prods = [];

  Promise.all([apiGetCategories(), apiGetProducts()])
    .then(([c,p])=>{
      // si back no trae nada, usa lo del store
      cats  = (c && c.length) ? c : (readStore('categories', []) || []);
      prods = (p && p.length) ? p : (readStore('products', []) || []);
      renderCats(); renderProducts(); attachFilters();
    })
    .catch(()=>{
      // si falla el back, usa lo del store
      cats  = readStore('categories', []) || [];
      prods = readStore('products', []) || [];
      renderCats(); renderProducts(); attachFilters();
    });

  function renderCats(){
    catsEl.innerHTML = `<li><button class="active" data-cat="">Todas</button></li>`;
    cats.forEach(c=>{
      const li = document.createElement('li');
      li.innerHTML = `<button data-cat="${c.id}">${c.name}</button>`;
      catsEl.appendChild(li);
    });
    catsEl.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        catsEl.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        ev.target.classList.add('active');
        renderProducts();
      });
    });
  }

  function renderProducts(){
    const qtxt = (search?.value || '').toLowerCase();
    const activeBtn = catsEl.querySelector('button.active');
    const selectedCat = activeBtn ? activeBtn.getAttribute('data-cat') : '';

    let list = prods.slice();
    if (selectedCat) list = list.filter(p => String(p.categoryId) === selectedCat);
    if (qtxt) list = list.filter(p => p.name.toLowerCase().includes(qtxt) || (p.desc||'').toLowerCase().includes(qtxt));

    const s = sort?.value;
    if (s === 'name-asc')   list.sort((a,b)=> a.name.localeCompare(b.name));
    if (s === 'price-asc')  list.sort((a,b)=> a.price - b.price);
    if (s === 'price-desc') list.sort((a,b)=> b.price - a.price);

    grid.innerHTML = '';
    list.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'product card';
      const imgSrc = normalizeImgPath(p.image);
      card.innerHTML = `
        <img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='/img/default.png'">
        <div class="kv"><strong>${p.name}</strong><span class="badge">${p.available ? 'Disponible' : 'No'}</span></div>
        <p class="muted">${p.desc || ''}</p>
        <div class="kv"><div>$ ${p.price}</div>
          <div><button class="btn small add-cart" data-id="${p.id}">Agregar</button></div>
        </div>`;
      grid.appendChild(card);
    });

    // debug opcional para ver qué src quedó
    // console.table(list.map(p => ({ name:p.name, img: normalizeImgPath(p.image) })));

    grid.querySelectorAll('.add-cart').forEach(b=>{
      b.addEventListener('click',(e)=>{
        const id = Number(e.target.getAttribute('data-id'));
        addToCart(id,1); toast('Producto agregado al carrito');
      });
    });
  }

  function attachFilters(){
    search?.addEventListener('input', renderProducts);
    sort?.addEventListener('change', renderProducts);
  }

  function addToCart(productId, qty=1){
    const cart = readStore('cart', []);
    const norm = cart.map(c=>({ productId: c.productId ?? c.id, qty: c.qty ?? 1 }));
    const item = norm.find(c=> c.productId === productId);
    if (item) item.qty += qty; else norm.push({ productId, qty });
    writeStore('cart', norm);
    updateCartCount();
  }
})();
