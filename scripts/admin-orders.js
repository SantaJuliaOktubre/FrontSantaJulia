
import { readStore, writeStore } from './store.js';

const area = document.getElementById('orders-area');
render();

function render(){
  const orders = readStore('orders', []);
  const users  = readStore('users', []);
  area.innerHTML = '';
  orders.forEach(o=>{
    const u = users.find(x=> x.id === o.userId);
    const row = document.createElement('div'); row.className='kv';
    row.innerHTML = `
      ID:${o.id} - ${u?.name||'--'} - $${o.total} - ${o.status}
      <select data-id="${o.id}" class="state-select">
        ${['pending','processing','completed','cancelled'].map(s=>`<option ${o.status===s?'selected':''} value="${s}">${s}</option>`).join('')}
      </select>`;
    area.appendChild(row);
    row.querySelector('.state-select').addEventListener('change',(e)=>{
      const id = Number(e.target.getAttribute('data-id'));
      const ords = readStore('orders', []);
      const ord = ords.find(x=> x.id===id);
      ord.status = e.target.value;
      writeStore('orders', ords);
      alert('Estado actualizado');
    });
  });
}
