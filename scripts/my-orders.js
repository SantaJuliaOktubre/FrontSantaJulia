import { getSession } from './session.js';

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
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');

        orders.forEach(o => {
            const items = o.itemsJson ? JSON.parse(o.itemsJson) : [];
            const itemsHtml = items.map(i => {
                const name = i.name ?? 'Producto';
                const qty = i.qty;
                const img = i.image ? `<img src="${i.image}" alt="${name}" style="height:40px;margin-right:5px;">` : '';
                return `<div style="display:flex;align-items:center;margin-bottom:3px;">${img}${name} × ${qty}</div>`;
            }).join('');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${o.id}</td>
                <td>$${o.subtotal ?? 0}</td>
                <td>${new Date(o.creadoEn).toLocaleString()}</td>
                <td>${o.estado ?? 'pendiente'}</td>
                <td>${itemsHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        root.innerHTML = '';
        root.appendChild(table);

    } catch (err) {
        console.error(err);
        root.innerHTML = '<div class="card center">Error al cargar pedidos</div>';
    }
})();
