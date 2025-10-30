import { readStore, writeStore } from './store.js';
import { ensureSeed } from './data-seed.js';

ensureSeed();
renderCategories();

const btnNew = document.getElementById('btn-new-cat');
btnNew.addEventListener('click', () => openCategoryModal());

function renderCategories() {
  const cats = readStore('categories', []);
  const tbody = document.getElementById('cat-table-body');
  tbody.innerHTML = '';

  if (cats.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ccc;">No hay categorías registradas</td></tr>`;
    return;
  }

  cats.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.id}</td>
      <td><img src="${cat.image}" alt="${cat.name}" class="thumb"></td>
      <td>${cat.name}</td>
      <td>${cat.description}</td>
      <td>
        <button class="btn small" data-id="${cat.id}" data-action="edit">Editar</button>
        <button class="btn small danger" data-id="${cat.id}" data-action="delete">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      const action = e.target.dataset.action;
      if (action === 'edit') editCategory(id);
      if (action === 'delete') deleteCategory(id);
    });
  });
}

async function openCategoryModal(existing) {
  const { value: formValues } = await Swal.fire({
    title: existing ? 'Editar Categoría' : 'Nueva Categoría',
    html: `
      <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${existing?.name || ''}">
      <textarea id="swal-desc" class="swal2-textarea" placeholder="Descripción">${existing?.description || ''}</textarea>
      <input id="swal-img" class="swal2-input" placeholder="URL de imagen" value="${existing?.image || ''}">
    `,
    confirmButtonText: 'Guardar',
    showCancelButton: true,
    background: '#1a0028',
    color: '#fff',
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#555',
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById('swal-name').value.trim();
      const desc = document.getElementById('swal-desc').value.trim();
      const image = document.getElementById('swal-img').value.trim();
      if (!name) Swal.showValidationMessage('El nombre es obligatorio');
      return { name, description: desc, image };
    }
  });

  if (formValues) {
    const cats = readStore('categories', []);
    if (existing) {
      const idx = cats.findIndex(c => c.id === existing.id);
      cats[idx] = { ...existing, ...formValues };
    } else {
      const id = (cats.at(-1)?.id || 0) + 1;
      cats.push({ id, ...formValues });
    }
    writeStore('categories', cats);
    Swal.fire('Guardado', 'La categoría fue registrada correctamente', 'success');
    renderCategories();
  }
}

function editCategory(id) {
  const cats = readStore('categories', []);
  const cat = cats.find(c => c.id === id);
  openCategoryModal(cat);
}

function deleteCategory(id) {
  Swal.fire({
    title: '¿Eliminar categoría?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#a855f7',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
  }).then(result => {
    if (result.isConfirmed) {
      let cats = readStore('categories', []);
      cats = cats.filter(c => c.id !== id);
      writeStore('categories', cats);
      Swal.fire('Eliminada', 'La categoría fue borrada correctamente', 'success');
      renderCategories();
    }
  });
}
