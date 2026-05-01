// ============================================================
// billing.js — Cobros, Abonos y Saldo Pendiente (con Eliminar)
// ============================================================

window.renderBilling = async (container) => {
    await render();

    async function render() {
        const projects = await dbAPI.getProjects();

        const allPayments = {};
        for (const p of projects) {
            const pays = await dbAPI.getPayments(p.id);
            allPayments[p.id] = pays;
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">💳</div>
                    <div>
                        <div class="card-title">Cobros y Abonos</div>
                        <div class="card-sub">${projects.length} proyectos registrados</div>
                    </div>
                </div>

                ${projects.length === 0
                    ? `<p class="text-muted text-center" style="padding:2rem;">Sin proyectos aún.<br>Crea un presupuesto primero 📋</p>`
                    : projects.map(p => {
                        const pays    = allPayments[p.id] || [];
                        const paid    = pays.reduce((s, pay) => s + pay.amount, 0);
                        const balance = p.total - paid;
                        const pct     = p.total > 0 ? Math.min(100, Math.round((paid / p.total) * 100)) : 0;

                        const taxLabel = p.taxType === 'boleta'
                            ? `🧾 Boleta (${p.taxRate || 15.5}%)`
                            : `🧾 Factura (${p.taxRate || 19}% IVA)`;

                        const badgeClass =
                            p.status === 'Pagado'    ? 'badge-paid'     :
                            p.status === 'Abonado'   ? 'badge-partial'  :
                            p.status === 'Rechazado' ? 'badge-rejected' : 'badge-pending';

                        return `
                        <div class="billing-card" style="background:var(--bg-page); border-radius:14px; padding:1.25rem; margin-bottom:1rem; border-left: 4px solid var(--teal-mid);">

                            <!-- Fila superior -->
                            <div class="flex-between mb-1">
                                <div>
                                    <h3 style="font-size:1.05rem; font-weight:700; color:var(--teal-dark);">${p.clientName}</h3>
                                    <span style="font-size:0.78rem; color:var(--text-mid);">${window.formatDate(p.date)} · ${taxLabel}</span>
                                </div>
                                <div class="text-right">
                                    <div class="bold" style="font-size:1.05rem;">${window.formatCurrency(p.total)}</div>
                                    <span class="badge ${badgeClass}">${p.status}</span>
                                </div>
                            </div>

                            <!-- Barra de progreso -->
                            <div style="background:#e2e8f0; border-radius:30px; height:10px; margin-bottom:8px; overflow:hidden;">
                                <div style="width:${pct}%; background:linear-gradient(90deg, var(--teal-dark), var(--teal-light)); height:100%; border-radius:30px; transition:width 0.5s;"></div>
                            </div>
                            <div class="flex-between" style="font-size:0.8rem; margin-bottom:12px;">
                                <span class="text-muted">Pagado: <strong class="text-green">${window.formatCurrency(paid)}</strong></span>
                                <span class="text-muted">Saldo: <strong class="${balance > 0 ? 'text-red' : 'text-green'}">${window.formatCurrency(balance)}</strong></span>
                                <span class="text-muted">${pct}%</span>
                            </div>

                            <!-- Botones de acción -->
                            <div class="flex-gap" style="flex-wrap:wrap;">
                                <button class="btn btn-outline btn-sm btn-pdf" data-id="${p.id}">📄 PDF</button>
                                ${balance > 0 ? `
                                <button class="btn btn-primary btn-sm btn-abonar" data-id="${p.id}" data-balance="${balance}" data-client="${p.clientName}">
                                    💸 Abonar
                                </button>` : ''}
                                <button class="btn btn-sm btn-historial" data-id="${p.id}" style="background:var(--teal-pale); color:var(--teal-dark); border:none;">
                                    📂 Abonos (${pays.length})
                                </button>
                                <button class="btn btn-danger btn-sm btn-delete-proj" data-id="${p.id}" data-client="${p.clientName}" style="margin-left:auto;">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>`;
                    }).join('')
                }
            </div>
        `;

        // ---- PDF ----
        container.querySelectorAll('.btn-pdf').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (window.generatePDF) await window.generatePDF(Number(btn.dataset.id));
                else alert('Generador de PDF no disponible.');
            });
        });

        // ---- Registrar Abono ----
        container.querySelectorAll('.btn-abonar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id      = Number(btn.dataset.id);
                const balance = Number(btn.dataset.balance);
                const client  = btn.dataset.client;

                window.showModal(`
                    <div class="modal-title">💸 Registrar Abono</div>
                    <p style="margin-bottom:0.5rem;"><strong>Cliente:</strong> ${client}</p>
                    <p class="mb-1">Saldo pendiente: <strong class="text-red">${window.formatCurrency(balance)}</strong></p>

                    <div class="form-group">
                        <label>Monto a abonar (CLP)</label>
                        <input type="number" id="pay-amount" class="form-control" min="1" max="${balance}" placeholder="${window.formatCurrency(balance)}">
                    </div>
                    <div class="form-group">
                        <label>Nota (opcional)</label>
                        <input type="text" id="pay-note" class="form-control" placeholder="Ej. Transferencia Banco Estado">
                    </div>
                    <div class="flex-gap" style="justify-content:flex-end;">
                        <button class="btn btn-outline close-modal">Cancelar</button>
                        <button class="btn btn-primary" id="confirm-pay">Guardar Abono</button>
                    </div>
                `);

                document.getElementById('confirm-pay').addEventListener('click', async () => {
                    const amount = Number(document.getElementById('pay-amount').value);
                    const note   = document.getElementById('pay-note').value;
                    if (amount <= 0 || amount > balance) { alert('Monto inválido.'); return; }
                    await dbAPI.addPayment({ projectId: id, amount, date: new Date().toISOString(), notes: note || 'Abono' });
                    if (amount === balance) await dbAPI.updateProjectStatus(id, 'Pagado');
                    else                    await dbAPI.updateProjectStatus(id, 'Abonado');
                    window.closeModal();
                    await render();
                    alert('✅ Abono registrado.');
                });
            });
        });

        // ---- Ver historial de abonos ----
        container.querySelectorAll('.btn-historial').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id   = Number(btn.dataset.id);
                const pays = await dbAPI.getPayments(id);

                window.showModal(`
                    <div class="modal-title">📂 Historial de Abonos</div>
                    ${pays.length === 0
                        ? '<p class="text-muted">No hay abonos registrados.</p>'
                        : pays.map(pay => `
                            <div class="flex-between" style="padding: 8px 0; border-bottom: 1px solid var(--teal-pale);">
                                <div>
                                    <div class="bold">${window.formatCurrency(pay.amount)}</div>
                                    <div class="text-muted" style="font-size:0.8rem;">${pay.notes}</div>
                                </div>
                                <div class="flex-gap">
                                    <div class="text-muted">${window.formatDate(pay.date)}</div>
                                    <button class="btn btn-danger btn-sm del-payment" data-pid="${pay.id}" style="padding:4px 8px;">🗑️</button>
                                </div>
                            </div>`).join('')
                    }
                    <button class="btn btn-outline close-modal mt-1" style="width:100%;">Cerrar</button>
                `);

                // Eliminar abono individual
                document.querySelectorAll('.del-payment').forEach(delBtn => {
                    delBtn.addEventListener('click', async () => {
                        if (!confirm('¿Eliminar este abono?')) return;
                        await dbAPI.deletePayment(Number(delBtn.dataset.pid));
                        // Recalcular estado
                        const remaining = await dbAPI.getPayments(id);
                        const proj      = await dbAPI.getProject(id);
                        const totalPaid = remaining.reduce((s, py) => s + py.amount, 0);
                        if (totalPaid === 0)          await dbAPI.updateProjectStatus(id, 'Pendiente');
                        else if (totalPaid < proj.total) await dbAPI.updateProjectStatus(id, 'Abonado');
                        window.closeModal();
                        await render();
                    });
                });
            });
        });

        // ---- Eliminar Proyecto ----
        container.querySelectorAll('.btn-delete-proj').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id     = Number(btn.dataset.id);
                const client = btn.dataset.client;
                window.showModal(`
                    <div class="modal-title" style="color:#dc2626;">⚠️ Eliminar Proyecto</div>
                    <p class="mb-1">¿Estás seguro que deseas eliminar el proyecto de <strong>${client}</strong>?</p>
                    <div style="background:#fee2e2; border-radius:10px; padding:0.85rem; margin-bottom:1rem; font-size:0.88rem; color:#991b1b;">
                        Esta acción eliminará el presupuesto, todos los abonos y las entradas de bitácora de este proyecto. <strong>No se puede deshacer.</strong>
                    </div>
                    <div class="flex-gap" style="justify-content:flex-end;">
                        <button class="btn btn-outline close-modal">Cancelar</button>
                        <button class="btn btn-danger" id="confirm-delete-proj">🗑️ Sí, Eliminar</button>
                    </div>
                `);
                document.getElementById('confirm-delete-proj').addEventListener('click', async () => {
                    try {
                        await dbAPI.deleteProject(id);
                        window.closeModal();
                        await render();
                    } catch (err) {
                        alert('Error al eliminar: ' + err.message);
                    }
                });
            });
        });
    }
};
