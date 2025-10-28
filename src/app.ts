import * as API from './api';
import { readStore, writeStore } from './utils/store';
import Swal from 'sweetalert2';

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
});

function showConfirm(title: string, text = ''): Promise<boolean> {
    const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
    });
    return swalWithBootstrapButtons.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        reverseButtons: true
    }).then(r => r.isConfirmed);
}


const $ = (s: string, ctx: Document | Element = document) => ctx.querySelector(s) as HTMLElement | null;
const q = (s: string, ctx: Document | Element = document) => Array.from(ctx.querySelectorAll(s));

const SAMPLE_USERS = [
    { id:1, name:'Admin', email:'admin@food.com', pass:'admin123', role:'admin'},
    { id:2, name:'Cliente', email:'cliente@food.com', pass:'cliente123', role:'cliente'}
];

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Pizzas', description: 'Pizzas clásicas', image: '/img/pizza.png' },
    { id: 2, name: 'Postres', description: 'Dulces', image: '/img/panqueques.png' },
    { id: 3, name: 'Hamburguesas', description: 'Hamburguesas de la casa', image: '/img/lagranJulia.png' },
    { id: 4, name: 'Bebidas', description: 'Bebidas frías', image: '/img/coca.png' }
];

const DEFAULT_PRODUCTS = [
    // pizzas
    { id: 1, name: 'Muzzarella', desc: 'Pizza clásica', price: 15000, stock: 10, categoryId: 1, image: '/img/pizza.png', available: true },
    { id: 9, name: 'Fugazzetta', desc: 'Pizza con cebolla y mucho queso', price: 18000, stock: 8, categoryId: 1, image: '/img/fugazzetta.png', available: true },
    { id: 11, name: 'Napolitana', desc: 'Pizza con tomate, ajo y orégano', price: 17000, stock: 5, categoryId: 1, image: '/img/napolitana.png', available: true },
    { id: 12, name: 'Especial', desc: 'Jamón, morrón, huevo y aceitunas', price: 15000, stock: 4, categoryId: 1, image: '/img/especial.png', available: true },

    // postres
    { id: 2, name: 'Panqueque', desc: 'Con dulce de leche', price: 4000, stock: 5, categoryId: 2, image: '/img/panqueques.png', available: true },
    { id: 10, name: 'Helado', desc: 'Helado artesanal de crema', price: 2500, stock: 7, categoryId: 2, image: '/img/helado.png', available: true },
    { id: 13, name: 'Tiramisú', desc: 'Postre italiano con café y cacao', price: 6000, stock: 6, categoryId: 2, image: '/img/tiramisu.png', available: true },
    { id: 14, name: 'Cheesecake', desc: 'Tarta de queso con base de galleta', price: 5500, stock: 4, categoryId: 2, image: '/img/cheesecake.png', available: true },

    // hamburguesas
    { id: 3, name: 'Cheeseburger', desc: 'Hamburguesa con queso cheddar y panceta', price: 15000, stock: 8, categoryId: 3, image: '/img/cheeseburger.png', available: true },
    { id: 4, name: 'La Gran Julia', desc: 'Doble carne, cheddar,  jamon , huevo, cebolla caramelizada', price: 17000, stock: 6, categoryId: 3, image: '/img/LagranJulia.png', available: true },
    { id: 15, name: 'Santa Burguer', desc: 'Hamburguesa triple carne, cebolla crispy, mayonesa alioli, panceta, queso cheddar', price: 18000, stock: 5, categoryId: 3, image: '/img/santaburguer.png', available: true },

    // bebidas
    { id: 5, name: 'Coca Cola', desc: 'Botella 500ml', price: 1500, stock: 15, categoryId: 4, image: '/img/coca.png', available: true },
    { id: 6, name: 'Sprite', desc: 'Botella 500ml', price: 1500, stock: 12, categoryId: 4, image: '/img/sprite.png', available: true },
    { id: 7, name: 'Fanta', desc: 'Botella 500ml', price: 1500, stock: 10, categoryId: 4, image: '/img/fanta.png', available: true },
    { id: 8, name: 'Cerveza Corona', desc: 'Botella 355ml', price: 1800, stock: 8, categoryId: 4, image: '/img/corona.png', available: true }
];


if(!readStore('users')) writeStore('users', SAMPLE_USERS);
if(!readStore('categories')) writeStore('categories', DEFAULT_CATEGORIES);
if(!readStore('products')) writeStore('products', DEFAULT_PRODUCTS);
if(!readStore('cart')) writeStore('cart', []);

const app = document.getElementById('app') as HTMLElement;

function renderNavbar() {
    const session = readStore('session', null);
    const existing = document.querySelector('.navbar');
    if (existing) existing.remove();
    const nav = document.createElement('header');
    nav.className = 'navbar';
    nav.innerHTML = `
    <div class="brand" data-link="#/home">Santa Julia</div>
    <div class="nav-links">
        <span class="user-name">${session ? session.name : ''}</span>
        ${session ? '<button id="btn-logout" class="btn small">Logout</button>' : ''}
        <a href="#/cart" class="cart-link">Carrito <span id="cart-count" class="badge">0</span></a>
    </div>
    `;
    app.prepend(nav);
    const logout = document.getElementById('btn-logout');
    if (logout) logout.addEventListener('click', () => { localStorage.removeItem('session'); routeTo('#/login'); });
    updateCartCount();
}

function updateCartCount() {
    const cart = readStore('cart', []);
    const el = document.getElementById('cart-count');
    if (el) el.textContent = String(cart.reduce((s: number, i: any)=> s + (i.qty || 0), 0));
}

/* Router */
const routes: Record<string, () => void> = {
    '/login': viewLogin,
    '/register': viewRegister,
    '/home': viewHomeClient,
    '/cart': viewCart,
    '/admin': viewAdminHome,
    '/admin/categories': viewAdminCategories,
    '/admin/products': viewAdminProducts,
    '/admin/orders': viewAdminOrders
};

function parseHash() {
    const hash = location.hash.replace('#','') || '/login';
    return hash.split('?')[0];
}
function routeTo(h: string){ location.hash = h; }

function handleRoute(){
    const p = parseHash();
    const fn = routes[p];
    if (fn) fn(); else routeTo('/home');
}


function viewLogin() {
    app.innerHTML = '';
    renderNavbar();
    const container = document.createElement('main');
    container.className = 'card center-card';
    container.innerHTML = `
    <h2>Iniciar sesión</h2>
    <form id="form-login" class="form">
        <label>Email <input type="email" id="login-email" required /></label>
        <label>Contraseña <input type="password" id="login-pass" required /></label>
        <div class="row">
            <button class="btn primary" type="submit">Ingresar</button>
            <button id="goto-register" class="btn ghost" type="button">Registrarse</button>
        </div>
        <p class="muted">(Ingresá un usuario ya registrado)</p>
    </form>
    `;
    app.appendChild(container);

    const form = document.getElementById('form-login') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
        const pass = (document.getElementById('login-pass') as HTMLInputElement).value;

        try {
            const apiResp = await API.apiLogin(email, pass);

            if (!apiResp) {
                throw new Error("No response from API");
            }

            writeStore('session', apiResp);

            const role = apiResp.role?.toLowerCase();
            routeTo(role === 'admin' ? '#/admin' : '#/home');

        } catch(e) {
            Swal.fire('Error', 'Credenciales inválidas', 'error');
        }
    });

    (document.getElementById('goto-register') as HTMLButtonElement)
        .addEventListener('click', () => routeTo('#/register'));
}



function viewRegister() {
    app.innerHTML = '';
    renderNavbar();
    const container = document.createElement('main');
    container.className = 'card center-card';
    container.innerHTML = `
    <h2>Registro</h2>
    <form id="form-register" class="form">
        <label>Nombre <input type="text" id="reg-name" required /></label>
        <label>Email <input type="email" id="reg-email" required /></label>
        <label>Contraseña <input type="password" id="reg-pass" required minlength="6" /></label>
        <div class="row">
        <button class="btn primary" type="submit">Crear cuenta</button>
        <button id="goto-login" class="btn ghost" type="button">Volver</button>
        </div>
    </form>
    `;
    app.appendChild(container);

    (document.getElementById('form-register') as HTMLFormElement)
    .addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
        const pass = (document.getElementById('reg-pass') as HTMLInputElement).value;

        try {
            const resp = await API.apiRegister(name, email, pass);

            if (!resp) {
                Swal.fire('Error', 'No se pudo registrar', 'error');
                return;
            }

            writeStore('session', resp);

            const role = resp.role?.toLowerCase();
            routeTo(role === 'admin' ? '#/admin' : '#/home');

        } catch (err) {
            Swal.fire('Error', 'Email ya registrado o problema en el servidor', 'error');
        }
    });

    (document.getElementById('goto-login') as HTMLButtonElement)
        .addEventListener('click', () => routeTo('#/login'));
}

function viewHomeClient() {
    const session = readStore('session', null);
    if (!session) return routeTo('#/login');
    app.innerHTML = '';
    renderNavbar();

    (async () => {
        const apiCats = await API.apiGetCategories();
        const apiProds = await API.apiGetProducts();
        const cats = apiCats ?? readStore('categories', []);
        const prods = apiProds ?? readStore('products', []);

        const container = document.createElement('section');
        container.className = 'container';
        container.innerHTML = `
            <aside class="categories">
                <h3>Categorías</h3>
                <ul id="categories-list"></ul>
            </aside>
            <section class="store">
                <div class="store-header">
                    <input id="search" placeholder="Buscar productos..." />
                    <select id="sort">
                        <option value="">Orden</option>
                        <option value="name-asc">Nombre A-Z</option>
                        <option value="price-asc">Precio ↑</option>
                        <option value="price-desc">Precio ↓</option>
                    </select>
                </div>
                <div id="products-grid" class="grid"></div>
            </section>
        `;
        app.appendChild(container);

        const categoriesList = document.getElementById('categories-list') as HTMLElement;
        categoriesList.innerHTML = `<li><button class="active" data-cat="">Todas</button></li>`;
        cats.forEach((c: any) => {
            const li = document.createElement('li');
            li.innerHTML = `<button data-cat="${c.id}">${c.name}</button>`;
            categoriesList.appendChild(li);
        });

        const grid = document.getElementById('products-grid') as HTMLElement;
        const search = document.getElementById('search') as HTMLInputElement;
        const sort = document.getElementById('sort') as HTMLSelectElement;

        function renderProducts() {
            const qtext = search.value.toLowerCase();
            let list = prods.slice();
            const selectedCat = categoriesList.querySelector('button.active')?.getAttribute('data-cat') || '';
            if (selectedCat) list = list.filter((p: any) => p.categoryId == selectedCat);
            if (qtext) list = list.filter((p: any) =>
                p.name.toLowerCase().includes(qtext) ||
                (p.desc || '').toLowerCase().includes(qtext)
            );
            const s = sort.value;
            if (s === 'name-asc') list.sort((a: any, b: any) => a.name.localeCompare(b.name));
            if (s === 'price-asc') list.sort((a: any, b: any) => a.price - b.price);
            if (s === 'price-desc') list.sort((a: any, b: any) => b.price - a.price);

            grid.innerHTML = '';
            list.forEach((p: any) => {
                const card = document.createElement('div');
                card.className = 'product card';
                card.innerHTML = `
                    <img src="${p.image || 'https://via.placeholder.com/400x240?text=Producto'}" alt="${p.name}">
                    <div class="kv"><strong>${p.name}</strong><span class="badge">${p.available ? 'Disponible' : 'No disponible'}</span></div>
                    <p class="muted">${p.desc || ''}</p>
                    <div class="kv"><div>$ ${p.price}</div><div><button class="btn small add-cart" data-id="${p.id}">Agregar</button></div></div>
                `;
                grid.appendChild(card);
            });

            q('.add-cart').forEach(btn => btn.addEventListener('click', (e: any) => {
                const id = Number((e.target as HTMLElement).getAttribute('data-id'));
                addToCart(id, 1);
            }));
        }

        // eventos
        categoriesList.querySelectorAll('button').forEach(btn =>
            btn.addEventListener('click', (ev) => {
                ev.preventDefault();
                categoriesList.querySelectorAll('button').forEach(x => x.classList.remove('active'));
                (ev.target as HTMLElement).classList.add('active');
                renderProducts();
            })
        );

        search.addEventListener('input', renderProducts);
        sort.addEventListener('change', renderProducts);

        renderProducts(); 
        renderFooter();
    })();
}


function viewCart() {
    const session = readStore('session', null);
    if (!session) return routeTo('#/login');
    app.innerHTML = '';
    renderNavbar();

    const cart = readStore<any[]>('cart', []);
    const products = readStore<any[]>('products', []);

    const main = document.createElement('main');
    main.className = 'container';
    main.style.display = 'flex';
    main.style.gap = '16px';

    const left = document.createElement('div');
    left.style.flex = '1';

    const right = document.createElement('div');
    right.style.width = '360px';

  // 🔹 Carrito vacío
    if (cart.length === 0) {
    left.innerHTML = `
        <div class="card center">
            <p>Tu carrito está vacío.</p>
            <a class="btn primary" href="#/home">Ir a la tienda</a>
        </div>
    `;
    } else {
        left.innerHTML = '<div class="card"><h3>Carrito</h3><div id="cart-items"></div></div>';
        const listEl = left.querySelector('#cart-items') as HTMLElement;
        listEl.innerHTML = '';

    cart.forEach((c) => {
        const p = products.find(pr => pr.id === c.productId) || {
        name: 'Producto desconocido',
        price: 0,
        image: 'https://via.placeholder.com/64'
        };

        const row = document.createElement('div');
        row.className = 'kv';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '8px 0';

        row.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
            <img src="${p.image}" alt="${p.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
            <div>
                <div style="font-weight:600">${p.name}</div>
                <div class="muted">$ ${p.price} c/u</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
            <button class="btn small dec" data-id="${c.productId}">-</button>
            <span class="kv-qty">${c.qty}</span>
            <button class="btn small inc" data-id="${c.productId}">+</button>
        <div style="width:70px;text-align:right">$${p.price * c.qty}</div>
            <button class="btn small del" data-id="${c.productId}">Eliminar</button>
        </div>
        `;
        listEl.appendChild(row);
    });

    // Botones +, -, eliminar
    listEl.querySelectorAll('button.inc').forEach(btn => btn.addEventListener('click', (e: any) => {
        const id = Number(e.target.dataset.id);
        changeQty(id, +1);
    }));
    listEl.querySelectorAll('button.dec').forEach(btn => btn.addEventListener('click', (e: any) => {
        const id = Number(e.target.dataset.id);
        changeQty(id, -1);
    }));
    listEl.querySelectorAll('button.del').forEach(btn => btn.addEventListener('click', async (e: any) => {
        const id = Number(e.target.dataset.id);
        const ok = await showConfirm('¿Eliminar producto?', '¿Querés eliminar este producto del carrito?');
        if (ok) removeFromCart(id);
        }));
    }

  //  Resumen
    const subtotal = cart.reduce((s, c) => {
    const p = products.find(pr => pr.id === c.productId) || { price: 0 };
    return s + (p.price * c.qty);
    }, 0);

    right.innerHTML = `
    <div class="card">
        <h4>Resumen</h4>
        <p>Subtotal: $${subtotal}</p>
        <p>Envío: $500</p>
        <p><strong>Total: $${subtotal + 500}</strong></p>
        <div class="row" style="margin-top:12px">
        <button id="btn-checkout" class="btn primary">Confirmar pedido</button>
        <button id="btn-clear" class="btn">Vaciar</button>
        </div>
    </div>
    `;

  //  Eventos de botones
    (right.querySelector('#btn-clear') as HTMLButtonElement).addEventListener('click', () => {
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
        writeStore('cart', []);
        updateCartCount();
        Swal.fire('Carrito vaciado', '', 'success').then(() => routeTo('#/cart'));
        }
    });
    });

    (right.querySelector('#btn-checkout') as HTMLButtonElement).addEventListener('click', confirmCheckout);

  //  AGREGAR ESTAS DOS LÍNEAS FINALES
    main.appendChild(left);
    main.appendChild(right);
    app.appendChild(main);
}


// Cambiar cantidad de un producto en el carrito

function changeQty(productId: number, delta: number) {
    const cart = readStore<any[]>('cart', []);
    const item = cart.find(i => i.productId === productId);
    if (item) {
    item.qty += delta;
    if (item.qty <= 0) return removeFromCart(productId);
    writeStore('cart', cart);
    updateCartCount();
    routeTo('#/cart');
    }
}

// Eliminar producto del carrito (con confirmación)
function removeFromCart(productId: number) {
Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Se quitará este producto del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(result => {
    if (result.isConfirmed) {
        let cart = readStore<any[]>('cart', []);
        cart = cart.filter(i => i.productId !== productId);
        writeStore('cart', cart);
        updateCartCount();
        Swal.fire({
            title: 'Eliminado',
            text: 'El producto fue quitado del carrito',
            icon: 'success'
        }).then(() => routeTo('#/cart'));
        }
    });
}

// Confirmar compra (checkout)
function confirmCheckout() {
    const cart = readStore<any[]>('cart', []);
    const products = readStore<any[]>('products', []);
    const session = readStore<any>('session');
    const subtotal = cart.reduce((s, i) => {
    const p = products.find(p => p.id === i.productId);
    return s + (p?.price || 0) * i.qty;
    }, 0);

    Swal.fire({
        title: '¿Confirmar pedido?',
        text: `Total a pagar: $${subtotal + 500}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
    if (result.isConfirmed) {
        const orders = readStore<any[]>('orders', []);
        const id = (orders.at(-1)?.id || 0) + 1;
        const order = {
            id,
            userId: session.id,
            items: cart,
            total: subtotal + 500,
            status: 'pending',
            date: new Date().toISOString()
        };
        orders.push(order);
        writeStore('orders', orders);
        writeStore('cart', []);
        updateCartCount();

        Swal.fire({
            title: 'Pedido confirmado',
            text: `Tu pedido fue registrado correctamente (ID: ${id})`,
            icon: 'success'
        }).then(() => routeTo('#/home'));
        }
    });
}


function requireAdmin(){ const session = readStore('session', null); if(!session) return routeTo('#/login'); if (session.role !== 'admin') return routeTo('#/home'); }

function viewAdminHome(){ requireAdmin(); app.innerHTML=''; renderNavbar(); const tpl = document.createElement('div'); tpl.className='container'; tpl.innerHTML=`<div class="card"><h3>Dashboard</h3></div>`; app.appendChild(tpl); }

function viewAdminCategories(){ requireAdmin(); app.innerHTML=''; renderNavbar(); const content = document.createElement('div'); content.className='container'; content.innerHTML=`<div class="card"><h3>Categorías (Admin)</h3><div id="cats-area"></div></div>`; app.appendChild(content);
    const cats = readStore('categories', []);
    const tbody = document.createElement('div'); cats.forEach((c:any)=> {
    const row = document.createElement('div'); row.className='kv'; row.innerHTML=`${c.id} - ${c.name} <div><button class="btn small edit-cat" data-id="${c.id}">Editar</button><button class="btn small del-cat" data-id="${c.id}">Eliminar</button></div>`;
    tbody.appendChild(row);
    });
    (content.querySelector('#cats-area') as HTMLElement).appendChild(tbody);
    const btnNew = document.createElement('button'); btnNew.className='btn primary'; btnNew.textContent='Nueva categoría'; btnNew.addEventListener('click', ()=>{
    const name = prompt('Nombre categoría'); if(!name) return; const desc = prompt('Descripción') || '';
    const categories = readStore('categories', []); const id = (categories.at(-1)?.id || 0) + 1;
    categories.push({ id, name, description: desc, image: ''}); writeStore('categories', categories); routeTo('#/admin/categories');
    });
    content.prepend(btnNew);
    q('.edit-cat').forEach(b => b.addEventListener('click', (e:any) => {
    const id = Number(e.target.dataset.id);
    const categories = readStore('categories', []); const cat = categories.find((x:any)=>x.id===id);
    const name = prompt('Editar nombre', cat.name); if(!name) return; cat.name = name; cat.description = prompt('Editar descripción', cat.description) || cat.description;
    writeStore('categories', categories); routeTo('#/admin/categories');
    }));
    q('.del-cat').forEach(b => b.addEventListener('click', (e: any) => {
    const id = Number(e.target.dataset.id);

    const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: "¿Eliminar categoría?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
        let cats = readStore('categories', []);
        cats = cats.filter((c: any) => c.id !== id);
        writeStore('categories', cats);

        swalWithBootstrapButtons.fire({
            title: "Eliminado",
            text: "La categoría fue eliminada correctamente.",
            icon: "success"
        }).then(() => routeTo('#/admin/categories'));
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
            title: "Cancelado",
            text: "La categoría no fue eliminada.",
            icon: "error"
        });
    }
    });
}));
}

function viewAdminProducts(){ requireAdmin(); app.innerHTML=''; renderNavbar(); const content = document.createElement('div'); content.className='container'; content.innerHTML=`<div class="card"><h3>Productos (Admin)</h3><div id="prods-area"></div></div>`; app.appendChild(content);
    const products = readStore('products', []); const area = content.querySelector('#prods-area') as HTMLElement;
    products.forEach((p:any)=> { const row = document.createElement('div'); row.className='kv'; row.innerHTML=`${p.id} - ${p.name} - $${p.price} <div><button class="btn small edit-prod" data-id="${p.id}">Editar</button><button class="btn small del-prod" data-id="${p.id}">Eliminar</button></div>`; area.appendChild(row); });
    const btnNew = document.createElement('button'); btnNew.className='btn primary'; btnNew.textContent='Nuevo producto'; btnNew.addEventListener('click', ()=> {
    const name = prompt('Nombre'); if(!name) return; const price = Number(prompt('Precio','100')); const stock = Number(prompt('Stock','0')); const categoryId = Number(prompt('ID categoría', '1'));
    const products = readStore('products', []); const id = (products.at(-1)?.id || 0) + 1; products.push({ id, name, desc:'', price, stock, categoryId, image:'', available:true }); writeStore('products', products); routeTo('#/admin/products');
    });
    content.prepend(btnNew);
    q('.edit-prod').forEach(b => b.addEventListener('click', (e:any) => {
    const id = Number(e.target.dataset.id); const products = readStore('products', []); const p = products.find((x:any)=>x.id===id);
    const name = prompt('Nombre', p.name); if(!name) return; p.name = name; p.price = Number(prompt('Precio', p.price)); p.stock = Number(prompt('Stock', p.stock)); writeStore('products', products); routeTo('#/admin/products');
    }));
    q('.del-prod').forEach(b=> b.addEventListener('click', (e:any) => { if(!confirm('Eliminar producto?')) return; const id = Number(e.target.dataset.id); let products = readStore('products', []); products = products.filter((x:any)=>x.id!==id); writeStore('products', products); routeTo('#/admin/products'); }));
}

function viewAdminOrders(){ requireAdmin(); app.innerHTML=''; renderNavbar(); const content = document.createElement('div'); content.className='container'; content.innerHTML=`<div class="card"><h3>Pedidos (Admin)</h3><div id="orders-area"></div></div>`; app.appendChild(content);
    const orders = readStore('orders', []); const users = readStore('users', []);
    const area = content.querySelector('#orders-area') as HTMLElement;
    orders.forEach((o:any)=> {
    const u = users.find((x:any)=>x.id===o.userId);
    const row = document.createElement('div'); row.className='kv'; row.innerHTML=`ID:${o.id} - ${u?.name||'--'} - $${o.total} - ${o.status} <select data-id="${o.id}" class="state-select"><option value="pending">pending</option><option value="processing">processing</option><option value="completed">completed</option><option value="cancelled">cancelled</option></select>`;
    area.appendChild(row);
    row.querySelector('.state-select')?.addEventListener('change', (e:any)=> {
    const id = Number(e.target.dataset.id); const ords = readStore('orders', []); const ord = ords.find((x:any)=>x.id===id); ord.status = e.target.value; writeStore('orders', ords); alert('Estado actualizado');
    });
});
}

function addToCart(productId: number, qty = 1) {
    const cart = readStore<any[]>('cart', []);

  // Normalizar datos: asegurarse de que todos tengan productId
    const normalized = cart.map(c => ({
    productId: c.productId ?? c.id,
    qty: c.qty ?? 1
    }));

    const item = normalized.find(c => c.productId === productId);
    if (item) item.qty += qty;
    else normalized.push({ productId, qty });

    writeStore('cart', normalized);
    updateCartCount();

    toast.fire({
        icon: 'success',
        title: 'Producto agregado al carrito'
    });
}

function renderFooter() {
    const existing = document.querySelector('.footer');
    if (existing) existing.remove();

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
    <div class="footer-content">
        <p>© ${new Date().getFullYear()} Santa Julia — Todos los derechos reservados.</p>
        <nav class="footer-links">
        <a href="#/home">Inicio</a>
        <a href="#/about">Nosotros</a>
        <a href="#/contact">Contacto</a>
        </nav>
    </div>
    `;

    app.appendChild(footer);
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

export function initApp(){ 
    handleRoute(); 
    renderNavbar();
    renderFooter(); 
}

