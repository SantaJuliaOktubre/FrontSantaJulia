    import { getSession } from './session.js';

    (async function(){
        const s = getSession();
        const root = document.getElementById('my-orders-area');
        root.innerHTML = '<div class="card">Cargando...</div>';

        try {
            const resp = await fetch(`http://localhost:8080/api/pedidos?cliente=${encodeURIComponent(s.email)}`);
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
        <tbody></tbody>`;

        const tbody = table.querySelector('tbody');

        orders.forEach(o => {
        const items = o.itemsJson ? JSON.parse(o.itemsJson) : [];
        const itemsText = items.map(i => `${i.productId}×${i.qty}`).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${o.id}</td>
            <td>$${o.subtotal ?? 0}</td>
            <td>${new Date(o.creadoEn).toLocaleString()}</td>
            <td>${o.estado}</td>
            <td>${itemsText}</td>`;
        tbody.appendChild(tr);
        });

        root.innerHTML = '';
        root.appendChild(table);
    } catch (err) {
        console.error(err);
        root.innerHTML = '<div class="card center">Error al cargar pedidos</div>';
    }
    })();
