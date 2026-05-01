// ============================================================
// app.js — Enrutador Principal y Navegación de Rueda
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Referencias al DOM ----
    const homeScreen   = document.getElementById('home-screen');
    const moduleScreen = document.getElementById('module-screen');
    const moduleTitle  = document.getElementById('module-title');
    const moduleContent= document.getElementById('module-content');
    const backBtn      = document.getElementById('back-btn');
    const headerAction = document.getElementById('module-header-action');

    // ---- Configuración de Módulos ----
    const MODULES = {
        dashboard: { label: '📊 Flujo de Caja',      render: window.renderDashboard },
        budget:    { label: '🧮 Presupuesto',         render: window.renderBudget   },
        billing:   { label: '💳 Cobros y Abonos',     render: window.renderBilling  },
        logbook:   { label: '📷 Bitácora de Obra',    render: window.renderLogbook  },
        inventory: { label: '📦 Inventario',          render: window.renderInventory},
        settings:  { label: '⚙️ Ajustes',             render: window.renderSettings },
    };

    // ---- Navegación ----
    function openModule(viewName) {
        const mod = MODULES[viewName];
        if (!mod) return;

        homeScreen.style.opacity   = '0';
        homeScreen.style.pointerEvents = 'none';

        setTimeout(() => {
            homeScreen.style.display = 'none';
            moduleScreen.classList.remove('hidden');
            moduleTitle.textContent = mod.label;
            moduleContent.innerHTML = '';
            headerAction.innerHTML  = '';

            if (mod.render) {
                mod.render(moduleContent);
            }
        }, 200);
    }

    function goHome() {
        moduleScreen.classList.add('hidden');
        homeScreen.style.display  = 'flex';
        homeScreen.style.opacity  = '0';
        homeScreen.style.pointerEvents = 'all';
        requestAnimationFrame(() => {
            homeScreen.style.transition = 'opacity 0.35s';
            homeScreen.style.opacity    = '1';
        });
    }

    // ---- Manejadores de clic: Sectores SVG ----
    document.querySelectorAll('.sector').forEach(sector => {
        sector.addEventListener('click', () => {
            openModule(sector.getAttribute('data-view'));
        });
    });

    // ---- Manejadores de clic: Etiquetas flotantes ----
    document.querySelectorAll('.wheel-label').forEach(lbl => {
        lbl.addEventListener('click', () => {
            openModule(lbl.getAttribute('data-view'));
        });
    });

    // ---- Botón de volver ----
    backBtn.addEventListener('click', goHome);

    // ---- Badge de Conectado / Desconectado ----
    const badge = document.getElementById('connection-badge');
    function updateBadge() {
        if (navigator.onLine) {
            badge.className = 'connection-badge online';
            badge.innerHTML = '<i class="ph ph-wifi-high"></i> <span>Online</span>';
        } else {
            badge.className = 'connection-badge offline';
            badge.innerHTML = '<i class="ph ph-wifi-slash"></i> <span>Offline</span>';
        }
    }
    window.addEventListener('online',  updateBadge);
    window.addEventListener('offline', updateBadge);
    updateBadge();
});

// ---- Utilidades Globales ----
window.formatCurrency = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n || 0);

window.formatDate = (s) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ---- Modal Global ----
window.showModal = (html) => {
    const mc = document.getElementById('modal-container');
    mc.innerHTML = `
        <div class="modal-overlay" id="active-modal">
            <div class="modal-box">${html}</div>
        </div>`;

    // Cerrar al hacer clic en el overlay
    mc.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) window.closeModal();
    });

    mc.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', window.closeModal));
};

window.closeModal = () => {
    document.getElementById('modal-container').innerHTML = '';
};

// Exponer navegación de módulos a los submódulos
window.openModule = (view) => {
    const modules = {
        dashboard: { label: '📊 Flujo de Caja',      render: window.renderDashboard },
        budget:    { label: '🧮 Presupuesto',         render: window.renderBudget   },
        billing:   { label: '💳 Cobros y Abonos',     render: window.renderBilling  },
        logbook:   { label: '📷 Bitácora de Obra',    render: window.renderLogbook  },
        inventory: { label: '📦 Inventario',          render: window.renderInventory},
        settings:  { label: '⚙️ Ajustes',             render: window.renderSettings },
    };
    const mod = modules[view];
    if (!mod) return;
    const mc = document.getElementById('module-content');
    const mt = document.getElementById('module-title');
    if (mc) { mt.textContent = mod.label; mc.innerHTML = ''; mod.render(mc); }
};
