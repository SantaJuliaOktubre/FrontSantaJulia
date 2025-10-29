// /scripts/admin-categories.js
import { readStore, writeStore } from './store.js';

const area = document.getElementById('cats-area');
const btnNew = document.getElementById('btn-new');

render();
btnNew.addEventListener('click', ()=>{
  const name = prompt('Nombre categoría'); if(!name) return;
  const desc = prompt('Descripción') || '';
  const cats = readStore('categories', []);
  const id = (cats.at(-1)?.id || 0) + 1;
  cats.push({ id, name, description: desc, image: ''});
  writeStore('categories', cats); render();
});

function render(){
  const cats = readStore('categories', []);
  area.innerHTML = '';
  cats.forEach(c=>{
    const row = document.createElement('div'); row.className='kv';
    row.innerHTML = `
      ${c.id} - ${c.name}
      <div>
        <button class="btn small edit" data-id="${c.id}">Editar</button>
        <button class="btn small del"  data-id="${c.id}">Eliminar</button>
      </div>`;
    area.appendChild(row);
  });
  area.querySelectorAll('.edit').forEach(b=> b.addEventListener('click',(e)=>{
    const id = Number(e.target.getAttribute('data-id'));
    const cats = readStore('categories', []);
    const cat = cats.find(x=> x.id===id);
    const name = prompt('Editar nombre', cat.name); if (!name) return;
    cat.name = name;
    cat.description = prompt('Editar descripción', cat.description) || cat.description;
    writeStore('categories', cats); render();
  }));
  area.querySelectorAll('.del').forEach(b=> b.addEventListener('click',(e)=>{
    const id = Number(e.target.getAttribute('data-id'));
    if (!confirm('¿Eliminar categoría?')) return;
    let cats = readStore('categories', []);
    cats = cats.filter(c=> c.id !== id);
    writeStore('categories', cats); render();
  }));
}
