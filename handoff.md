# 🤝 Archivo de Handoff - VoltManage Chile

Este documento sirve como bitácora de estado para que cualquier desarrollador (o IA) pueda retomar el proyecto exactamente donde se dejó. **Actualizar este archivo al finalizar cada sesión.**

---

## 📅 Última Actualización: 06 de Mayo, 2026 (v3)

### ✅ Estado Actual
La aplicación es una PWA completamente funcional enfocada en la gestión eléctrica en Chile. Soporta flujos financieros, presupuestos legales, bitácora de obra con fotos y gestión de inventario.

### 🚀 Funcionalidades Implementadas recientemente:
- **🧮 Mano de Obra Centralizada en Presupuesto:** Se eliminó por completo la configuración de Mano de Obra de "Ajustes". Ahora se gestiona **exclusivamente** dentro del Gestor de Presupuestos (campo **"$/Día"**).
- **💰 Tarifa de Mano de Obra Editable:** Se puede cambiar el valor diario para cada proyecto específico.
- **✏️ Edición de Materiales:** Los usuarios pueden editar materiales ya añadidos en un presupuesto (icono de lápiz).
- **🇨🇱 Impuestos Chilenos:** Selector dinámico entre **Boleta (15.5%)** y **Factura (19% IVA)**.
- **🇪🇸 Localización:** Todo el código fuente (comentarios) y la interfaz están en **Español**.
- **⚡ PWA robusta:** Lógica de recarga forzada (v8).

---

## 🛠️ Detalles Técnicos para el Futuro
- **Base de Datos (Dexie.js):** Actualmente en **Versión 2**.
- **Generación de PDF:** Centralizada en `js/pdfGenerator.js`.
- **Caché:** Service Worker actualmente en **`voltmanage-v8`**.

---

## 📋 Tareas Pendientes / Ideas Futuras
1. **Logo Personalizado:** Opción en "Ajustes" para subir logo corporativo.
2. **Exportación de Datos:** Función para backup manual en JSON.
3. **Filtros en Cobros:** Buscador por cliente.

---
*Este documento es dinámico. Mantener actualizado para asegurar la continuidad del desarrollo.*
