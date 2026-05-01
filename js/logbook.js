// ============================================================
// logbook.js — Bitácora de Obra (offline-first, with photos)
// ============================================================

window.renderLogbook = async (container) => {
    await render();

    async function render() {
        const projects = await dbAPI.getProjects();
        const logs     = await dbAPI.getLogs();

        const projectMap = {};
        projects.forEach(p => { projectMap[p.id] = p.clientName; });

        let pendingImage = null; // Base64 de la foto capturada

        container.innerHTML = `
            <!-- Tarjeta de agregar registro -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📷</div>
                    <div>
                        <div class="card-title">Agregar Registro</div>
                        <div class="card-sub">Captura foto y anota el avance desde terreno</div>
                    </div>
                </div>

                <div class="form-group">
                    <label>📋 Proyecto</label>
                    <select id="log-project" class="form-control">
                        <option value="">— Selecciona un proyecto —</option>
                        ${projects.map(p => `<option value="${p.id}">${p.clientName}</option>`).join('')}
                    </select>
                </div>

                <!-- Zona de cámara -->
                <div class="form-group">
                    <label>📸 Evidencia Fotográfica</label>
                    <div class="camera-zone" id="cam-zone">
                        <input type="file" id="log-photo" accept="image/*" capture="environment">
                        <div id="cam-placeholder">
                            <div class="camera-zone-icon">📷</div>
                            <p>Toca aquí para abrir la cámara o galería</p>
                            <p style="font-size:0.75rem; opacity:0.7; margin-top:4px;">Funciona sin internet — la foto se guarda localmente</p>
                        </div>
                        <img id="cam-preview" src="" alt="Vista previa" style="display:none; width:100%; max-height:240px; object-fit:cover; border-radius:10px;">
                    </div>
                </div>

                <div class="form-group">
                    <label>📝 Nota Técnica / Avance</label>
                    <textarea id="log-note" class="form-control" rows="3" placeholder="Ej. Se instaló el tablero principal. Canaletas fijadas en muro norte. Pendiente empalme fase 3…"></textarea>
                </div>

                <button id="save-log" class="btn btn-primary btn-full btn-large">
                    <i class="ph ph-plus-circle"></i> Agregar a Bitácora
                </button>
            </div>

            <!-- Lista de registros -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🗂️</div>
                    <div>
                        <div class="card-title">Registros de Obra</div>
                        <div class="card-sub">${logs.length} entradas guardadas</div>
                    </div>
                </div>

                ${logs.length === 0
                    ? `<p class="text-muted text-center" style="padding:1.5rem;">Sin registros aún.<br>¡Agrega el primer avance desde terreno! 👷</p>`
                    : logs.map(log => {
                        const projectName = projectMap[log.projectId] || 'Proyecto eliminado';
                        return `
                        <div class="log-card">
                            ${log.imageBase64
                                ? `<img class="log-thumb" src="${log.imageBase64}" alt="Foto obra">`
                                : `<div class="log-thumb-placeholder">🏗️</div>`
                            }
                            <div class="log-body" style="flex:1;">
                                <h4>${projectName}</h4>
                                <div class="log-date">📅 ${window.formatDate(log.date)}</div>
                                <p>${log.note || '<em class="text-muted">Sin nota de texto</em>'}</p>
                            </div>
                        </div>`;
                    }).join('')
                }
            </div>
        `;

        // ---- Captura y redimensionamiento de foto ----
        document.getElementById('log-photo').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_W  = 900;
                    const scale  = Math.min(1, MAX_W / img.width);
                    canvas.width  = img.width  * scale;
                    canvas.height = img.height * scale;
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    pendingImage = canvas.toDataURL('image/jpeg', 0.72);

                    const preview = document.getElementById('cam-preview');
                    const placeholder = document.getElementById('cam-placeholder');
                    preview.src          = pendingImage;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });

        // ---- Guardar registro ----
        document.getElementById('save-log').addEventListener('click', async () => {
            const projectId = Number(document.getElementById('log-project').value);
            const note      = document.getElementById('log-note').value.trim();

            if (!projectId)                  { alert('Selecciona un proyecto.'); return; }
            if (!note && !pendingImage)       { alert('Agrega una nota o una foto.'); return; }

            try {
                await dbAPI.addLog({
                    projectId,
                    date       : new Date().toISOString(),
                    note,
                    imageBase64: pendingImage
                });
                pendingImage = null;
                await render();
                alert('✅ Registro guardado en la bitácora.');
            } catch (err) {
                console.error(err);
                alert('Error al guardar: ' + err.message);
            }
        });
    }
};
