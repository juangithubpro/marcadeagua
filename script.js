// ── Tokens ──────────────────────────────────────────────────────
const BASE_DATOS_CLIENTES = {
    "NADA2026":   { nombre: "Nada Digital",        creditosIniciales: 20 },
    "SHOWROOMSP": { nombre: "Showroom Sáenz Peña", creditosIniciales: 50 }
};

let formatoActual  = "post-vertical";
let posicionActual = "abajo-derecha";

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Grillas de toggles
    bindToggle('formato', (val) => {
        formatoActual = val;
        const lienzo = document.getElementById('lienzo-objetivo');
        if (lienzo) lienzo.className = `lienzo-producto formato-${val}`;
        aplicarEstilosLogo();
    });

    bindToggle('posicion', (val) => {
        posicionActual = val;
        const logo = document.getElementById('placa-logo');
        if (logo) {
            // Limpiar transform inline antes de cambiar clase
            if (val !== 'centro-gigante') logo.style.transform = '';
            logo.className = `logo-marca-agua ${val}`;
            aplicarEstilosLogo();
        }
    });

    // Sliders
    const rangeOp  = document.getElementById('range-opacidad');
    const rangeSz  = document.getElementById('range-tamano');
    const valOp    = document.getElementById('val-opacidad');
    const valSz    = document.getElementById('val-tamano');

    rangeOp?.addEventListener('input', () => {
        if (valOp) valOp.textContent = Math.round(rangeOp.value * 100) + '%';
        aplicarEstilosLogo();
    });
    rangeSz?.addEventListener('input', () => {
        if (valSz) valSz.textContent = rangeSz.value;
        aplicarEstilosLogo();
    });

    // Input foto producto
    document.getElementById('input-foto')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const fondo = document.getElementById('placa-foto');
            if (fondo) {
                fondo.style.backgroundImage = `url('${ev.target.result}')`;
                fondo.classList.add('has-image');
            }
            const sub = document.getElementById('nombre-foto');
            if (sub) sub.textContent = truncar(file.name);
            document.getElementById('label-foto')?.classList.add('loaded');
        };
        reader.readAsDataURL(file);
    });

    // Input logo
    document.getElementById('input-logo')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const logo = document.getElementById('placa-logo');
            if (logo) {
                logo.src = ev.target.result;
                logo.style.display = 'block';
                aplicarEstilosLogo();
            }
            const sub = document.getElementById('nombre-logo');
            if (sub) sub.textContent = truncar(file.name);
            document.getElementById('label-logo')?.classList.add('loaded');
        };
        reader.readAsDataURL(file);
    });

    // Swipe táctil
    setupSwipe();

    // Auto-login
    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarApp(tokenGuardado);
    }
});

// ── Toggle groups ────────────────────────────────────────────────
function bindToggle(target, cb) {
    const wrap = document.querySelector(`[data-target="${target}"]`);
    if (!wrap) return;
    wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-value]');
        if (!btn) return;
        wrap.querySelectorAll('[data-value]').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        cb(btn.getAttribute('data-value'));
    });
}

// ── Mobile tabs ──────────────────────────────────────────────────
function mobileTab(tab) {
    const controles = document.getElementById('panel-controles');
    const preview   = document.getElementById('panel-preview');
    const btnC      = document.getElementById('btn-tab-config');
    const btnP      = document.getElementById('btn-tab-preview');

    if (tab === 'config') {
        controles?.classList.remove('oculto');
        preview?.classList.remove('visible');
        btnC?.classList.add('activo');
        btnP?.classList.remove('activo');
    } else {
        controles?.classList.add('oculto');
        preview?.classList.add('visible');
        btnP?.classList.add('activo');
        btnC?.classList.remove('activo');
    }
}

function setupSwipe() {
    let startX = 0;
    const umbral = 60;

    const addSwipe = (el, onLeft, onRight) => {
        if (!el) return;
        el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend',   e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) < umbral) return;
            if (diff > 0) onLeft();
            else onRight();
        }, { passive: true });
    };

    addSwipe(
        document.getElementById('panel-controles'),
        () => mobileTab('preview'),
        () => {}
    );
    addSwipe(
        document.getElementById('panel-preview'),
        () => {},
        () => mobileTab('config')
    );
}

// ── Logo styles ──────────────────────────────────────────────────
function aplicarEstilosLogo() {
    const logo   = document.getElementById('placa-logo');
    const rangeOp = document.getElementById('range-opacidad');
    const rangeSz = document.getElementById('range-tamano');
    if (!logo || !rangeOp || !rangeSz) return;

    logo.style.opacity = rangeOp.value;

    const sz = parseInt(rangeSz.value);
    if (posicionActual === 'centro-gigante') {
        logo.style.width  = `${sz * 3.5}px`;
        logo.style.height = 'auto';
        // No tocar transform, lo maneja la clase CSS
    } else {
        logo.style.width     = `${sz * 2.5}px`;
        logo.style.height    = 'auto';
        logo.style.transform = '';
    }
}

// ── Auth ────────────────────────────────────────────────────────
function validarToken() {
    const input    = document.getElementById('input-token');
    const errorEl  = document.getElementById('error-token');
    const token    = input?.value.trim().toUpperCase();

    if (!token) {
        if (errorEl) errorEl.textContent = 'Ingresá un token.';
        return;
    }
    if (BASE_DATOS_CLIENTES[token]) {
        if (errorEl) errorEl.textContent = '';
        localStorage.setItem('saas_token', token);
        if (!localStorage.getItem(`creditos_${token}`)) {
            localStorage.setItem(`creditos_${token}`, BASE_DATOS_CLIENTES[token].creditosIniciales);
        }
        cargarApp(token);
    } else {
        if (errorEl) errorEl.textContent = 'Token inválido.';
    }
}

document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const login = document.getElementById('pantalla-token');
    if (login && !login.classList.contains('view-oculta')) validarToken();
});

function cargarApp(token) {
    document.getElementById('pantalla-token')?.classList.add('view-oculta');
    document.getElementById('interfaz-principal')?.classList.remove('view-oculta');
    actualizarContador(token);
    aplicarEstilosLogo();
}

function actualizarContador(token) {
    const cred   = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;
    const numEl  = document.getElementById('contador-creditos');
    const btnDl  = document.getElementById('btn-descargar');
    const txtDl  = document.getElementById('btn-dl-text');

    if (numEl) numEl.textContent = cred;
    if (btnDl) btnDl.disabled = (cred <= 0);
    if (txtDl && cred <= 0) txtDl.textContent = 'Sin créditos';
}

// ── Descarga ────────────────────────────────────────────────────
async function procesarDescarga() {
    const token  = localStorage.getItem('saas_token');
    const lienzo = document.getElementById('lienzo-objetivo');
    const btnDl  = document.getElementById('btn-descargar');
    const txtDl  = document.getElementById('btn-dl-text');
    let cred     = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;

    if (cred <= 0 || !lienzo) return;

    if (txtDl) txtDl.textContent = 'Procesando…';
    if (btnDl) btnDl.disabled = true;

    try {
        const canvas = await html2canvas(lienzo, {
            useCORS: true,
            allowTaint: true,
            scale: 3,
            backgroundColor: null,
            logging: false
        });

        const link = document.createElement('a');
        link.download = `watermark-pro-${formatoActual}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        cred--;
        localStorage.setItem(`creditos_${token}`, cred);
        actualizarContador(token);
        if (txtDl) txtDl.textContent = '¡Guardado! ↓';
        setTimeout(() => {
            if (txtDl) txtDl.textContent = 'Guardar imagen';
            if (btnDl && cred > 0) btnDl.disabled = false;
        }, 2500);

    } catch (err) {
        console.error(err);
        alert('Error al procesar. Intentá de nuevo.');
        if (txtDl) txtDl.textContent = 'Guardar imagen';
        actualizarContador(token);
    }
}

function cerrarSesion() {
    localStorage.removeItem('saas_token');
    location.reload();
}

function truncar(nombre) {
    return nombre.length > 18 ? nombre.slice(0, 15) + '…' : nombre;
}
