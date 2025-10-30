// scripts/login.js
import { apiLogin } from './api.js';
import { setSession, loadPartials } from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();

  const form = document.getElementById('form-login');
  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-pass');

  if (!form || !emailEl || !passEl) {
    console.error('[login] No encontré el formulario o inputs');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailEl.value.trim();
    const pass  = passEl.value;

    if (!email || !pass) {
      alert('Completa email y contraseña');
      return;
    }

    try {
      const user = await apiLogin(email, pass);
      if (!user) {
        if (confirm('No encontramos tu cuenta. ¿Querés registrarte?')) {
          location.href = 'register.html';
        } else {
          alert('Credenciales inválidas');
        }
        return;
      }

      setSession(user);
      location.href = (user.role?.toLowerCase() === 'admin') ? 'admin.html' : 'index.html';
    } catch (err) {
      console.error('[login] ERROR ->', err);
      const msg = (err && err.message) ? err.message : 'Error desconocido del servidor';
      if (/network|fetch|Failed to fetch/i.test(msg)) {
        alert('No puedo contactar al servidor. ¿Está encendido el backend?');
      } else {
        alert('Error al iniciar sesión: ' + msg);
      }
    }
  });
});
