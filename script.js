// ==========================================================================
// 🔐 BASE DE DATOS DE CLIENTES MANUAL (Acá gestionás tus clientes)
// ==========================================================================
const BASE_DATOS_CLIENTES = {
    "NADA2026": {
        nombre: "Nada Digital",
        logoUrl: "https://nadadigital.com.ar/wp-content/uploads/2026/06/LOGONADADIGITAL-BLANCO.png",
        creditosIniciales: 20
    },
    "SHOWROOMSP": {
        nombre: "Showroom Sáenz Peña",
        logoUrl: "https://via.placeholder.com/300x100/fff/000?text=TU+LOGO+AQUÍ", // Url del logo del local
        creditosIniciales: 50
    }
};

// Captura de Elementos
const selectFormato = document.getElementById('select-formato');
const selectPosicion = document.getElementById('select-posicion');
const rangeOpacidad = document.getElementById('range-opacidad');
const rangeTamano = document.getElementById('range-tamano');
const inputFoto = document.getElementById('input-foto');

const lienzoObjetivo = document.getElementById('lienzo-objetivo');
const placaFoto = document.getElementById('placa-foto');
const placaLogo = document.getElementById('placa-logo');
const contadorCreditos = document.getElementById('contador-creditos');
const btnDescargar = document.getElementById('btn-descargar');

// Al iniciar la página, verificamos si ya había una sesión activa
window.onload = function() {
    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarInterfazSaaS(tokenGuardado);
    }
};

// 🔑 Validación del Código de Acceso
function validarToken() {
    const tokenInput = document.getElementById('input-token').value.trim().toUpperCase();
    const errorMsg = document.getElementById('error-token');

    if (BASE_DATOS_CLIENTES[tokenInput]) {
        errorMsg.innerText = "";
        localStorage.setItem('saas_token', tokenInput);
        
        // Si es la primera vez que ingresa, le creamos sus créditos iniciales locales
        if (localStorage.getItem(`creditos_${tokenInput}`) === null) {
            localStorage.setItem(`creditos_${tokenInput}`, BASE_DATOS_CLIENTES[tokenInput].creditosIniciales);
        }
        
        cargarInterfazSaaS(tokenInput);
    } else {
        errorMsg.innerText = "Token inválido o vencido. Contactá a CapsulaWebs.";
    }
}

// 💻 Carga los datos del comercio en pantalla
function cargarInterfazSaaS(token) {
    document.getElementById('pantalla-token').classList.add('view-oculta');
    document.getElementById('interfaz-principal').classList.remove('view-oculta');
    
    // Inyectamos el logo del cliente directo desde nuestra base de datos
    placaLogo.style.backgroundImage = `url('${BASE_DATOS_CLIENTES[token].logoUrl}')`;
    
    actualizarContadorPantalla(token);
    aplicarEstilosLogo();
}

// Actualiza el número de fotos que le quedan en pantalla
function actualizarContadorPantalla(token) {
    const creditosActuales = parseInt(localStorage.getItem(`creditos_${token}`));
    contadorCreditos.innerText = creditosActuales;

    if (creditosActuales <= 0) {
        btnDescargar.disabled = true;
        btnDescargar.innerText = "❌ Sin créditos disponibles";
    } else {
        btnDescargar.disabled = false;
        btnDescargar.innerText = "📥 Descargar Imagen Lista";
    }
}

// 🔄 Sincronizadores en Vivo del Editor
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
    
    // Si la posición es central, calibramos dimensiones cuadradas, sino alargadas estándar
    if(selectPosicion.value === 'centro-gigante') {
        placaLogo.style.width = `${rangeTamano.value * 5}px`;
        placaLogo.style.height = `${rangeTamano.value * 5}px`;
    } else {
        placaLogo.style.width = `${rangeTamano.value * 4}px`;
        placaLogo.style.height = `${rangeTamano.value * 1.5}px`;
    }
}

// 🖼️ Procesador de la foto del producto
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

// 📥 DESCARGA Y COBRO DE CRÉDITO
async function procesarDescarga() {
    const token = localStorage.getItem('saas_token');
    let creditos = parseInt(localStorage.getItem(`creditos_${token}`));

    if (creditos <= 0) return;

    btnDescargar.innerText = "Procesando... ⏳";
    btnDescargar.disabled = true;

    try {
        const canvas = await html2canvas(lienzoObjetivo, {
            useCORS: true,
            allowTaint: false,
            scale: 3, // Calidad nítida para Instagram
            backgroundColor: null
        });

        // Disparamos la descarga del archivo comprimido
        const link = document.createElement("a");
        link.download = `Producto-${selectFormato.value.toUpperCase()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        // 🔥 REBAJA DE CRÉDITO: Restamos uno de la memoria local
        creditos--;
        localStorage.setItem(`creditos_${token}`, creditos);
        actualizarContadorPantalla(token);

    } catch (err) {
        console.error(err);
        alert("Error al procesar la imagen.");
        actualizarContadorPantalla(token);
    }
}

// 🚪 Cerrar Sesión
function cerrarSesion() {
    localStorage.removeItem('saas_token');
    location.reload();
}