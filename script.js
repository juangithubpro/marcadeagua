const BASE_DATOS_CLIENTES = {
    "NADA2026": { nombre: "Nada Digital", creditosIniciales: 20 },
    "SHOWROOMSP": { nombre: "Showroom Sáenz Peña", creditosIniciales: 50 }
};

// Captura de Elementos
const selectFormato = document.getElementById('select-formato');
const selectPosicion = document.getElementById('select-posicion');
const rangeOpacidad = document.getElementById('range-opacidad');
const rangeTamano = document.getElementById('range-tamano');
const inputFoto = document.getElementById('input-foto');
const inputLogo = document.getElementById('input-logo'); // Elemento del logo

const lienzoObjetivo = document.getElementById('lienzo-objetivo');
const placaFoto = document.getElementById('placa-foto');
const placaLogo = document.getElementById('placa-logo');
const contadorCreditos = document.getElementById('contador-creditos');
const btnDescargar = document.getElementById('btn-descargar');

window.onload = function() {
    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarInterfazSaaS(tokenGuardado);
    }
};

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
        errorMsg.innerText = "Token inválido. Consultá a CapsulaWebs.";
    }
}

function cargarInterfazSaaS(token) {
    document.getElementById('pantalla-token').classList.add('view-oculta');
    document.getElementById('interfaz-principal').classList.remove('view-oculta');
    actualizarContadorPantalla(token);
    aplicarEstilosLogo();
}

function actualizarContadorPantalla(token) {
    const creditosActuales = parseInt(localStorage.getItem(`creditos_${token}`));
    contadorCreditos.innerText = creditosActuales;
    if (creditosActuales <= 0) {
        btnDescargar.disabled = true;
        btnDescargar.innerText = "❌ Sin créditos";
    } else {
        btnDescargar.disabled = false;
        btnDescargar.innerText = "📥 Descargar Imagen Lista";
    }
}

// 🔄 Sincronizadores del Editor
selectFormato.addEventListener('change', () => {
    lienzoObjetivo.className = `lienzo-producto formato-${selectFormato.value}`;
});

selectPosicion.addEventListener('change', () => {
    placaLogo.className = `logo-marca-agua ${selectPosicion.value}`;
    aplicarEstilosLogo();
});

rangeOpacidad.addEventListener('input', aplicarEstilosLogo);
rangeTamano.addEventListener('input', aplicarEstilosLogo);

function aplicarEstilosLogo() {
    placaLogo.style.opacity = rangeOpacidad.value;
    if(selectPosicion.value === 'centro-gigante') {
        placaLogo.style.width = `${rangeTamano.value * 3}px`;
        placaLogo.style.height = `${rangeTamano.value * 3}px`;
    } else {
        placaLogo.style.width = `${rangeTamano.value * 2.5}px`;
        placaLogo.style.height = 'auto';
    }
}

// 🖼️ Lógica para subir la Foto del Producto
inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            placaFoto.style.backgroundImage = `url('${event.target.result}')`;
        };
        reader.readAsDataURL(file);
    }
});

// 🏷️ Lógica para subir el Logo de forma Local (Evita errores de descarga)
inputLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            placaLogo.src = event.target.result;
            placaLogo.style.display = 'block'; // Mostramos la etiqueta img
            aplicarEstilosLogo();
        };
        reader.readAsDataURL(file);
    }
});

// 📥 CÓDIGO DE DESCARGA PREMIUM CORREGIDO
async function procesarDescarga() {
    const token = localStorage.getItem('saas_token');
    let creditos = parseInt(localStorage.getItem(`creditos_${token}`));

    if (creditos <= 0) return;

    btnDescargar.innerText = "Procesando... ⏳";
    btnDescargar.disabled = true;

    try {
        const canvas = await html2canvas(lienzoObjetivo, {
            useCORS: true,
            allowTaint: true,
            scale: 3, // Calidad super nítida
            backgroundColor: null
        });

        const link = document.createElement("a");
        link.download = `SaaS-Producto-${selectFormato.value.toUpperCase()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        creditos--;
        localStorage.setItem(`creditos_${token}`, creditos);
        actualizarContadorPantalla(token);

    } catch (err) {
        console.error(err);
        alert("Error al renderizar.");
        actualizarContadorPantalla(token);
    }
}

function cerrarSesion() {
    localStorage.removeItem('saas_token');
    location.reload();
}