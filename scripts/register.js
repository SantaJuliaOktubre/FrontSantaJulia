
import { apiRegister } from './api.js';
import { setSession } from './session.js';

// Esperá a que el DOM esté listo por las dudas
document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('form-register');
  const nameEl = document.getElementById('reg-name');
  const mailEl = document.getElementById('reg-email');
  const passEl = document.getElementById('reg-pass');

  if (!form || !nameEl || !mailEl || !passEl) {
    console.error('[register] No encontré el formulario o inputs');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameEl.value.trim();
    const email = mailEl.value.trim();
    const pass = passEl.value;

    // Validaciones para el registro
    if (!name)  { alert('Falta el nombre');  return; }
    if (!email) { alert('Falta el email');   return; }
    if (!pass || pass.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }

    try {
      console.log('[register] intentando registrar...', { name, email });
      const u = await apiRegister(name, email, pass);
      if (!u) {
        alert('No se pudo registrar (respuesta vacía)');
        return;
      }
      console.log('[register] OK ->', u);
      alert('Registro exitoso. Ahora podés iniciar sesión.');
      location.href = 'login.html';
    } catch (err) {
      console.error('[register] ERROR ->', err);
      const msg = (err && err.message) ? err.message : 'Error desconocido del servidor';
      // mensajes error
      if (/409|ya registrado|exists|duplicate/i.test(msg)) {
        alert('Ese email ya está registrado.');
      } else if (/network|fetch|Failed to fetch/i.test(msg)) {
        alert('No puedo contactar al servidor. ¿Está encendido el backend?');
      } else {
        alert('No se pudo registrar: ' + msg);
      }
    }
  });
});
