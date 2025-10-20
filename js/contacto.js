// contacto.js - Manejo del formulario de contacto con EmailJS
// Configuración de EmailJS
const EMAILJS_CONFIG = {
    publicKey: "QjI_Oe5IGsaOmCnz5",
    serviceId: "service_sd4hueq",
    templateId: "template_or20m55"
};

// Mapeo de campos del formulario a variables de EmailJS
const FIELD_MAPPING = {
    name: "from_name",
    email: "from_email", 
    message: "message",
    // La fecha se generará automáticamente
    date: "fecha_envio"
};

// Inicializar EmailJS
(function(){
    emailjs.init({
        publicKey: EMAILJS_CONFIG.publicKey
    });
})();

// Función que inicializa el formulario
function inicializarFormularioContacto() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.warn('Formulario de contacto no encontrado');
        return;
    }

    // Remover event listeners previos para evitar duplicados
    form.removeEventListener('submit', manejarEnvioFormulario);
    
    // Agregar el event listener
    form.addEventListener('submit', manejarEnvioFormulario);
    
    console.log('Formulario de contacto inicializado correctamente');
}

// Función para manejar el envío del formulario
function manejarEnvioFormulario(e) {
    e.preventDefault();
    console.log('Iniciando envío de mensaje...');

    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;

    // Deshabilitar botón y mostrar estado de carga
    submitBtn.disabled = true;
    btnText.textContent = 'Enviando...';

    // Validar campos antes de enviar
    if (!validarFormulario(form)) {
        restaurarBoton(submitBtn, btnText, originalText);
        return;
    }

    // Preparar y enviar datos
    const templateParams = prepararDatosFormulario();
    
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
    .then(() => {
        console.log('Mensaje enviado con éxito');
        mostrarMensajeExito("¡Mensaje enviado con éxito! Te contactaré pronto.");
        form.reset();
        restaurarBoton(submitBtn, btnText, originalText);
    })
    .catch((error) => {
        console.error("Error al enviar:", error);
        mostrarMensajeError("Hubo un error al enviar el mensaje. Intenta nuevamente.");
        restaurarBoton(submitBtn, btnText, originalText);
    });
}

// Función para preparar los datos del formulario
function prepararDatosFormulario() {
    const templateParams = {};
    
    // Mapear campos del formulario
    for (const [fieldId, emailjsVar] of Object.entries(FIELD_MAPPING)) {
        const element = document.getElementById(fieldId);
        if (element) {
            templateParams[emailjsVar] = element.value.trim();
        }
    }
    
    // Agregar fecha automáticamente
    templateParams.fecha_envio = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    console.log('Datos preparados para EmailJS:', templateParams);
    return templateParams;
}

// Función para restaurar el botón a su estado original
function restaurarBoton(submitBtn, btnText, originalText) {
    submitBtn.disabled = false;
    btnText.textContent = originalText;
}

// Función para validar el formulario
function validarFormulario(form) {
    const nombre = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensaje = document.getElementById("message").value.trim();
    
    // Resetear estados de validación
    resetearValidacion();
    
    let esValido = true;
    
    if (!nombre) {
        mostrarError("name", "Por favor ingresa tu nombre.");
        esValido = false;
    }
    
    if (!email) {
        mostrarError("email", "Por favor ingresa tu email.");
        esValido = false;
    } else if (!validarEmail(email)) {
        mostrarError("email", "Por favor ingresa un email válido.");
        esValido = false;
    }
    
    if (!mensaje) {
        mostrarError("message", "Por favor escribe tu mensaje.");
        esValido = false;
    }
    
    return esValido;
}

// Función para resetear la validación
function resetearValidacion() {
    const campos = ['name', 'email', 'message'];
    campos.forEach(campo => {
        const element = document.getElementById(campo);
        if (element) {
            element.classList.remove('is-invalid');
        }
    });
}

// Función para mostrar error en campo específico
function mostrarError(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const feedback = campo.nextElementSibling;
    
    if (campo && feedback && feedback.classList.contains('invalid-feedback')) {
        campo.classList.add('is-invalid');
        feedback.textContent = mensaje;
    } else {
        alert(mensaje);
    }
}

// Función para validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    // Usar notificación personalizada si está disponible, sino alert
    if (typeof crearNotificacion === 'function') {
        crearNotificacion(mensaje, 'success');
    } else {
        alert(mensaje);
    }
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
    // Usar notificación personalizada si está disponible, sino alert
    if (typeof crearNotificacion === 'function') {
        crearNotificacion(mensaje, 'error');
    } else {
        alert(mensaje);
    }
}

// Función para crear notificaciones personalizadas (opcional)
function crearNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notificacion.style.position = 'fixed';
    notificacion.style.top = '20px';
    notificacion.style.right = '20px';
    notificacion.style.zIndex = '9999';
    notificacion.style.minWidth = '300px';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 5000);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormularioContacto);
} else {
    inicializarFormularioContacto();
}

// Exportar funciones para uso externo (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inicializarFormularioContacto,
        validarFormulario,
        validarEmail,
        prepararDatosFormulario
    };
}