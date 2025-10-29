import Swal from 'sweetalert2';
import { readStore } from './store';

type Session = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export function requireAdmin(routeTo: (path: string) => void) {
    const session = readStore<Session>('session'); 
    if (!session || session.role !== 'admin') {
        Swal.fire('Acceso restringido', 'Debes ser administrador para ingresar', 'warning');
        routeTo('#/login');
        throw new Error('No autorizado');
    }
}