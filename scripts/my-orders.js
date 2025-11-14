// ...existing code...
import { getSession } from './session.js';

async function ensureSwal() {
    if (window.Swal) return;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('No se pudo cargar SweetAlert2'));
        document.head.appendChild(s);
    }).catch(() => {});
}

(async function() {
    const s = getSession();
    if (!s) {
        location.href = 'login.html';
        return;
    }

    const root = document.getElementById('my-orders-area');
    root.innerHTML = '<div class="card">Cargando...</div>';

    try {
        const token = s?.token;
        const resp = await fetch(`http://localhost:8081/api/pedidos?cliente=${encodeURIComponent(s.email)}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

        const orders = await resp.json();

        if (!orders || orders.length === 0) {
            root.innerHTML = '<div class="card center">No hay pedidos todavía.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Items</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        orders.forEach(o => {
            const items = o.itemsJson ? safeParseItems(o.itemsJson) : [];
            const itemsHtml = items.map(i => {
                const name = i.name ?? 'Producto';
                const qty = i.qty ?? i.quantity ?? 1;
                const img = i.image ? `<img src="${i.image}" alt="${name}" style="height:40px;margin-right:5px;">` : '';
                return `<div style="display:flex;align-items:center;margin-bottom:3px;">${img}${escapeHtml(name)} × ${qty}</div>`;
            }).join('');

            const tr = document.createElement('tr');

            const estadoText = o.estado ?? 'pendiente';
            tr.innerHTML = `
                <td class="col-id">${o.id}</td>
                <td>$${o.subtotal ?? 0}</td>
                <td>${o.creadoEn ? new Date(o.creadoEn).toLocaleString() : '-'}</td>
                <td class="col-estado">${escapeHtml(estadoText)}</td>
                <td>${itemsHtml}</td>
                <td class="col-actions"></td>
            `;
            tbody.appendChild(tr);

            const actionsTd = tr.querySelector('.col-actions');

            // Mostrar botón cancelar solo si el pedido no está cancelado ni entregado
            const estadoLower = (estadoText || '').toLowerCase();
            if (estadoLower !== 'cancelado' && estadoLower !== 'entregado') {
                const btnCancel = document.createElement('button');
                btnCancel.className = 'btn danger btn-cancel';
                btnCancel.textContent = 'Cancelar pedido';
                btnCancel.addEventListener('click', () => onCancelClick(o.id, tr, token));
                actionsTd.appendChild(btnCancel);
            }

            // "Ver" button intentionally removed
        });

        root.innerHTML = '';
        root.appendChild(table);

    } catch (err) {
        console.error(err);
        root.innerHTML = '<div class="card center">Error al cargar pedidos</div>';
    }
})();

function safeParseItems(itemsJson) {
    if (!itemsJson) return [];
    try {
        const parsed = JSON.parse(itemsJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function onCancelClick(pedidoId, rowElement, token) {
    await ensureSwal();

    const ok = await confirmAsync('Confirmar cancelación', '¿Deseas cancelar este pedido? El stock será restaurado.');
    if (!ok) return;

    try {
        // mostrar modal de carga
        if (window.Swal) {
            Swal.fire({ title: 'Cancelando pedido...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        }

        await cancelOrderRequest(pedidoId, token);

        // cerrar modal de carga si existe
        if (window.Swal) Swal.close();

        // actualizar interfaz: estado y quitar botón cancelar
        const estadoTd = rowElement.querySelector('.col-estado');
        if (estadoTd) estadoTd.textContent = 'cancelado';
        const actionsTd = rowElement.querySelector('.col-actions');
        if (actionsTd) {
            actionsTd.innerHTML = '<span class="muted">Pedido cancelado</span>';
        }

        // Mostrar SweetAlert2 success si está disponible
        const successMsg = `El pedido #${pedidoId} fue cancelado y el stock restaurado.`;
        if (window.Swal) {
            await Swal.fire({ icon: 'success', title: 'Pedido cancelado', text: successMsg, timer: 1500, showConfirmButton: false });
        } else {
            alert(successMsg);
        }
    } catch (err) {
        console.error(err);
        if (window.Swal) {
            Swal.close();
            Swal.fire({ icon: 'error', title: 'Error', text: err?.message || String(err) });
        } else {
            alert('No se pudo cancelar el pedido: ' + (err?.message || String(err)));
        }
    }
}

async function cancelOrderRequest(id, token) {
    const res = await fetch(`http://localhost:8081/api/pedidos/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'cancelado' })
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = { message: text }; }

    if (!res.ok) {
        const err = new Error(data?.message || res.statusText || 'Error al cancelar pedido');
        err.status = res.status;
        throw err;
    }
    return data;
}

async function confirmAsync(title, text) {
    await ensureSwal();
    if (window.Swal) {
        const r = await Swal.fire({ title, text, icon: 'question', showCancelButton: true });
        return !!r.isConfirmed;
    }
    return Promise.resolve(confirm(title + '\n\n' + text));
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
// ...existing code...