const BASE = import.meta.env.VITE_API_URL; 

type Obj = Record<string, any>;

async function request(path: string, method='GET', body?: any) {
    try {
        const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
            const res = await fetch(`${BASE}${path}`, opts);
        if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
    } catch (err) {
    
    console.warn('API request failed:', err);
    return null;
    }
}

export async function apiLogin(email: string, pass: string) {
    return await request('/auth/login', 'POST', { email, password: pass });
}
export async function apiGetProducts() { return await request('/products'); }
export async function apiGetCategories() { return await request('/categories'); }
export async function apiCreateCategory(payload: Obj) { return await request('/categories', 'POST', payload); }
export async function apiCreateProduct(payload: Obj) { return await request('/products', 'POST', payload); }

