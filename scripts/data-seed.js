import { readStore, writeStore } from './store.js';

const SAMPLE_USERS = [
  { id:1, name:'Admin', email:'admin@food.com', pass:'admin123', role:'admin'},
  { id:2, name:'Enzo', email:'enzogadengra@gmail.com', pass: 'enzo123', role:'admin'},
  { id:2, name:'Gonza', email:'gonza@gmail.com', pass: 'gonza123', role:'admin'},
  { id:2, name:'Marti', email:'marti@gmail.com', pass: 'marti123', role:'admin'},
  { id:2, name:'Maxi', email:'maxi@gmail.com', pass: 'maxi123', role:'admin'},
  { id:2, name:'Cliente', email:'cliente@food.com', pass:'cliente123', role:'cliente'}
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Pizzas', description: 'Pizzas clásicas', image: '/img/pizza.png' },
  { id: 2, name: 'Postres', description: 'Dulces', image: '/img/panqueques.png' },
  { id: 3, name: 'Hamburguesas', description: 'Hamburguesas de la casa', image: '/img/cheeseburger.png' },
  { id: 4, name: 'Bebidas', description: 'Bebidas frías', image: '/img/coca.png' }
];


const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Muzzarella',  desc:'Pizza clásica', price:15000, stock:10, categoryId:1, image:'/img/pizza.png', available:true },
  { id: 9, name: 'Fugazzetta',  desc:'Cebolla y mucho queso', price:18000, stock:8, categoryId:1, image:'/img/fugazzetta.png', available:true },
  { id:11, name: 'Napolitana',  desc:'Tomate, ajo y orégano', price:17000, stock:5, categoryId:1, image:'/img/napolitana.png', available:true },
  { id:12, name: 'Especial',    desc:'Jamón, morrón, huevo, aceitunas', price:15000, stock:4, categoryId:1, image:'/img/especial.png', available:true },
  { id: 2, name: 'Panqueque',   desc:'Con dulce de leche', price:4000, stock:5, categoryId:2, image:'/img/panqueques.png', available:true },
  { id:10, name: 'Helado',      desc:'Artesanal', price:2500, stock:7, categoryId:2, image:'/img/helado.png', available:true },
  { id:13, name: 'Tiramisú',    desc:'Clásico italiano', price:6000, stock:6, categoryId:2, image:'/img/tiramisu.png', available:true },
  { id:14, name: 'Cheesecake',  desc:'Base galleta', price:5500, stock:4, categoryId:2, image:'/img/cheesecake.png', available:true },
  { id: 3, name: 'Cheeseburger',desc:'Cheddar y panceta', price:15000, stock:8, categoryId:3, image:'/img/cheeseburger.png', available:true },
  { id: 4, name: 'La Gran Julia',desc:'Doble carne...', price:17000, stock:6, categoryId:3, image:'/img/LagranJulia.png', available:true },
  { id:15, name: 'Santa Burguer',desc:'Triple carne', price:18000, stock:5, categoryId:3, image:'/img/santaburguer.png', available:true },
  { id: 5, name: 'Coca Cola',   desc:'500ml', price:1500, stock:15, categoryId:4, image:'/img/coca.png', available:true },
  { id: 6, name: 'Sprite',      desc:'500ml', price:1500, stock:12, categoryId:4, image:'/img/sprite.png', available:true },
  { id: 7, name: 'Fanta',       desc:'500ml', price:1500, stock:10, categoryId:4, image:'/img/fanta.png', available:true },
  { id: 8, name: 'Cerveza Corona', desc:'355ml', price:1800, stock:8, categoryId:4, image:'/img/corona.png', available:true }
];

export function ensureSeed() {
  if (!readStore('users'))      writeStore('users', SAMPLE_USERS);
  if (!readStore('categories')) writeStore('categories', DEFAULT_CATEGORIES);
  if (!readStore('products'))   writeStore('products', DEFAULT_PRODUCTS);
  if (!readStore('cart'))       writeStore('cart', []);
}
