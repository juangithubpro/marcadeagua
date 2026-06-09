// ── Tokens ──────────────────────────────────────────────────────
const BASE_DATOS_CLIENTES = {
    "NADA2026":   { nombre: "Nada Digital",        creditosIniciales: 20 },
    "SHOWROOMSP": { nombre: "Showroom Sáenz Peña", creditosIniciales: 50 }
};

let formatoActual  = "post-vertical";
let posicionActual = "abajo-derecha";

// ── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Grillas de botones
    bindToggleGroup('formato', (val) => {
        formatoActual = val;
        const lienzo = document.getElementById('lienzo-objetivo');
        if (lienzo) {
            lienzo.className = `lienzo-producto formato-${val}`;
        }
        aplicarEstilosLogo();
    });

    bindToggleGroup('posicion', (val) => {
        posicionActual = val;
        const placaLogo = document.getElementById('placa-logo');
        if (placaLogo) {
            // Resetear transform antes de cambiar clase para no acumular
            placaLogo.style.transform = '';
            placaLogo.className = `logo-marca-agua ${val}`;
            aplicarEstilosLogo();
        }
    });

    // Sliders
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano   = document.getElementById('range-tamano');
    const valOpacidad   = document.getElementById('val-opacidad');
    const valTamano     = document.getElementById('val-tamano');

    rangeOpacidad?.addEventListener('input', () => {
        if (valOpacidad) valOpacidad.textContent = Math.round(rangeOpacidad.value * 100) + '%';
        aplicarEstilosLogo();
    });

    rangeTamano?.addEventListener('input', () => {
        if (valTamano) valTamano.textContent = rangeTamano.value;
        aplicarEstilosLogo();
    });

    // Input foto
    document.getElementById('input-foto')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const placaFoto = document.getElementById('placa-foto');
            if (placaFoto) {
                placaFoto.style.backgroundImage = `url('${ev.target.result}')`;
                placaFoto.classList.add('has-image');
            }
            const nombreFoto = document.getElementById('nombre-foto');
            if (nombreFoto) nombreFoto.textContent = truncarNombre(file.name);
            document.getElementById('label-foto')?.classList.add('loaded');
        };
        reader.readAsDataURL(file);
    });

    // Input logo
    document.getElementById('input-logo')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const placaLogo = document.getElementById('placa-logo');
        if (!file || !placaLogo) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            placaLogo.src = ev.target.result;
            placaLogo.style.display = 'block';
            const nombreLogo = document.getElementById('nombre-logo');
            if (nombreLogo) nombreLogo.textContent = truncarNombre(file.name);
            document.getElementById('label-logo')?.classList.add('loaded');
            aplicarEstilosLogo();
        };
        reader.readAsDataURL(file);
    });

    // Swipe táctil para mobile
    configurarSwipe();

    // Auto-login si hay token guardado
    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarInterfazSaaS(tokenGuardado);
    }
});

// ── Toggle Groups ────────────────────────────────────────────────
function bindToggleGroup(target, callback) {
    const contenedor = document.querySelector(`[data-target="${target}"]`);
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        const boton = e.target.closest('[data-value]');
        if (!boton) return;

        // Quitar activo de todos los hijos directos con data-value
        contenedor.querySelectorAll('[data-value]').forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        callback(boton.getAttribute('data-value'));
    });
}

// ── Mobile tabs ──────────────────────────────────────────────────
function mobileTab(tab) {
    const panelControles = document.getElementById('panel-controles');
    const panelPreview   = document.getElementById('panel-preview');
    const btnConfig      = document.getElementById('btn-tab-config');
    const btnPreview     = document.getElementById('btn-tab-preview');

    // Los botones de mobile-nav están DENTRO de panel-preview en el HTML,
    // entonces ambos paneles existen siempre
    if (tab === 'config') {
        panelControles?.classList.remove('mobile-hidden');
        panelPreview?.classList.remove('mobile-visible');
        btnConfig?.classList.add('activo');
        btnPreview?.classList.remove('activo');
    } else {
        panelControles?.classList.add('mobile-hidden');
        panelPreview?.classList.add('mobile-visible');
        btnPreview?.classList.add('activo');
        btnConfig?.classList.remove('activo');
    }
}

function configurarSwipe() {
    const panelPreview = document.getElementById('panel-preview');
    if (!panelPreview) return;
    let inicioX = 0;

    panelPreview.addEventListener('touchstart', (e) => {
        inicioX = e.touches[0].clientX;
    }, { passive: true });

    panelPreview.addEventListener('touchend', (e) => {
        const dif = inicioX - e.changedTouches[0].clientX;
        if (Math.abs(dif) > 70) {
            mobileTab(dif > 0 ? 'preview' : 'config');
        }
    }, { passive: true });

    const panelControles = document.getElementById('panel-controles');
    if (panelControles) {
        panelControles.addEventListener('touchstart', (e) => {
            inicioX = e.touches[0].clientX;
        }, { passive: true });
        panelControles.addEventListener('touchend', (e) => {
            const dif = inicioX - e.changedTouches[0].clientX;
            if (dif > 70) mobileTab('preview');
        }, { passive: true });
    }
}

// ── Logo styles ──────────────────────────────────────────────────
function aplicarEstilosLogo() {
    const placaLogo    = document.getElementById('placa-logo');
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano  = document.getElementById('range-tamano');

    if (!placaLogo || !rangeOpacidad || !rangeTamano) return;

    const opacidad = parseFloat(rangeOpacidad.value);
    const tamano   = parseInt(rangeTamano.value);

    placaLogo.style.opacity = opacidad;

    if (posicionActual === 'centro-gigante') {
        const px = tamano * 3.5;
        placaLogo.style.width  = `${px}px`;
        placaLogo.style.height = 'auto';
        // Para centro, la clase CSS usa transform: translate(-50%,-50%)
        // No sobreescribir con style.transform aquí
    } else {
        const px = tamano * 2.5;
        placaLogo.style.width  = `${px}px`;
        placaLogo.style.height = 'auto';
        placaLogo.style.transform = '';
    }
}

// ── Auth ────────────────────────────────────────────────────────
function validarToken() {
    const tokenInput = document.getElementById('input-token')?.value.trim().toUpperCase();
    const errorMsg   = document.getElementById('error-token');

    if (!tokenInput) {
        if (errorMsg) errorMsg.textContent = 'Ingresá un token válido.';
        return;
    }

    if (BASE_DATOS_CLIENTES[tokenInput]) {
        if (errorMsg) errorMsg.textContent = '';
        localStorage.setItem('saas_token', tokenInput);
        if (localStorage.getItem(`creditos_${tokenInput}`) === null) {
            localStorage.setItem(`creditos_${tokenInput}`, BASE_DATOS_CLIENTES[tokenInput].creditosIniciales);
        }
        cargarInterfazSaaS(tokenInput);
    } else {
        if (errorMsg) errorMsg.textContent = 'Token inválido. Verificá e intentá de nuevo.';
    }
}

// Enter key en input
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginScreen = document.getElementById('pantalla-token');
        if (loginScreen && !loginScreen.classList.contains('view-oculta')) {
            validarToken();
        }
    }
});

function cargarInterfazSaaS(token) {
    document.getElementById('pantalla-token')?.classList.add('view-oculta');
    document.getElementById('interfaz-principal')?.classList.remove('view-oculta');
    actualizarContador(token);
    aplicarEstilosLogo();
}

function actualizarContador(token) {
    const creditos        = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;
    const contadorEl      = document.getElementById('contador-creditos');
    const btnDescargar    = document.getElementById('btn-descargar');
    const btnDlText       = document.getElementById('btn-dl-text');

    if (contadorEl) contadorEl.textContent = creditos;
    if (btnDescargar) btnDescargar.disabled = (creditos <= 0);
    if (btnDlText && creditos <= 0) btnDlText.textContent = 'Sin créditos disponibles';
}

// ── Download ────────────────────────────────────────────────────
async function procesarDescarga() {
    const token      = localStorage.getItem('saas_token');
    const btnDl      = document.getElementById('btn-descargar');
    const btnDlText  = document.getElementById('btn-dl-text');
    const lienzo     = document.getElementById('lienzo-objetivo');
    let creditos     = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;

    if (creditos <= 0 || !lienzo) return;

    if (btnDlText) btnDlText.textContent = 'Procesando…';
    if (btnDl)    btnDl.disabled = true;

    try {
        const canvas = await html2canvas(lienzo, {
            useCORS: true, allowTaint: true, scale: 3, backgroundColor: null
        });

        const link = document.createElement('a');
        link.download = `watermark-pro-${formatoActual}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        creditos--;
        localStorage.setItem(`creditos_${token}`, creditos);
        actualizarContador(token);
        if (btnDlText) btnDlText.textContent = '¡Guardado! Descargar otra';
        setTimeout(() => {
            if (btnDlText) btnDlText.textContent = 'Guardar imagen';
        }, 2500);

    } catch (err) {
        console.error(err);
        alert('Error al procesar la imagen. Intentá de nuevo.');
        if (btnDlText) btnDlText.textContent = 'Guardar imagen';
        actualizarContador(token);
    }
}

function cerrarSesion() {
    localStorage.removeItem('saas_token');
    location.reload();
}

// ── Utils ────────────────────────────────────────────────────────
function truncarNombre(nombre) {
    return nombre.length > 18 ? nombre.substring(0, 15) + '…' : nombre;
}
