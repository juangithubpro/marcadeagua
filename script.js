// 🔐 Base de datos local simulada
const BASE_DATOS_CLIENTES = {
    "NADA2026": { nombre: "Nada Digital", creditosIniciales: 20 },
    "SHOWROOMSP": { nombre: "Showroom Sáenz Peña", creditosIniciales: 50 }
};

// Función global para validar el acceso
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
    const contadorCreditos = document.getElementById('contador-creditos');
    const btnDescargar = document.getElementById('btn-descargar');
    const creditosActuales = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;
    
    if (contadorCreditos) contadorCreditos.innerText = creditosActuales;
    
    if (btnDescargar) {
        if (creditosActuales <= 0) {
            btnDescargar.disabled = true;
            btnDescargar.innerText = "❌ Sin créditos";
        } else {
            btnDescargar.disabled = false;
            btnDescargar.innerText = "📥 Descargar Imagen Lista";
        }
    }
}

// 🔄 Sincronizadores en Vivo (Se ejecutan solo tras cargar la interfaz)
document.addEventListener('DOMContentLoaded', () => {
    const selectFormato = document.getElementById('select-formato');
    const selectPosicion = document.getElementById('select-posicion');
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano = document.getElementById('range-tamano');
    const inputFoto = document.getElementById('input-foto');
    const inputLogo = document.getElementById('input-logo');
    const lienzoObjetivo = document.getElementById('lienzo-objetivo');
    const placaFoto = document.getElementById('placa-foto');

    if (selectFormato) {
        selectFormato.addEventListener('change', () => {
            lienzoObjetivo.className = `lienzo-producto formato-${selectFormato.value}`;
        });
    }

    if (selectPosicion) {
        selectPosicion.addEventListener('change', () => {
            const placaLogo = document.getElementById('placa-logo');
            if (placaLogo) placaLogo.className = `logo-marca-agua ${selectPosicion.value}`;
            aplicarEstilosLogo();
        });
    }

    if (rangeOpacidad) rangeOpacidad.addEventListener('input', aplicarEstilosLogo);
    if (rangeTamano) rangeTamano.addEventListener('input', aplicarEstilosLogo);

    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && placaFoto) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    placaFoto.style.backgroundImage = `url('${event.target.result}')`;
                };
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
                reader.onload = function(event) {
                    placaLogo.src = event.target.result;
                    placaLogo.style.display = 'block';
                    aplicarEstilosLogo();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Si ya inició sesión antes, salteamos el login de forma segura
    const tokenGuardado = localStorage.getItem('saas_token');
    if (tokenGuardado && BASE_DATOS_CLIENTES[tokenGuardado]) {
        cargarInterfazSaaS(tokenGuardado);
    }
});

function aplicarEstilosLogo() {
    const placaLogo = document.getElementById('placa-logo');
    const selectPosicion = document.getElementById('select-posicion');
    const rangeOpacidad = document.getElementById('range-opacidad');
    const rangeTamano = document.getElementById('range-tamano');

    if (!placaLogo || !selectPosicion || !rangeOpacidad || !rangeTamano) return;

    placaLogo.style.opacity = rangeOpacidad.value;
    if (selectPosicion.value === 'centro-gigante') {
        placaLogo.style.width = `${rangeTamano.value * 3}px`;
        placaLogo.style.height = `${rangeTamano.value * 3}px`;
    } else {
        placaLogo.style.width = `${rangeTamano.value * 2.5}px`;
        placaLogo.style.height = 'auto';
    }
}

// 📥 Motor de Descarga Estricto
async function procesarDescarga() {
    const token = localStorage.getItem('saas_token');
    const btnDescargar = document.getElementById('btn-descargar');
    const selectFormato = document.getElementById('select-formato');
    const lienzoObjetivo = document.getElementById('lienzo-objetivo');
    
    let creditos = parseInt(localStorage.getItem(`creditos_${token}`)) || 0;
    if (creditos <= 0) return;

    if (btnDescargar) {
        btnDescargar.innerText = "Procesando... ⏳";
        btnDescargar.disabled = true;
    }

    try {
        const canvas = await html2canvas(lienzoObjetivo, {
            useCORS: true,
            allowTaint: true,
            scale: 3, 
            backgroundColor: null
        });

        const link = document.createElement("a");
        const formatoNom = selectFormato ? selectFormato.value.toUpperCase() : 'POST';
        link.download = `SaaS-Producto-${formatoNom}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        creditos--;
        localStorage.setItem(`creditos_${token}`, creditos);
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