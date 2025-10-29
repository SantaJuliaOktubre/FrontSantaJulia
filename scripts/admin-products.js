// /scripts/admin-products.js
import { readStore, writeStore } from './store.js';

const area = document.getElementById('prods-area');
const btnNew = document.getElementById('btn-new');

render();
btnNew.addEventListener('click', ()=>{
  const name = prompt('Nombre'); if(!name) return;
  const price = Number(prompt('Precio','100'));
  const stock = Number(prompt('Stock','0'));
  const categoryId = Number(prompt('ID categoría','1'));
  const products = readStore('products', []);
  const id = (products.at(-1)?.id || 0) + 1;
  products.push({ id, name, desc:'', price, stock, categoryId, image:'', available:true });
  writeStore('products', products); render();
});

function render(){
  const products = readStore('products', []);
  area.innerHTML = '';
  products.forEach(p=>{
    const row = document.createElement('div'); row.className='kv';
    row.innerHTML = `
      ${p.id} - ${p.name} - $${p.price}
      <div>
        <button class="btn small edit" data-id="${p.id}">Editar</button>
        <button class="btn small del"  data-id="${p.id}">Eliminar</button>
      </div>`;
    area.appendChild(row);
  });
  area.querySelectorAll('.edit').forEach(b=> b.addEventListener('click',(e)=>{
    const id = Number(e.target.getAttribute('data-id'));
    const products = readStore('products', []);
    const p = products.find(x=> x.id===id);
    const name = prompt('Nombre', p.name); if(!name) return;
    p.name = name;
    p.price = Number(prompt('Precio', p.price));
    p.stock = Number(prompt('Stock', p.stock));
    writeStore('products', products); render();
  }));
  area.querySelectorAll('.del').forEach(b=> b.addEventListener('click',(e)=>{
    if (!confirm('Eliminar producto?')) return;
    const id = Number(e.target.getAttribute('data-id'));
    let products = readStore('products', []);
    products = products.filter(x=> x.id!==id);
    writeStore('products', products); render();
  }));
}
