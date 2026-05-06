# Documentación del Proyecto: VoltManage Chile ⚡

Este documento explica detalladamente el funcionamiento técnico y operativo de la aplicación **VoltManage Chile**, una herramienta diseñada para técnicos y profesionales eléctricos en Chile.

---

## 1. Arquitectura del Proyecto
La aplicación es una **PWA (Progressive Web App)** de arquitectura "Serverless" (sin servidor). Todo el procesamiento y almacenamiento ocurre directamente en el navegador del usuario.

### Características Técnicas:
- **Offline-First:** Gracias al Service Worker, la app carga y funciona sin conexión a internet.
- **Almacenamiento Local:** Utiliza **IndexedDB** a través de la librería **Dexie.js** para persistir los datos de forma segura en el dispositivo.
- **Sin Base de Datos Externa:** No requiere una cuenta o servidor central, lo que garantiza la privacidad total de los datos financieros del usuario.

---

## 2. Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Vanilla) y JavaScript (ES6+).
- **Base de Datos:** [Dexie.js](https://dexie.org/) para manejar IndexedDB de forma sencilla.
- **Gráficos:** [Chart.js](https://www.chartjs.org/) para la visualización del Flujo de Caja.
- **PDF:** [jsPDF](https://github.com/parallax/jsPDF) y [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) para generar presupuestos profesionales.
- **Iconografía:** [Phosphor Icons](https://phosphoricons.com/) para una interfaz moderna.
- **Tipografía:** Google Fonts (Outfit).

---

## 3. Módulos y Funcionamiento

### 📊 Flujo de Caja (Dashboard)
Calcula la **Utilidad Neta Real** restando de los ingresos:
- Costos directos de materiales.
- Mano de obra.
- **Provisiones fijas:** Desgaste de herramientas y gastos de vehículo (configurables).
- Utiliza un gráfico de barras para comparar Ingresos vs Egresos.

### 🧮 Gestor de Presupuestos
Permite crear cotizaciones rápidas con las siguientes lógicas:
- **Selector de Documento:** Permite elegir entre **Factura (19% IVA)** o **Boleta (15.5% de retención/impuesto)**.
- **Edición de Ítems:** Los materiales añadidos pueden editarse haciendo clic en el icono del lápiz ✏️.
- **Costos Integrados:** La configuración de **Mano de Obra (Días y $/Día)** y el **Margen de Ganancia** se encuentran directamente en la tarjeta de Resumen. Esto permite ajustar la tarifa diaria para un proyecto específico sin salir del presupuesto.
- **Mano de Obra:** Cálculo automático basado en días trabajados y tarifa base. A diferencia de otras aplicaciones, el valor diario se gestiona **exclusivamente dentro del Gestor de Presupuesto** para permitir flexibilidad total por proyecto.
- **Margen de Ganancia:** Permite añadir un porcentaje sobre el costo de los materiales.
- **PDF:** Generación de una vista previa y descarga del documento oficial para enviar al cliente.

### 💳 Gestión de Cobros y Abonos
Rastrea el estado financiero de cada proyecto:
- **Abonos Parciales:** Permite registrar múltiples pagos por proyecto.
- **Saldo Pendiente:** Calcula automáticamente cuánto falta por cobrar.
- **Estados:** Pendiente, Abonado, Pagado o Rechazado.
- **Eliminación:** Permite borrar proyectos o abonos individuales, recalculando el saldo al instante.

### 📷 Bitácora de Obra
Diseñada para el uso en terreno:
- **Cámara:** Permite tomar fotos directamente desde el celular.
- **Redimensionamiento:** Las imágenes se comprimen automáticamente para no saturar el almacenamiento del dispositivo.
- **Notas:** Registro de avances técnicos vinculados a proyectos específicos.

### 📦 Inventario (Precios de Referencia)
Una tabla simple donde el usuario guarda los precios actuales de cables, protecciones y materiales comunes para agilizar la creación de presupuestos.

### ⚙️ Ajustes
Centraliza la configuración global:
- Valor de la mano de obra por día.
- Porcentajes personalizados para IVA y Boletas.
- Montos de provisiones mensuales (herramientas/vehículo).

---

## 4. Flujo de Trabajo Típico
1. **Configuración:** El usuario establece sus tarifas y porcentajes en Ajustes.
2. **Inventario:** Se cargan los precios de los materiales más usados.
3. **Presupuesto:** Se crea una cotización, se previsualiza el PDF y se guarda.
4. **Obra:** Se registran fotos y notas en la Bitácora durante la ejecución.
5. **Cobro:** Se registran los abonos del cliente hasta completar el pago.
6. **Análisis:** El Dashboard muestra la rentabilidad real del negocio.

---

## 5. Privacidad y Seguridad
Al ser una PWA que utiliza IndexedDB:
- Los datos **nunca salen del dispositivo** del usuario (a menos que el usuario los suba a un repo como GitHub).
- Si se borran los datos del sitio en el navegador, se borran los datos de la app. Por ello, se recomienda usar la opción "Instalar aplicación" para que funcione como una app nativa.

---
Generado por **VoltManage Chile - Guía del Desarrollador**
