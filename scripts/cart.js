// ...existing code...
import { readStore, writeStore } from './store.js';
import { getSession, updateCartCount } from './session.js';
import { confirmBox } from './ui.js';
import { apiCreateOrder } from './api.js';

// helper: carga SweetAlert2 si no está y muestra un success con sonido
async function showSuccessToast(title, htmlText, redirectUrl) {
  // carga SweetAlert2 si no existe
  if (!window.Swal) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    }).catch(() => {
      // si no se pudo cargar, fallback a alert
      try { new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_1c6c06f7b7.mp3').play().catch(()=>{}); } catch(e){}
      alert(title + '\n' + (htmlText || ''));
      if (redirectUrl) location.href = redirectUrl;
      return;
    });
  }

  // ahora Swal está disponible
  try {
    // intentar reproducir sonido (puede fallar por autoplay policies)
    const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_1c6c06f7b7.mp3');
    audio.play().catch(()=>{}); // ignore error

    await Swal.fire({
      title: title || '¡Éxito!',
      html: htmlText || '',
      icon: 'success',
      showConfirmButton: false,
      timer: 1800
    });

    if (redirectUrl) location.href = redirectUrl;
  } catch (e) {
    // fallback
    try { new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_1c6c06f7b7.mp3').play().catch(()=>{}); } catch(ex){}
    alert(title + '\n' + (htmlText || ''));
    if (redirectUrl) location.href = redirectUrl;
  }
}

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

    // botones + event listeners (usar la misma listEl)
    listEl.querySelectorAll('.incdec').forEach(b => {
      b.addEventListener('click', e => {
        // usar closest para evitar problemas con iconos u otros elementos
        const btn = e.currentTarget;
        const id = Number(btn.getAttribute('data-id'));
        const delta = Number(btn.getAttribute('data-op'));
        changeQty(id, delta);
      });
    });

    listEl.querySelectorAll('.del').forEach(b => {
      b.addEventListener('click', async e => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
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

    if (!cart.length) {
      if (window.Swal) {
        Swal.fire({ icon: 'info', title: 'Carrito vacío', text: 'No hay productos en el carrito.' });
      } else {
        alert('El carrito está vacío');
      }
      return;
    }

    const payload = {
      cliente: s.email || s.name || 'cliente',
      telefono: '',
      direccion: '',
      subtotal: subtotal,
      totalItems: cart.reduce((a, b) => a + (b.qty || 0), 0),
      // estado eliminado: lo maneja el backend
      itemsJson: JSON.stringify(cart)
    };

    try {
      const resp = await apiCreateOrder(payload);

      // Manejo robusto de la respuesta: aceptar objeto JSON o throw anterior
      if (!resp || (typeof resp === 'object' && (resp.id == null && !resp.error && !resp.message))) {
        throw Object.assign(new Error('No se pudo crear el pedido'), { status: resp && resp.status });
      }

      // Si el backend devolvió un error dentro del JSON, propagarlo
      if (resp && (resp.error || resp.message)) {
        throw Object.assign(new Error(resp.error || resp.message), { status: resp.status });
      }

      // Éxito esperado: resp.id disponible
      writeStore('cart', []);
      updateCartCount();

      await showSuccessToast('¡Pedido confirmado!', `Tu pedido fue registrado (ID: ${resp.id ?? '—'}).`, 'my-orders.html');
    } catch (err) {
      console.error(err);

      const msg = err && err.message ? err.message : String(err);

      // Manejar conflicto de stock (409) o mensajes que contengan 'stock'
      if ((err && err.status === 409) || (msg && msg.toLowerCase().includes('stock'))) {
        const text = msg || 'Stock insuficiente para algunos productos. Actualiza el carrito.';
        if (window.Swal) {
          Swal.fire({ icon: 'warning', title: 'Stock insuficiente', text });
        } else {
          alert(text);
        }
        // opcional: recargar para sincronizar stock local
        // location.reload();
        return;
      }

      if (window.Swal) {
        Swal.fire({ icon: 'error', title: 'Error', text: msg || 'Error al registrar el pedido' });
      } else {
        alert('Error al registrar el pedido: ' + (msg || err));
      }
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