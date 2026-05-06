# 🤝 Archivo de Handoff - VoltManage Chile

Este documento sirve como bitácora de estado para que cualquier desarrollador (o IA) pueda retomar el proyecto exactamente donde se dejó. **Actualizar este archivo al finalizar cada sesión.**

---

## 📅 Última Actualización: 30 de Abril, 2026

### ✅ Estado Actual
La aplicación es una PWA completamente funcional enfocada en la gestión eléctrica en Chile. Soporta flujos financieros, presupuestos legales, bitácora de obra con fotos y gestión de inventario.

### 🚀 Funcionalidades Implementadas recientemente:
- **Impuestos Chilenos:** Selector dinámico entre **Boleta (15.5%)** y **Factura (19% IVA)** en el generador de presupuestos.
- **Gestión de Cobros Pro:** Botones para eliminar proyectos completos y abonos individuales con recalculo de saldo.
- **Ajustes Dinámicos:** Los porcentajes de impuestos y costos de mano de obra son configurables por el usuario.
- **Localización:** Todo el código fuente (comentarios) y la interfaz están en **Español**.
- **Infraestructura de Respaldo:** Proyecto inicializado y vinculado a GitHub ([Repo](https://github.com/esteban0201-source/control-de-presupuestos.git)).
- **PWA robusta:** Lógica de recarga forzada en `index.html` para evitar problemas de caché del Service Worker.

---

## 🛠️ Detalles Técnicos para el Futuro
- **Base de Datos (Dexie.js):** Actualmente en **Versión 2**.
  - Clave importante: `taxType` en la tabla `projects` almacena si es boleta o factura.
  - Clave importante: `taxRate` almacena el porcentaje usado al momento de crear el presupuesto.
- **Generación de PDF:** Centralizada en `js/pdfGenerator.js` usando la función `buildPDF`. Soporta tanto vista previa como descarga final.
- **Caché:** Service Worker actualmente en `voltmanage-v4`.

---

## 📋 Tareas Pendientes / Ideas Futuras
1. **Logo Personalizado:** Añadir opción en "Ajustes" para que el usuario suba su logo y aparezca en el cabezal del PDF.
2. **Exportación de Datos:** Crear una función para exportar toda la base de datos a un archivo JSON (Backup manual).
3. **Optimización de Imágenes:** Implementar compresión más agresiva si la bitácora crece mucho.
4. **Filtros en Cobros:** Añadir buscador por nombre de cliente o filtro por estado (Solo Pendientes, Solo Pagados).

---

## 💡 Notas para la Próxima Sesión
- Si se realizan cambios en archivos estáticos (JS/CSS), **siempre** subir la versión en `service-worker.js` y verificar la lógica de recarga en `index.html`.
- La base de datos es local. Si se necesita cambiar el esquema, recuerda subir la versión en `js/db.js`.

---
*Este documento es dinámico. Mantener actualizado para asegurar la continuidad del desarrollo.*
