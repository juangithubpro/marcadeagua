const BASE_DATOS_CLIENTES = {
    "NADA2026": { nombre: "Nada Digital", creditosIniciales: 20 },
    "SHOWROOMSP": { nombre: "Showroom Sáenz Peña", creditosIniciales: 50 }
};

let formatoActual = "post-vertical";
let posicionActual = "abajo-derecha";

document.addEventListener('DOMContentLoaded', () => {
    // 🎛️ CAPTURA DE BOTONERAS ESTILO REMOTO
    configurarGrillaBotones('formato', (val) => {
        formatoActual = val;
        document.getElementById('lienzo-objetivo').className = `lienzo-producto formato-${val}`;
    });

    configurarGrillaBotones('posicion', (val) => {
        posicionActual = val;
        const placaLogo = document.getElementById('placa-logo');
        if (placaLogo) {
            placaLogo.className = `logo-marca-agua ${val}`;
            aplicarEstilosLogo();
        }
    });

    // Inputs de arrastre de archivos e interactivos
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano = document.getElementById('range-tamano');
    const inputFoto = document.getElementById('input-foto');
    const inputLogo = document.getElementById('input-logo');

    if (rangeOpacidad) rangeOpacidad.addEventListener('input', aplicarEstilosLogo);
    if (rangeTamano) rangeTamano.addEventListener('input', aplicarEstilosLogo);

    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const placaFoto = document.getElementById('placa-foto');
            if (file && placaFoto) {
                const reader = new FileReader();
                reader.onload = (event) => placaFoto.style.backgroundImage = `url('${event.target.result}')`;
                reader.readAsDataURL(file);
            }
        });
    }

    if (inputLogo) {
        inputLogo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const placaLogo = document.getElementById('placa-logo');
            if (file && placaLogo) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    placaLogo.src = event.target.result;
                    placaLogo.style.display = 'block';
                    aplicarEstilosLogo();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Soporte para deslizar con el dedo en celular (Swipe táctil)
    configurarSwipeTactil();

    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarInterfazSaaS(tokenGuardado);
    }
});

// Lógica para transformar una grilla de divs en botones de control único
function configurarGrillaBotones(targetData, callback) {
    const contenedor = document.querySelector(`[data-target="${targetData}"]`);
    if (!contenedor) return;

    contenedor.addEventListener('click', (e) => {
        const boton = e.target.closest('.btn-remoto');
        if (!boton) return;

        contenedor.querySelectorAll('.btn-remoto').forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        callback(boton.getAttribute('data-value'));
    });
}

// Cambiar de pestaña fluidamente (Deslizador horizontal)
function cambiarPagina(numPagina) {
    const deslizador = document.getElementById('deslizador-paginas');
    const btnTabControles = document.getElementById('btn-tab-controles');
    const btnTabLienzo = document.getElementById('btn-tab-lienzo');

    if (numPagina === 0) {
        deslizador.style.transform = "translateX(0vw)";
        btnTabControles.classList.add('activo');
        btnTabLienzo.classList.remove('activo');
    } else {
        deslizador.style.transform = "translateX(-100vw)";
        btnTabLienzo.classList.add('activo');
        btnTabControles.classList.remove('activo');
    }
}

// Detecta los movimientos laterales del dedo
function configurarSwipeTactil() {
    let inicioX = 0;
    const deslizador = document.getElementById('deslizador-paginas');

    deslizador.addEventListener('touchstart', (e) => inicioX = e.touches[0].clientX);
    deslizador.addEventListener('touchend', (e) => {
        let finX = e.changedTouches[0].clientX;
        let diferencia = inicioX - finX;

        if (Math.abs(diferencia) > 80) { // Umbral de sensibilidad
            if (diferencia > 0) cambiarPagina(1); // Deslizó a la izquierda -> Ver Placa
            else cambiarPagina(0);                 // Deslizó a la derecha -> Configurar
        }
    });
}

function validarToken() {
    const tokenInput = document.getElementById('input-token').value.trim().toUpperCase();
    const errorMsg = document.getElementById('error-token');

    if (BASE_DATOS_CLIENTES[tokenInput]) {
        errorMsg.innerText = "";
        localStorage.setItem('saas_token', tokenInput);
        if (localStorage.getItem(`creditos_${tokenInput}`) === null) {
            localStorage.setItem(`creditos_${tokenInput}`, BASE_DATOS_CLIENTES[tokenInput].creditosIniciales);
        }
        cargarInterfazSaaS(tokenInput);
    } else {
        errorMsg.innerText = "Token inválido.";
    }
}

function cargarInterfazSaaS(token) {
    document.getElementById('pantalla-token').classList.add('view-oculta');
    document.getElementById('interfaz-principal').classList.remove('view-oculta');
    actualizarContadorPantalla(token);
    aplicarEstilosLogo();
}

function actualizarContadorPantalla(token) {
    const contadorCreditos = document.getElementById('contador-creditos');
    const btnDescargar = document.getElementById('btn-descargar');
    const creditosActuales = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;
    
    if (contadorCreditos) contadorCreditos.innerText = creditosActuales;
    if (btnDescargar) btnDescargar.disabled = (creditosActuales <= 0);
}

function aplicarEstilosLogo() {
    const placaLogo = document.getElementById('placa-logo');
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano = document.getElementById('range-tamano');

    if (!placaLogo || !rangeOpacidad || !rangeTamano) return;

    placaLogo.style.opacity = rangeOpacidad.value;
    if (posicionActual === 'centro-gigante') {
        placaLogo.style.width = `${rangeTamano.value * 3}px`;
        placaLogo.style.height = `${rangeTamano.value * 3}px`;
    } else {
        placaLogo.style.width = `${rangeTamano.value * 2.5}px`;
        placaLogo.style.height = 'auto';
    }
}

async function procesarDescarga() {
    const token = localStorage.getItem('saas_token');
    const btnDescargar = document.getElementById('btn-descargar');
    const lienzoObjetivo = document.getElementById('lienzo-objetivo');
    let creditos = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;

    if (creditos <= 0) return;
    if (btnDescargar) btnDescargar.innerText = "PROCESANDO... ⏳";

    try {
        const canvas = await html2canvas(lienzoObjetivo, {
            useCORS: true, allowTaint: true, scale: 3, backgroundColor: null
        });

        const link = document.createElement("a");
        link.download = `SaaS-${formatoActual}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        creditos--;
        localStorage.setItem(`creditos_${token}`, credited = creditos);
        actualizarContadorPantalla(token);

    } catch (err) {
        console.error(err);
        alert("Error al procesar la imagen.");
        actualizarContadorPantalla(token);
    }
}

function cerrarSesion() {
    localStorage.removeItem('saas_token');
    location.reload();
}