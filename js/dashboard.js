// ============================================================
// dashboard.js — Flujo de Caja Integral
// ============================================================

window.renderDashboard = async (container) => {
    const projects  = await dbAPI.getProjects();
    const settings  = await dbAPI.getSettings();

    let totalRevenue   = 0;
    let totalMaterials = 0;
    let totalLabor     = 0;

    projects.forEach(p => {
        if (p.status !== 'Rechazado') {
            totalRevenue   += p.subtotal   || 0;
            totalMaterials += p.totalMaterials || 0;
            totalLabor     += p.laborCost  || 0;
        }
    });

    const toolWear   = Number(settings.provisionToolWear) || 0;
    const vehicleExp = Number(settings.provisionVehicle)  || 0;
    const fixedCosts = toolWear + vehicleExp;
    const netProfit  = totalRevenue - totalMaterials - totalLabor - fixedCosts;

    container.innerHTML = `
        <!-- Estadísticas -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-emoji">💰</div>
                <div class="stat-label">Ingresos (neto)</div>
                <div class="stat-value">${window.formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-card accent-gold">
                <div class="stat-emoji">🧱</div>
                <div class="stat-label">Costo Materiales</div>
                <div class="stat-value">${window.formatCurrency(totalMaterials)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-emoji">🔧</div>
                <div class="stat-label">Provisiones Fijas</div>
                <div class="stat-value">${window.formatCurrency(fixedCosts)}</div>
            </div>
            <div class="stat-card ${netProfit >= 0 ? 'accent-green' : 'accent-red'}">
                <div class="stat-emoji">${netProfit >= 0 ? '📈' : '📉'}</div>
                <div class="stat-label">Utilidad Neta</div>
                <div class="stat-value ${netProfit >= 0 ? 'green' : 'red'}">${window.formatCurrency(netProfit)}</div>
            </div>
        </div>

        <!-- Gráfico -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">📊</div>
                <div>
                    <div class="card-title">Resumen Visual del Flujo de Caja</div>
                    <div class="card-sub">Ingresos vs Egresos</div>
                </div>
            </div>
            <canvas id="cashChart" height="120"></canvas>
        </div>

        <!-- Explicación de la fórmula -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">💡</div>
                <div>
                    <div class="card-title">¿Cómo se calcula tu Utilidad?</div>
                    <div class="card-sub">Fórmula aplicada internamente</div>
                </div>
            </div>
            <div style="background: var(--bg-page); border-radius: 12px; padding: 1rem; font-size: 0.92rem; line-height: 2;">
                <div class="flex-between"><span>Ingresos Brutos (Sin IVA)</span><strong class="text-teal">${window.formatCurrency(totalRevenue)}</strong></div>
                <div class="flex-between"><span>— Costo de Materiales</span><strong class="text-red">${window.formatCurrency(totalMaterials)}</strong></div>
                <div class="flex-between"><span>— Mano de Obra</span><strong class="text-red">${window.formatCurrency(totalLabor)}</strong></div>
                <div class="flex-between"><span>— Desgaste Herramientas</span><strong class="text-red">${window.formatCurrency(toolWear)}</strong></div>
                <div class="flex-between"><span>— Bencina / Vehículo</span><strong class="text-red">${window.formatCurrency(vehicleExp)}</strong></div>
                <hr class="divider">
                <div class="flex-between bold"><span>= Utilidad Neta Real</span><strong class="${netProfit >= 0 ? 'text-green' : 'text-red'}" style="font-size:1.1rem;">${window.formatCurrency(netProfit)}</strong></div>
            </div>
        </div>

        <!-- Resumen de lista de proyectos -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">📋</div>
                <div>
                    <div class="card-title">Proyectos Recientes</div>
                </div>
            </div>
            ${projects.length === 0 
                ? `<p class="text-muted text-center" style="padding:1rem;">No hay proyectos aún. ¡Crea tu primer presupuesto!</p>` 
                : projects.slice(0,5).map(p => `
                    <div class="flex-between" style="padding: 10px 0; border-bottom: 1px solid var(--teal-pale);">
                        <div>
                            <div class="bold" style="font-size:0.95rem;">${p.clientName}</div>
                            <div class="text-muted">${window.formatDate(p.date)}</div>
                        </div>
                        <div class="text-right">
                            <div class="bold text-teal">${window.formatCurrency(p.total)}</div>
                            <span class="badge ${p.status === 'Pagado' ? 'badge-paid' : p.status === 'Abonado' ? 'badge-partial' : 'badge-pending'}">${p.status}</span>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;

    // Gráfico
    const ctx = document.getElementById('cashChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Materiales', 'Mano de Obra', 'Provisiones', 'Utilidad Neta'],
            datasets: [{
                data: [totalRevenue, totalMaterials, totalLabor, fixedCosts, netProfit],
                backgroundColor: [
                    'rgba(10,156,156,0.8)',
                    'rgba(245,166,35,0.8)',
                    'rgba(10,110,110,0.8)',
                    'rgba(200,100,50,0.7)',
                    netProfit >= 0 ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'
                ],
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(10,110,110,0.07)' },
                    ticks: { callback: v => '$' + (v/1000).toFixed(0) + 'k', color: '#3a5a5a' }
                },
                x: { grid: { display: false }, ticks: { color: '#3a5a5a', font: { weight: '600' } } }
            }
        }
    });
};
