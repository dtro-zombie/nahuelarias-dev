// contacto.js - Manejo del formulario de contacto con EmailJS

// Configuración de EmailJS
const EMAILJS_CONFIG = {
    publicKey: "QjI_Oe5IGsaOmCnz5",
    serviceId: "service_sd4hueq",
    templateId: "template_or20m55"
};

// Configuración de notificaciones - 10 SEGUNDOS
const NOTIFICATION_CONFIG = {
    duration: 10000, // 10 segundos en milisegundos
    position: {
        top: '20px',
        right: '20px'
    }
};

// Mapeo de campos del formulario a variables de EmailJS
const FIELD_MAPPING = {
    name: "from_name",
    email: "from_email", 
    message: "message"
};

// Estado del formulario
let formularioInicializado = false;

// Inicializar EmailJS
function inicializarEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: EMAILJS_CONFIG.publicKey,
            blockHeadless: true,
            limitRate: {
                id: 'app',
                throttle: 10000
            }
        });
        console.log('EmailJS inicializado correctamente');
        return true;
    } else {
        console.error('EmailJS no está cargado');
        return false;
    }
}

// Función que inicializa el formulario
function inicializarFormularioContacto() {
    if (formularioInicializado) {
        console.log('Formulario ya estaba inicializado');
        return;
    }

    const form = document.getElementById('contactForm');
    if (!form) {
        console.warn('Formulario de contacto no encontrado, reintentando...');
        setTimeout(inicializarFormularioContacto, 500);
        return;
    }

    // Inicializar EmailJS primero
    if (!inicializarEmailJS()) {
        console.error('No se pudo inicializar EmailJS');
        mostrarNotificacion('Error: EmailJS no está cargado correctamente', 'error');
        return;
    }

    // Remover event listeners previos para evitar duplicados
    form.removeEventListener('submit', manejarEnvioFormulario);
    
    // Agregar el event listener
    form.addEventListener('submit', manejarEnvioFormulario);
    
    // Agregar validación en tiempo real
    agregarValidacionTiempoReal(form);
    
    formularioInicializado = true;
    console.log('Formulario de contacto inicializado correctamente');
    
    // Mostrar notificación de prueba (opcional, puedes quitarla)
    // setTimeout(() => mostrarNotificacion('Formulario listo para usar!', 'success'), 1000);
}

// Función para agregar validación en tiempo real
function agregarValidacionTiempoReal(form) {
    const campos = ['name', 'email', 'message'];
    
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('blur', () => validarCampo(campoId));
            campo.addEventListener('input', () => {
                if (campo.classList.contains('is-invalid')) {
                    validarCampo(campoId);
                }
            });
        }
    });
}

// Función para validar campo individual
function validarCampo(campoId) {
    const campo = document.getElementById(campoId);
    const valor = campo.value.trim();
    
    campo.classList.remove('is-invalid', 'is-valid');
    
    switch(campoId) {
        case 'name':
            if (!valor) {
                mostrarErrorCampo(campo, "Por favor ingresa tu nombre.");
            } else {
                campo.classList.add('is-valid');
            }
            break;
            
        case 'email':
            if (!valor) {
                mostrarErrorCampo(campo, "Por favor ingresa tu email.");
            } else if (!validarEmail(valor)) {
                mostrarErrorCampo(campo, "Por favor ingresa un email válido.");
            } else {
                campo.classList.add('is-valid');
            }
            break;
            
        case 'message':
            if (!valor) {
                mostrarErrorCampo(campo, "Por favor escribe tu mensaje.");
            } else {
                campo.classList.add('is-valid');
            }
            break;
    }
}

// Función para mostrar error en campo específico
function mostrarErrorCampo(campo, mensaje) {
    campo.classList.add('is-invalid');
    const feedback = campo.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = mensaje;
    }
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
        mostrarNotificacion('Por favor completa todos los campos correctamente', 'error');
        return;
    }

    // Preparar y enviar datos
    const templateParams = prepararDatosFormulario();
    
    console.log('Enviando datos a EmailJS...', templateParams);
    
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
    .then((response) => {
        console.log('Mensaje enviado con éxito:', response);
        mostrarNotificacion("¡Mensaje enviado con éxito! Te contactaré pronto.", 'success');
        form.reset();
        // Limpiar clases de validación
        document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
        restaurarBoton(submitBtn, btnText, originalText);
    })
    .catch((error) => {
        console.error("Error al enviar:", error);
        let mensajeError = "Hubo un error al enviar el mensaje. ";
        
        if (error.text && error.text.includes('quota')) {
            mensajeError += "Límite de envíos excedido. Intenta más tarde.";
        } else {
            mensajeError += "Intenta nuevamente o contáctame directamente por email.";
        }
        
        mostrarNotificacion(mensajeError, 'error');
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
    }
}

// Función para validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// FUNCIÓN MEJORADA PARA MOSTRAR NOTIFICACIONES - 10 SEGUNDOS
// FUNCIÓN MEJORADA PARA MOSTRAR NOTIFICACIONES - 10 SEGUNDOS
function mostrarNotificacion(mensaje, tipo = 'info') {
    console.log(`Mostrando notificación: ${mensaje} (${tipo})`);
    
    // Eliminar notificaciones previas del mismo tipo
    const notificacionesPrevias = document.querySelectorAll('.alert-notificacion');
    notificacionesPrevias.forEach(notif => {
        if (notif.parentNode) {
            notif.parentNode.removeChild(notif);
        }
    });
    
    // Crear la notificación SIN clases de Bootstrap que causen cierre automático
    const notificacion = document.createElement('div');
    notificacion.className = `custom-alert custom-alert-${tipo} alert-notificacion`;
    notificacion.style.position = 'fixed';
    notificacion.style.top = NOTIFICATION_CONFIG.position.top;
    notificacion.style.right = NOTIFICATION_CONFIG.position.right;
    notificacion.style.zIndex = '9999';
    notificacion.style.minWidth = '300px';
    notificacion.style.maxWidth = '500px';
    notificacion.style.borderRadius = '12px';
    notificacion.style.padding = '20px 25px';
    notificacion.style.fontWeight = '600';
    notificacion.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    notificacion.style.backdropFilter = 'blur(10px)';
    notificacion.style.borderLeft = '5px solid';
    notificacion.style.animation = 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    notificacion.style.display = 'flex';
    notificacion.style.alignItems = 'center';
    
    // Estilos según el tipo
    if (tipo === 'success') {
        notificacion.style.background = 'linear-gradient(135deg, rgba(21, 87, 36, 0.95), rgba(40, 167, 69, 0.9))';
        notificacion.style.color = 'white';
        notificacion.style.borderLeftColor = '#4ade80';
    } else if (tipo === 'error') {
        notificacion.style.background = 'linear-gradient(135deg, rgba(120, 28, 36, 0.95), rgba(220, 53, 69, 0.9))';
        notificacion.style.color = 'white';
        notificacion.style.borderLeftColor = '#f87171';
    } else {
        notificacion.style.background = 'linear-gradient(135deg, rgba(12, 84, 96, 0.95), rgba(23, 162, 184, 0.9))';
        notificacion.style.color = 'white';
        notificacion.style.borderLeftColor = '#67e8f9';
    }
    
    notificacion.innerHTML = `
        <div class="d-flex align-items-center w-100">
            <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : tipo === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2" style="font-size: 1.4rem;"></i>
            <div class="flex-grow-1">${mensaje}</div>
            <button type="button" class="btn-close-custom" aria-label="Close" style="background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 15px; opacity: 0.8;">
                &times;
            </button>
        </div>
    `;
    
    // Agregar al documento
    document.body.appendChild(notificacion);
    
    // Agregar evento para cerrar manualmente
    const closeBtn = notificacion.querySelector('.btn-close-custom');
    closeBtn.addEventListener('click', () => {
        cerrarNotificacion(notificacion);
    });
    
    // Auto-eliminar después de 10 SEGUNDOS
    const timeoutId = setTimeout(() => {
        cerrarNotificacion(notificacion);
    }, NOTIFICATION_CONFIG.duration);
    
    // Guardar el timeout ID para poder cancelarlo si el usuario cierra manualmente
    notificacion._timeoutId = timeoutId;
    
    return notificacion;
}

// Función para cerrar notificación con animación
function cerrarNotificacion(notificacion) {
    if (notificacion._timeoutId) {
        clearTimeout(notificacion._timeoutId);
    }
    
    notificacion.style.animation = 'slideOutRight 0.3s ease-in forwards';
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 300);
}

// Inicialización automática cuando el script se carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormularioContacto);
} else {
    // Si el DOM ya está listo, inicializar inmediatamente
    setTimeout(inicializarFormularioContacto, 1000);
}

// Hacer funciones disponibles globalmente
window.inicializarFormularioContacto = inicializarFormularioContacto;
window.manejarEnvioFormulario = manejarEnvioFormulario;
window.mostrarNotificacion = mostrarNotificacion;

// Exportar para pruebas (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inicializarFormularioContacto,
        validarFormulario,
        validarEmail,
        mostrarNotificacion
    };
}