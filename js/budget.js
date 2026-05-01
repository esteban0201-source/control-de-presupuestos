// ============================================================
// budget.js — Gestor de Presupuestos (con Boleta / Factura)
// ============================================================

window.renderBudget = async (container) => {
    const settings = await dbAPI.getSettings();
    const laborCostPerDay    = Number(settings.laborCostPerDay)   || 50000;
    const boletaPercentage   = Number(settings.boletaPercentage)  || 15.5;
    const facturaPercentage  = Number(settings.facturaPercentage) || 19;

    // ---- Estado local ----
    let items     = [];
    let laborDays = 1;
    let margin    = 20;
    let taxType   = 'factura'; // 'boleta' | 'factura'

    function getTaxRate() {
        return taxType === 'boleta' ? boletaPercentage : facturaPercentage;
    }

    function calcTotals() {
        const rawMats    = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        const marginAmt  = rawMats * (margin / 100);
        const matsBilled = rawMats + marginAmt;
        const labor      = laborDays * laborCostPerDay;
        const subtotal   = matsBilled + labor;
        const taxRate    = getTaxRate();
        const iva        = subtotal * (taxRate / 100);
        const total      = subtotal + iva;
        return { rawMats, marginAmt, matsBilled, labor, subtotal, iva, total, taxRate };
    }

    function render() {
        const t = calcTotals();
        const docLabel = taxType === 'boleta'
            ? `Boleta (${t.taxRate}%)`
            : `Factura (${t.taxRate}%)`;

        container.innerHTML = `
            <!-- Tarjeta de introducción -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🧮</div>
                    <div>
                        <div class="card-title">Nuevo Presupuesto</div>
                        <div class="card-sub">Completa los datos para cotizar al cliente</div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="flex:2;">
                        <label>👤 Nombre del Cliente / Proyecto</label>
                        <input type="text" id="bgt-client" class="form-control" placeholder="Ej. Instalación Casa Flores, Vitacura">
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>📄 Tipo de Documento</label>
                        <select id="tax-type" class="form-control">
                            <option value="factura" ${taxType === 'factura' ? 'selected' : ''}>
                                🧾 Factura (${facturaPercentage}% IVA)
                            </option>
                            <option value="boleta" ${taxType === 'boleta' ? 'selected' : ''}>
                                🧾 Boleta (${boletaPercentage}%)
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tarjeta de materiales -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🧱</div>
                    <div>
                        <div class="card-title">Materiales</div>
                        <div class="card-sub">Agrega cada ítem de forma manual</div>
                    </div>
                </div>

                <div class="flex-gap" style="margin-bottom:1rem;">
                    <input type="text"   id="mat-name"  class="form-control" placeholder="Material (Ej. Cable 12AWG)" style="flex:3; min-width:120px;">
                    <input type="number" id="mat-qty"   class="form-control" placeholder="Cant." style="flex:1; min-width:70px;" min="1" value="1">
                    <input type="number" id="mat-price" class="form-control" placeholder="$ c/u" style="flex:2; min-width:100px;" min="0">
                    <button id="add-mat" class="btn btn-primary btn-sm" style="flex-shrink:0; white-space:nowrap;">
                        <i class="ph ph-plus-circle"></i> Añadir
                    </button>
                </div>

                <div id="mat-list">
                    ${items.length === 0
                        ? `<p class="text-muted text-center" style="padding:1rem;">Sin materiales. Añade el primero ☝️</p>`
                        : items.map((it, idx) => `
                            <div class="mat-item">
                                <div class="mat-name">${it.name}</div>
                                <div class="text-muted" style="font-size:0.82rem;">${it.quantity} × ${window.formatCurrency(it.unitPrice)}</div>
                                <div class="mat-price">${window.formatCurrency(it.quantity * it.unitPrice)}</div>
                                <button class="btn-icon-sm rem-mat" data-idx="${idx}" title="Eliminar">🗑️</button>
                            </div>`).join('')
                    }
                </div>
            </div>

            <!-- Tarjeta de mano de obra y margen -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">👷</div>
                    <div>
                        <div class="card-title">Mano de Obra y Margen</div>
                        <div class="card-sub">Tarifa base: ${window.formatCurrency(laborCostPerDay)} / día (editable en Ajustes)</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>🗓️ Días de Trabajo</label>
                        <input type="number" id="labor-days" class="form-control" value="${laborDays}" min="0" step="0.5">
                    </div>
                    <div class="form-group">
                        <label>📈 Margen sobre Materiales (%)</label>
                        <input type="number" id="margin-pct" class="form-control" value="${margin}" min="0">
                    </div>
                </div>
            </div>

            <!-- Tarjeta de resumen -->
            <div class="card" style="border: 2px solid var(--teal-mid);">
                <div class="card-header">
                    <div class="card-icon">💡</div>
                    <div>
                        <div class="card-title">Resumen del Presupuesto</div>
                        <div class="card-sub">Documento: ${docLabel}</div>
                    </div>
                </div>

                <div class="summary-box">
                    <div class="summary-row"><span>Costo Materiales (real)</span><span>${window.formatCurrency(t.rawMats)}</span></div>
                    <div class="summary-row"><span>Margen (+${margin}%)</span><span>+ ${window.formatCurrency(t.marginAmt)}</span></div>
                    <div class="summary-row"><span>Mano de Obra (${laborDays} día${laborDays !== 1 ? 's' : ''})</span><span>${window.formatCurrency(t.labor)}</span></div>
                    <div class="summary-row" style="opacity:0.75;"><span>Subtotal Neto</span><span>${window.formatCurrency(t.subtotal)}</span></div>
                    <div class="summary-row" style="opacity:0.85;">
                        <span>${taxType === 'boleta' ? `Boleta (${t.taxRate}%)` : `IVA Factura (${t.taxRate}%)`}</span>
                        <span>+ ${window.formatCurrency(t.iva)}</span>
                    </div>
                    <div class="summary-row total-row"><span>TOTAL A COBRAR</span><span>${window.formatCurrency(t.total)}</span></div>
                </div>

                <div class="flex-gap mt-1">
                    <button id="save-bgt" class="btn btn-primary btn-large" style="flex:2;">
                        <i class="ph ph-floppy-disk"></i> Guardar Presupuesto
                    </button>
                    <button id="preview-pdf" class="btn btn-gold btn-large" style="flex:1;" ${items.length === 0 && laborDays === 0 ? 'disabled' : ''}>
                        📄 PDF Previo
                    </button>
                </div>
            </div>
        `;

        // ---- Selector de tipo de impuesto ----
        document.getElementById('tax-type').addEventListener('change', (e) => {
            taxType = e.target.value;
            render();
        });

        // ---- Agregar material ----
        document.getElementById('add-mat').addEventListener('click', () => {
            const name  = document.getElementById('mat-name').value.trim();
            const qty   = parseFloat(document.getElementById('mat-qty').value)   || 0;
            const price = parseFloat(document.getElementById('mat-price').value) || 0;
            if (!name || qty <= 0 || price < 0) { alert('Completa nombre, cantidad y precio.'); return; }
            items.push({ name, quantity: qty, unitPrice: price });
            render();
        });

        // ---- Eliminar material ----
        document.querySelectorAll('.rem-mat').forEach(btn => {
            btn.addEventListener('click', () => {
                items.splice(Number(btn.dataset.idx), 1);
                render();
            });
        });

        // ---- Recálculo en vivo ----
        document.getElementById('labor-days').addEventListener('input', () => {
            laborDays = parseFloat(document.getElementById('labor-days').value) || 0;
            render();
        });
        document.getElementById('margin-pct').addEventListener('input', () => {
            margin = parseFloat(document.getElementById('margin-pct').value) || 0;
            render();
        });

        // ---- Vista previa PDF (sin guardar) ----
        document.getElementById('preview-pdf').addEventListener('click', async () => {
            const clientName = document.getElementById('bgt-client').value.trim() || 'Vista Previa';
            if (window.generatePDFDirect) {
                const t2 = calcTotals();
                await window.generatePDFDirect({
                    clientName,
                    taxType,
                    taxRate: t2.taxRate,
                    subtotal: t2.subtotal,
                    iva: t2.iva,
                    total: t2.total,
                    laborCost: t2.labor,
                    totalMaterials: t2.rawMats,
                    date: new Date().toISOString(),
                    id: 0
                }, items);
            }
        });

        // ---- Guardar ----
        document.getElementById('save-bgt').addEventListener('click', async () => {
            const clientName = document.getElementById('bgt-client').value.trim();
            if (!clientName)                           { alert('Ingresa el nombre del cliente.'); return; }
            if (items.length === 0 && laborDays === 0) { alert('Agrega materiales o días de trabajo.'); return; }

            const t2 = calcTotals();
            try {
                const newId = await dbAPI.addProject({
                    clientName,
                    date           : new Date().toISOString(),
                    totalMaterials : t2.rawMats,
                    laborCost      : t2.labor,
                    margin,
                    subtotal       : t2.subtotal,
                    iva            : t2.iva,
                    total          : t2.total,
                    taxType,
                    taxRate        : t2.taxRate,
                    status         : 'Pendiente'
                }, items);

                // Ofrecer descarga inmediata del PDF
                window.showModal(`
                    <div class="modal-title">✅ Presupuesto Guardado</div>
                    <p class="mb-1">El presupuesto de <strong>${clientName}</strong> fue guardado correctamente.</p>
                    <p class="text-muted mb-1" style="font-size:0.9rem;">¿Deseas descargar el PDF ahora para enviar al cliente?</p>
                    <div class="flex-gap" style="justify-content:flex-end;">
                        <button class="btn btn-outline close-modal">Ahora no</button>
                        <button class="btn btn-gold" id="dl-pdf-now">📄 Descargar PDF</button>
                    </div>
                `);

                document.getElementById('dl-pdf-now').addEventListener('click', async () => {
                    window.closeModal();
                    if (window.generatePDF) await window.generatePDF(newId);
                });

                items = []; laborDays = 1; margin = 20; taxType = 'factura';
                render();
            } catch (err) {
                console.error(err);
                alert('Error al guardar: ' + err.message);
            }
        });
    }

    render();
};
