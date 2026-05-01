# VoltManage Chile ⚡

PWA (Progressive Web App) diseñada para la gestión integral de servicios eléctricos en Chile.

## Características principales:
- **🧮 Gestor de Presupuestos:** Cálculos automáticos con soporte para Boleta (15.5%) y Factura (19% IVA).
- **📊 Flujo de Caja:** Visualización de ingresos, costos de materiales, mano de obra y provisiones fijas.
- **💳 Control de Pagos:** Registro de abonos, saldos pendientes y seguimiento de estado de proyectos.
- **📷 Bitácora de Obra:** Captura de fotos y notas técnicas desde terreno (funciona offline).
- **📦 Inventario:** Base de datos local de precios de referencia para materiales.
- **⚙️ Ajustes Personalizables:** Configuración de mano de obra base y porcentajes de impuestos.

## Tecnologías utilizadas:
- **HTML5 / CSS3** (Diseño moderno y responsivo).
- **JavaScript (Vanilla)**.
- **Dexie.js** (IndexedDB para almacenamiento local persistente).
- **jsPDF / AutoTable** (Generación de presupuestos en PDF).
- **Chart.js** (Gráficos financieros).
- **Service Workers** (Soporte Offline y PWA).

## Instalación:
Este es un proyecto estático. Puedes servirlo con cualquier servidor web (ej. `python3 -m http.server`) o subirlo a GitHub Pages / Vercel.
