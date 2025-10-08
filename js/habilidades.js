// js/habilidades.js
function inicializarHabilidades() {
    setTimeout(() => {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }, 50);
}

function verificarYInicializar() {
    const skillBars = document.querySelectorAll('.skill-progress');
    if (skillBars.length > 0) {
        inicializarHabilidades();
    } else {
        setTimeout(verificarYInicializar, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarYInicializar);
} else {
    verificarYInicializar();
}

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            const hasSkillBars = document.querySelectorAll('.skill-progress').length > 0;
            if (hasSkillBars) {
                inicializarHabilidades();
                observer.disconnect();
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});