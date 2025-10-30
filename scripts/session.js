import { readStore, writeStore, removeStore } from './store.js';

// =====================
// Manejo de sesión
// =====================
export function getSession() {
  return readStore('session', null);
}

export function setSession(session) {
  writeStore('session', session);
}

export function clearSession() {
  removeStore('session');
  location.href = 'login.html';
}

// =====================
// Carrito (contador visual en navbar)
// =====================
export function updateCartCount() {
  const cart = readStore('cart', []);
  const total = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = String(total);
}

// =====================
// Navbar y Footer parciales
// =====================
export async function loadPartials() {
  // === Navbar ===
  const navHolder = document.getElementById('navbar-slot');
  if (navHolder) {
    // ✅ RUTA RELATIVA COMPATIBLE
    const html = await fetch('partials/navbar.html').then(r => r.text());
    navHolder.innerHTML = html;

    const s = getSession();

    const nameEl = document.getElementById('nav-username');
    const btnLogout = document.getElementById('btn-logout');
    const btnAdmin = document.getElementById('nav-admin');

    // Si hay sesión
    if (s) {
      if (nameEl) nameEl.textContent = s.name || '';
      if (btnLogout) btnLogout.style.display = 'inline-block';
      btnLogout?.addEventListener('click', clearSession);

      // Si el usuario es admin, mostrar enlace al panel
      if (btnAdmin && s.role === 'admin') {
        btnAdmin.style.display = 'inline-block';
      }
    } else {
      // Si no hay sesión, ocultar logout y admin
      if (btnLogout) btnLogout.style.display = 'none';
      if (btnAdmin) btnAdmin.style.display = 'none';
    }

    updateCartCount();
  }

  // === Footer ===
  const footHolder = document.getElementById('footer-slot');
  if (footHolder) {
    const html = await fetch('partials/footer.html').then(r => r.text());
    footHolder.innerHTML = html;
    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }
}
