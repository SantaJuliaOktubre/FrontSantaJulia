import { readStore, writeStore, removeStore } from './store.js';

export function getSession() { return readStore('session', null); }
export function setSession(s) { writeStore('session', s); }
export function clearSession() { removeStore('session'); }

export function updateCartCount() {
  const cart = readStore('cart', []);
  const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = String(total);
}

export async function loadPartials() {
  // Navbar
  const navHolder = document.getElementById('navbar-slot');
  if (navHolder) {
    const html = await fetch('/partials/navbar.html').then(r => r.text());
    navHolder.innerHTML = html;

    const s = getSession();
    const nameEl = document.getElementById('nav-username');
    const btnLogout = document.getElementById('btn-logout');
    if (s) {
      if (nameEl) nameEl.textContent = s.name || '';
      if (btnLogout) btnLogout.style.display = 'inline-block';
      btnLogout?.addEventListener('click', () => { clearSession(); location.href = 'login.html'; });
    }
    updateCartCount();
  }
  // Footer
  const footHolder = document.getElementById('footer-slot');
  if (footHolder) {
    const html = await fetch('/partials/footer.html').then(r => r.text());
    footHolder.innerHTML = html;
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }
}
