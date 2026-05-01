// ============================================================
// inventory.js — Base de Datos de Precios de Referencia
// ============================================================

window.renderInventory = async (container) => {
    await render();

    async function render() {
        const items = await dbAPI.getInventory();

        container.innerHTML = `
            <!-- Tarjeta de agregar ítem -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📦</div>
                    <div>
                        <div class="card-title">Agregar Material</div>
                        <div class="card-sub">Tus precios de referencia para cotizar rápido</div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group" style="flex:3;">
                        <label>🔌 Nombre del Material</label>
                        <input type="text" id="inv-name" class="form-control" placeholder="Ej. Cable THHN 12 AWG">
                    </div>
                    <div class="form-group" style="flex:1.5;">
                        <label>📏 Unidad</label>
                        <input type="text" id="inv-unit" class="form-control" placeholder="Metro / Und.">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:2;">
                        <label>💲 Precio de Referencia (CLP)</label>
                        <input type="number" id="inv-price" class="form-control" placeholder="Ej. 850" min="0">
                    </div>
                    <div class="form-group" style="flex:1; display:flex; align-items:flex-end;">
                        <button id="add-inv" class="btn btn-primary btn-full">
                            <i class="ph ph-plus-circle"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tarjeta de tabla -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🗃️</div>
                    <div>
                        <div class="card-title">Precios de Referencia</div>
                        <div class="card-sub">${items.length} materiales registrados</div>
                    </div>
                </div>

                ${items.length === 0
                    ? `<p class="text-muted text-center" style="padding:2rem;">
                            Sin materiales aún.<br>
                            Agrega cables, protecciones y más 🔌
                        </p>`
                    : `<div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Unidad</th>
                                    <th>Precio Ref.</th>
                                    <th style="width:60px; text-align:center;">Del.</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(it => `
                                    <tr>
                                        <td><strong>${it.name}</strong></td>
                                        <td class="text-muted">${it.unit}</td>
                                        <td class="text-teal bold">${window.formatCurrency(it.referencePrice)}</td>
                                        <td style="text-align:center;">
                                            <button class="btn-icon-sm del-inv" data-id="${it.id}" title="Eliminar">🗑️</button>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            </div>

            <!-- Tarjeta de consejo -->
            <div class="card" style="border-left: 4px solid var(--accent-gold); background: #fffbeb;">
                <div class="flex-gap">
                    <div style="font-size:2rem;">💡</div>
                    <div>
                        <div class="card-title" style="color:#92400e;">Consejo</div>
                        <p style="font-size:0.88rem; color:#78350f;">
                            Mantén tus precios actualizados. Al crear un presupuesto en el módulo
                            <strong>🧮 Presupuesto</strong>, puedes buscar estos materiales directamente para
                            agilizar la cotización.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // ---- Agregar ----
        document.getElementById('add-inv').addEventListener('click', async () => {
            const name  = document.getElementById('inv-name').value.trim();
            const unit  = document.getElementById('inv-unit').value.trim();
            const price = parseFloat(document.getElementById('inv-price').value);

            if (!name || !unit || isNaN(price) || price < 0) {
                alert('Completa nombre, unidad y precio correctamente.');
                return;
            }

            try {
                await dbAPI.addInventoryItem({ name, unit, referencePrice: price });
                await render();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });

        // ---- Eliminar ----
        container.querySelectorAll('.del-inv').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm(`¿Eliminar este material del inventario?`)) return;
                await dbAPI.deleteInventoryItem(Number(btn.dataset.id));
                await render();
            });
        });
    }
};
