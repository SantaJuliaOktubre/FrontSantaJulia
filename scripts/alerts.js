
export const Alerts = {
    success(title, text = '') {
    Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#7a3ef3',
        background: '#1a002b',
        color: '#fff'
        });
    },

    error(title, text = '') {
    Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#7a3ef3',
        background: '#1a002b',
        color: '#fff'
        });
    },

    info(title, text = '') {
    Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonColor: '#7a3ef3',
        background: '#1a002b',
        color: '#fff'
    });
    },

    confirm(title, text = '¿Estás seguro?', confirmText = 'Confirmar') {
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#7a3ef3',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        background: '#1a002b',
        color: '#fff'
    }).then(r => r.isConfirmed);
    },

    toast(icon, title) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1a002b',
        color: '#fff'
    });
    Toast.fire({ icon, title });
    }
};
