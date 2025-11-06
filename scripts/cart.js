import { readStore, writeStore } from './store.js';
import { getSession, updateCartCount } from './session.js';
import { confirmBox } from './ui.js';
import { apiCreateOrder } from './api.js';

(function init() {
  const s = getSession();
  if (!s) { location.href = 'login.html'; return; }

  const root = document.getElementById('cart-root');
  const cart = readStore('cart', []);
  const products = readStore('products', []);

  const left = document.createElement('div'); left.style.flex = '1';
  const right = document.createElement('div'); right.style.width = '360px';
  root.style.display = 'flex'; root.style.gap = '16px';

  if (cart.length === 0) {
    left.innerHTML = `
      <div class="card center">
        <p>Tu carrito está vacío.</p>
        <a class="btn primary" href="index.html">Ir a la tienda</a>
      </div>`;
  } else {
    left.innerHTML = '<div class="card"><h3>Carrito</h3><div id="cart-items"></div></div>';
    const listEl = left.querySelector('#cart-items');
    cart.forEach(c => {
      const p = products.find(pr => pr.id === c.productId) || { name: 'Producto desconocido', price: 0, image: 'https://via.placeholder.com/64' };
      const row = document.createElement('div');
      row.className = 'kv';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 0';
      row.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${p.image}" alt="${p.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
          <div><div style="font-weight:600">${p.name}</div><div class="muted">$ ${p.price} c/u</div></div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn small incdec" data-op="-1" data-id="${c.productId}">-</button>
          <span class="kv-qty">${c.qty}</span>
          <button class="btn small incdec" data-op="1" data-id="${c.productId}">+</button>
          <div style="width:70px;text-align:right">$${p.price * c.qty}</div>
          <button class="btn small del" data-id="${c.productId}">Eliminar</button>
        </div>`;
      listEl.appendChild(row);
    });

    // botones + event listeners
    listEl.querySelectorAll('.incdec').forEach(b => {
      b.addEventListener('click', e => {
        const id = Number(e.target.getAttribute('data-id'));
        const delta = Number(e.target.getAttribute('data-op'));
        changeQty(id, delta);
      });
    });

    listEl.querySelectorAll('.del').forEach(b => {
      b.addEventListener('click', async e => {
        const id = Number(e.target.getAttribute('data-id'));
        if (await confirmBox('¿Eliminar producto?', 'Se quitará del carrito')) removeFromCart(id);
      });
    });
  }

  const subtotal = cart.reduce((s, c) => {
    const p = products.find(pr => pr.id === c.productId) || { price: 0 };
    return s + (p.price * c.qty);
  }, 0);

  right.innerHTML = `
    <div class="card">
      <h4>Resumen</h4>
      <p>Subtotal: $${subtotal}</p>
      <p>Envío: $500</p>
      <p><strong>Total: $${subtotal + 500}</strong></p>
      <div class="row" style="margin-top:12px">
        <button id="btn-checkout" class="btn primary">Confirmar pedido</button>
        <button id="btn-clear" class="btn">Vaciar</button>
      </div>
    </div>`;
  root.appendChild(left); root.appendChild(right);

  right.querySelector('#btn-clear').addEventListener('click', async () => {
    if (await confirmBox('¿Vaciar carrito?', 'Se eliminarán todos los productos')) {
      writeStore('cart', []);
      updateCartCount();
      location.reload();
    }
  });

  right.querySelector('#btn-checkout').addEventListener('click', async () => {
    const ok = await confirmBox('¿Confirmar pedido?', `Total a pagar: $${subtotal + 500}`);
    if (!ok) return;

    if (!cart.length) return alert('El carrito está vacío');

    const payload = {
      cliente: s.email || s.name || 'cliente',
      telefono: '',
      direccion: '',
      subtotal: subtotal,
      totalItems: cart.reduce((a, b) => a + (b.qty || 0), 0),
      estado: "recibido",
      itemsJson: JSON.stringify(cart)
    };

    try {
      const resp = await apiCreateOrder(payload);
      if (!resp) throw new Error('No se pudo crear el pedido');

      writeStore('cart', []);
      updateCartCount();
      alert(`Pedido confirmado (ID: ${resp.id})`);
      location.href = 'my-orders.html';
    } catch (err) {
      console.error(err);
      alert('Error al registrar el pedido: ' + err.message);
    }
  });

  function changeQty(productId, delta) {
    const cart = readStore('cart', []);
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) return removeFromCart(productId);
    writeStore('cart', cart);
    updateCartCount();
    location.reload();
  }

  function removeFromCart(productId) {
    let cart = readStore('cart', []);
    cart = cart.filter(i => i.productId !== productId);
    writeStore('cart', cart);
    updateCartCount();
    location.reload();
  }
})();
