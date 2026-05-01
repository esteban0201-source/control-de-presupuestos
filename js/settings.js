// ============================================================
// settings.js — Configuración, Provisiones y Porcentajes
// ============================================================

window.renderSettings = async (container) => {
    const settings = await dbAPI.getSettings();

    container.innerHTML = `
        <!-- Mano de Obra -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">👷</div>
                <div>
                    <div class="card-title">Mano de Obra</div>
                    <div class="card-sub">Valor base por día trabajado</div>
                </div>
            </div>
            <div class="form-group">
                <label>💲 Valor por Día (CLP)</label>
                <input type="number" id="set-labor" class="form-control" value="${settings.laborCostPerDay || 50000}" min="0">
            </div>
            <p class="text-muted" style="font-size:0.82rem; margin-top:-0.5rem;">
                Se usa en todos los presupuestos nuevos. Los guardados no cambian.
            </p>
        </div>

        <!-- Impuestos / Documentos -->
        <div class="card" style="border-left: 4px solid var(--teal-mid);">
            <div class="card-header">
                <div class="card-icon">📑</div>
                <div>
                    <div class="card-title">Tipos de Documento e Impuestos</div>
                    <div class="card-sub">Porcentajes aplicados en Presupuesto</div>
                </div>
            </div>

            <div style="background:#f0f9ff; border-radius:12px; padding:1rem; margin-bottom:1.2rem; border:1px solid #bae6fd;">
                <p style="font-size:0.88rem; color:#075985; line-height:1.6;">
                    💡 <strong>Diferencia clave:</strong> La <em>Boleta</em> en Chile aplica un impuesto del
                    <strong>15.5%</strong> (aunque el consumidor paga el 19% IVA, el vendedor ya lo absorbió en el precio).
                    La <em>Factura</em> adiciona el <strong>19% de IVA</strong> explícitamente.
                    Puedes ajustar ambos porcentajes aquí.
                </p>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>🧾 Boleta — Impuesto (%)</label>
                    <input type="number" id="set-boleta" class="form-control"
                        value="${settings.boletaPercentage ?? 15.5}" min="0" max="100" step="0.1"
                        placeholder="15.5">
                    <p class="text-muted" style="font-size:0.75rem; margin-top:4px;">Por defecto: 15.5%</p>
                </div>
                <div class="form-group">
                    <label>🧾 Factura — IVA (%)</label>
                    <input type="number" id="set-factura" class="form-control"
                        value="${settings.facturaPercentage ?? 19}" min="0" max="100" step="0.1"
                        placeholder="19">
                    <p class="text-muted" style="font-size:0.75rem; margin-top:4px;">Por defecto: 19%</p>
                </div>
            </div>

            <div style="background:#fffbeb; border-radius:10px; padding:0.85rem; border:1px solid #fde68a; font-size:0.82rem; color:#78350f;">
                ⚠️ El IVA que cobras a través de una <strong>Factura</strong> <em>no es parte de tu utilidad</em>.
                La app ya lo calcula aparte en el Flujo de Caja.
            </div>
        </div>

        <!-- Provisiones -->
        <div class="card" style="border-left: 4px solid var(--accent-gold);">
            <div class="card-header">
                <div class="card-icon" style="background: linear-gradient(135deg, #d97706, #f5a623);">🛡️</div>
                <div>
                    <div class="card-title">Provisiones Mensuales</div>
                    <div class="card-sub">Se descuentan de tu Utilidad Neta en el Flujo de Caja</div>
                </div>
            </div>

            <div style="background:#fffbeb; border-radius:12px; padding:1rem; margin-bottom:1.2rem; border:1px solid #fde68a;">
                <p style="font-size:0.88rem; color:#78350f; line-height:1.6;">
                    💡 <strong>¿Qué son las provisiones?</strong> Es dinero que "apartas" cada mes para cuando
                    una herramienta se rompa o para cubrir el desgaste de tu vehículo.
                    No lo pagas ahora, pero se descuenta de tu utilidad para que sepas
                    cuánto es <em>realmente</em> tuyo.
                </p>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>🔧 Desgaste de Herramientas (CLP/mes)</label>
                    <input type="number" id="set-tools" class="form-control" value="${settings.provisionToolWear || 20000}" min="0">
                </div>
                <div class="form-group">
                    <label>🚗 Bencina / Vehículo (CLP/mes)</label>
                    <input type="number" id="set-vehicle" class="form-control" value="${settings.provisionVehicle || 30000}" min="0">
                </div>
            </div>
        </div>

        <!-- Botón de guardar -->
        <button id="save-settings" class="btn btn-primary btn-full btn-large">
            <i class="ph ph-floppy-disk"></i> Guardar Todos los Ajustes
        </button>

        <!-- Tarjeta "Acerca de" -->
        <div class="card mt-1" style="text-align:center; background: linear-gradient(135deg, var(--teal-dark), var(--teal-mid)); color:white;">
            <div style="font-size:2.5rem; margin-bottom:8px;">⚡</div>
            <div style="font-size:1.1rem; font-weight:800; margin-bottom:4px;">VoltManage Chile</div>
            <div style="font-size:0.82rem; opacity:0.85;">v1.0 — PWA para Servicios Eléctricos</div>
            <div style="font-size:0.78rem; opacity:0.65; margin-top:4px;">Todos los datos se guardan localmente en tu dispositivo.</div>
        </div>
    `;

    document.getElementById('save-settings').addEventListener('click', async () => {
        const labor    = parseFloat(document.getElementById('set-labor').value)   || 0;
        const boleta   = parseFloat(document.getElementById('set-boleta').value)  || 15.5;
        const factura  = parseFloat(document.getElementById('set-factura').value) || 19;
        const tools    = parseFloat(document.getElementById('set-tools').value)   || 0;
        const vehicle  = parseFloat(document.getElementById('set-vehicle').value) || 0;

        await dbAPI.updateSetting('laborCostPerDay',   labor);
        await dbAPI.updateSetting('boletaPercentage',  boleta);
        await dbAPI.updateSetting('facturaPercentage', factura);
        await dbAPI.updateSetting('provisionToolWear', tools);
        await dbAPI.updateSetting('provisionVehicle',  vehicle);
        // Compatibilidad con versiones anteriores
        await dbAPI.updateSetting('ivaPercentage', factura);

        const btn = document.getElementById('save-settings');
        const prev = btn.innerHTML;
        btn.innerHTML  = '✅ Guardado correctamente';
        btn.style.background = '#22c55e';
        setTimeout(() => {
            btn.innerHTML = prev;
            btn.style.background = '';
        }, 2500);
    });
};
