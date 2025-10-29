export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.classList.add('show'),10);
  setTimeout(()=> { t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 2000);
}

export async function confirmBox(title, text='') {
  return new Promise(res=>{
    const overlay = document.createElement('div'); overlay.className='modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>${title}</h3>
        <p>${text}</p>
        <div class="row">
          <button id="m-ok" class="btn primary">Sí</button>
          <button id="m-cancel" class="btn">No</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#m-ok').addEventListener('click', ()=> { overlay.remove(); res(true); });
    overlay.querySelector('#m-cancel').addEventListener('click', ()=> { overlay.remove(); res(false); });
  });
}
