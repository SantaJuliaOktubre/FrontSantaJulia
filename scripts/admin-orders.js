// scripts/admin-orders.js
import { getSession } from './session.js';

(async function() {
  const s = getSession();
  const tbody = document.querySelector('#orders-table tbody');
  const counterEl = document.querySelector('#order-count'); // 👈 elemento donde se mostrará el número

  if (!s) {
    location.href = 'login.html';
    return;
  }
  if (s.role !== 'admin') {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5">Acceso denegado — solo admin</td></tr>`;
    return;
  }

  if (!tbody) {
    console.error('No se encontró #orders-table tbody en el DOM');
    return;
  }

  async function loadOrders() {
    try {
      tbody.innerHTML = `<tr><td colspan="5">Cargando pedidos...</td></tr>`;
      const token = s?.token;
      const resp = await fetch('http://localhost:8081/api/pedidos', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const orders = await resp.json();
      renderTable(orders || []);
      updateCounter(orders?.length || 0); // 👈 actualiza contador
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="5">Error al cargar pedidos</td></tr>`;
      updateCounter(0);
    }
  }

  function updateCounter(count) {
    if (counterEl) {
      counterEl.textContent = count;
      counterEl.style.transition = 'transform 0.2s';
      counterEl.style.transform = 'scale(1.3)';
      setTimeout(() => (counterEl.style.transform = 'scale(1)'), 200);
    }
  }

  function renderTable(orders) {
    tbody.innerHTML = '';
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="5">No hay pedidos</td></tr>`;
      return;
    }

    orders.forEach(o => {
      const items = o.itemsJson ? JSON.parse(o.itemsJson) : [];
      const itemsText = items.map(i => `${i.name ?? '#' + i.productId} × ${i.qty}`).join('<br>');
      const tr = document.createElement('tr');
      tr.dataset.orderId = o.id;
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.cliente ?? '—'}</td>
        <td>$${o.subtotal ?? 0}</td>
        <td>${o.estado ?? 'pendiente'}</td>
        <td>
          <select class="status-select" data-id="${o.id}">
            <option value="recibido">recibido</option>
            <option value="preparando">preparando</option>
            <option value="enviado">enviado</option>
            <option value="entregado">entregado</option>
            <option value="cancelado">cancelado</option>
          </select>
          <button class="btn small btn-update" data-id="${o.id}">Actualizar</button>
          <div style="margin-top:6px; font-size:0.9em; color:#555">${itemsText}</div>
        </td>
      `;
      const select = tr.querySelector('.status-select');
      if (select && o.estado) select.value = o.estado;
      tbody.appendChild(tr);
    });
  }

  tbody.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.btn-update');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const select = tbody.querySelector(`.status-select[data-id="${id}"]`);
    if (!select) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el selector de estado para este pedido.' });
      return;
    }

    const newStatus = select.value;
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = 'Actualizando...';

    try {
      await updateStatus(id, newStatus);

      // ✅ popup moderno con sonido y tick verde
      Swal.fire({
        title: '¡Estado actualizado!',
        text: 'El pedido fue actualizado correctamente.',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        didOpen: () => {
          const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_1c6c06f7b7.mp3');
          audio.play();
        }
      });

      await loadOrders();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo actualizar el estado.' });
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  });

  async function updateStatus(id, status) {
    const token = s?.token;
    const resp = await fetch(`http://localhost:8081/api/pedidos/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status })
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => null);
      throw new Error(text || `HTTP ${resp.status}`);
    }
    return resp.json();
  }

  await loadOrders();
})();
