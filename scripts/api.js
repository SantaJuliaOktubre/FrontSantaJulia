// scripts/api.js
import { readStore, writeStore } from './store.js';

const USE_BACKEND = true;

// Cambiar al puerto donde está corriendo tu backend
const BASE = 'http://localhost:8081/api';
let token = localStorage.getItem('token') || null;

async function req(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const r = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}

// Backend login
async function beLogin(email, pass) {
  const data = await req('/auth/login', { 
    method: 'POST', 
    body: JSON.stringify({ email, password: pass }) 
  });
  token = data.token || null;
  if (token) localStorage.setItem('token', token);
  return { id: data.id, name: data.name, email: data.email, role: data.role };
}

// Backend register
async function beRegister(name, email, pass) {
  const data = await req('/auth/register', { 
    method: 'POST', 
    body: JSON.stringify({ name, email, password: pass }) 
  });
  // No hay token al registrar, solo devolvemos el user
  return { id: data.id, name: data.name, email: data.email, role: data.role };
}

// Otras funciones de backend
async function beGetCategories() { return req('/categories', { method: 'GET' }); }
async function beGetProducts()   { return req('/products',   { method: 'GET' }); }
async function beCreateOrder(order) { return req('/pedidos', { method:'POST', body: JSON.stringify(order) }); }
async function beGetOrders()        { return req('/orders', { method:'GET' }); }

// Mock functions (local)
async function mkLogin(email, pass) {
  const users = readStore('users', []);
  return users.find(u => u.email === email && u.pass === pass) || null;
}
async function mkRegister(name, email, pass) {
  const users = readStore('users', []);
  if (users.some(u => u.email === email)) throw new Error('Email ya registrado');
  const id = (users.at(-1)?.id || 0) + 1;
  const role = 'cliente';
  const user = { id, name, email, pass, role };
  users.push(user);
  writeStore('users', users);
  return user;
}
async function mkGetCategories() { return readStore('categories', []); }
async function mkGetProducts()   { return readStore('products', []); }
async function mkCreateOrder(order) {
  const orders = readStore('orders', []);
  const id = (orders.at(-1)?.id || 0) + 1;
  orders.push({ id, ...order, status: 'pending', date: new Date().toISOString() });
  writeStore('orders', orders);
  return { id };
}
async function mkGetOrders() { return readStore('orders', []); }

// ---- Export unify ----
export async function apiLogin(email, pass)      { return USE_BACKEND ? beLogin(email, pass) : mkLogin(email, pass); }
export async function apiRegister(n,e,p)         { return USE_BACKEND ? beRegister(n,e,p)   : mkRegister(n,e,p); }
export async function apiGetCategories()         { return USE_BACKEND ? beGetCategories()   : mkGetCategories(); }
export async function apiGetProducts()           { return USE_BACKEND ? beGetProducts()     : mkGetProducts(); }
export async function apiCreateOrder(order)      { return USE_BACKEND ? beCreateOrder(order): mkCreateOrder(order); }
export async function apiGetOrders()             { return USE_BACKEND ? beGetOrders()       : mkGetOrders(); }
