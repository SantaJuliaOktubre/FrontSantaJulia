
import { readStore, writeStore } from './store.js';

const tbody = document.querySelector('#orders-table tbody');

function renderTable() {
  tbody.innerHTML = '';
  const orders = readStore('orders', []);
  orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.user}</td>
      <td>$${o.total}</td>
      <td>${o.status}</td>
      <td>
        <button class="btn small" data-id="${o.id}" data-action="edit">Cambiar Estado</button>
        <button class="btn small danger" data-id="${o.id}" data-action="del">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

tbody.addEventListener('click', async e => {
  if (e.target.tagName !== 'BUTTON') return;
  const btn = e.target;
  const id = Number(btn.dataset.id);
  const orders = readStore('orders', []);
  const order = orders.find(o => o.id === id);

  if (btn.dataset.action === 'edit') {
    const { value: newStatus } = await Swal.fire({
      title: 'Cambiar Estado',
      input: 'select',
      inputOptions: {
        Pendiente: 'Pendiente',
        Enviado: 'Enviado',
        Entregado: 'Entregado',
        Cancelado: 'Cancelado'
      },
      inputValue: order.status,
      showCancelButton: true,
      confirmButtonText: 'Actualizar'
    });
    if (newStatus) {
      order.status = newStatus;
      writeStore('orders', orders);
      Swal.fire('Actualizado', 'Estado cambiado correctamente', 'success');
      renderTable();
    }
  }

  if (btn.dataset.action === 'del') {
    const ok = await Swal.fire({
      title: '¿Eliminar pedido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (ok.isConfirmed) {
      writeStore('orders', orders.filter(o => o.id !== id));
      Swal.fire('Eliminado', 'Pedido eliminado correctamente', 'success');
      renderTable();
    }
  }
});

renderTable();

