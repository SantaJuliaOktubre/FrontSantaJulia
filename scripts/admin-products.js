import { readStore, writeStore } from './store.js';

const tbody = document.querySelector('#prod-table tbody');
const btnNew = document.getElementById('btn-new-prod');

function renderTable() {
  tbody.innerHTML = '';
  const prods = readStore('products', []);
  const cats = readStore('categories', []);
  prods.forEach(prod => {
    const cat = cats.find(c => c.id === prod.categoryId);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.id}</td>
      <td><img class="thumb" src="${prod.image || 'https://via.placeholder.com/60'}"></td>
      <td>${prod.name}</td>
      <td>${prod.desc}</td>
      <td>$${prod.price}</td>
      <td>${cat ? cat.name : 'Sin categoría'}</td>
      <td>${prod.stock}</td>
      <td>${prod.available ? '✅' : '❌'}</td>
      <td>
        <button class="btn small" data-id="${prod.id}" data-action="edit">Editar</button>
        <button class="btn small danger" data-id="${prod.id}" data-action="del">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

btnNew.addEventListener('click', async () => {
  const cats = readStore('categories', []);
  if (cats.length === 0) {
    Swal.fire('Error', 'Primero crea una categoría', 'info');
    return;
  }

  const options = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const { value: formValues } = await Swal.fire({
    title: 'Nuevo Producto',
    html: `
      <input id="prod-name" class="swal2-input" placeholder="Nombre">
      <input id="prod-desc" class="swal2-input" placeholder="Descripción">
      <input id="prod-price" class="swal2-input" placeholder="Precio" type="number">
      <input id="prod-stock" class="swal2-input" placeholder="Stock" type="number">
      <select id="prod-cat" class="swal2-input">${options}</select>
      <input id="prod-img" class="swal2-input" placeholder="URL de imagen">
      <label><input type="checkbox" id="prod-avail"> Disponible</label>
    `,
    confirmButtonText: 'Guardar',
    focusConfirm: false,
    preConfirm: () => ({
      name: document.getElementById('prod-name').value,
      desc: document.getElementById('prod-desc').value,
      price: Number(document.getElementById('prod-price').value),
      stock: Number(document.getElementById('prod-stock').value),
      categoryId: Number(document.getElementById('prod-cat').value),
      image: document.getElementById('prod-img').value,
      available: document.getElementById('prod-avail').checked
    })
  });

  if (!formValues) return;
  const prods = readStore('products', []);
  const id = (prods.at(-1)?.id || 0) + 1;
  prods.push({ id, ...formValues });
  writeStore('products', prods);
  Swal.fire('Creado', 'Producto agregado correctamente', 'success');
  renderTable();
});

tbody.addEventListener('click', async e => {
  if (e.target.tagName !== 'BUTTON') return;
  const btn = e.target;
  const id = Number(btn.dataset.id);
  const prods = readStore('products', []);
  const prod = prods.find(p => p.id === id);

  if (btn.dataset.action === 'edit') {
    const cats = readStore('categories', []);
    const options = cats.map(c => `<option value="${c.id}" ${c.id === prod.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
    const { value: formValues } = await Swal.fire({
      title: 'Editar Producto',
      html: `
        <input id="prod-name" class="swal2-input" value="${prod.name}">
        <input id="prod-desc" class="swal2-input" value="${prod.desc}">
        <input id="prod-price" class="swal2-input" type="number" value="${prod.price}">
        <input id="prod-stock" class="swal2-input" type="number" value="${prod.stock}">
        <select id="prod-cat" class="swal2-input">${options}</select>
        <input id="prod-img" class="swal2-input" value="${prod.image}">
        <label><input type="checkbox" id="prod-avail" ${prod.available ? 'checked' : ''}> Disponible</label>
      `,
      confirmButtonText: 'Guardar',
      focusConfirm: false,
      preConfirm: () => ({
        name: document.getElementById('prod-name').value,
        desc: document.getElementById('prod-desc').value,
        price: Number(document.getElementById('prod-price').value),
        stock: Number(document.getElementById('prod-stock').value),
        categoryId: Number(document.getElementById('prod-cat').value),
        image: document.getElementById('prod-img').value,
        available: document.getElementById('prod-avail').checked
      })
    });
    if (!formValues) return;
    Object.assign(prod, formValues);
    writeStore('products', prods);
    Swal.fire('Actualizado', 'Producto modificado correctamente', 'success');
    renderTable();
  }

  if (btn.dataset.action === 'del') {
    const ok = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (ok.isConfirmed) {
      writeStore('products', prods.filter(p => p.id !== id));
      Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
      renderTable();
    }
  }
});

renderTable();