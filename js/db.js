// Inicializar la base de datos Dexie
const db = new Dexie('VoltManageDB');

db.version(1).stores({
    inventory: '++id, name, unit, referencePrice',
    projects: '++id, clientName, date, totalMaterials, laborCost, margin, subtotal, iva, total, status',
    budgetItems: '++id, projectId, inventoryId, name, quantity, unitPrice, total',
    payments: '++id, projectId, amount, date, notes',
    logbook: '++id, projectId, date, note, imageBase64',
    settings: 'key, value'
});

// Versión 2: añadir campo taxType a los proyectos (Boleta vs Factura)
db.version(2).stores({
    inventory: '++id, name, unit, referencePrice',
    projects: '++id, clientName, date, totalMaterials, laborCost, margin, subtotal, iva, total, status, taxType',
    budgetItems: '++id, projectId, inventoryId, name, quantity, unitPrice, total',
    payments: '++id, projectId, amount, date, notes',
    logbook: '++id, projectId, date, note, imageBase64',
    settings: 'key, value'
});

// Configuraciones por defecto
const DEFAULT_SETTINGS = {
    laborCostPerDay: 50000,
    ivaPercentage: 19,
    boletaPercentage: 15.5,
    facturaPercentage: 19,
    provisionToolWear: 20000,
    provisionVehicle: 30000
};

// Inicializar configuraciones — asegurar que las nuevas claves existan
async function initSettings() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        const existing = await db.settings.get(key);
        if (existing === undefined) {
            await db.settings.put({ key, value });
        }
    }
}

initSettings();

// Funciones de ayuda para la base de datos
const dbAPI = {
    // Inventario
    getInventory: () => db.inventory.toArray(),
    addInventoryItem: (item) => db.inventory.add(item),
    updateInventoryItem: (id, item) => db.inventory.update(id, item),
    deleteInventoryItem: (id) => db.inventory.delete(id),

    // Proyectos (Presupuestos)
    getProjects: () => db.projects.orderBy('date').reverse().toArray(),
    getProject: (id) => db.projects.get(id),
    addProject: async (project, items) => {
        return await db.transaction('rw', db.projects, db.budgetItems, async () => {
            const projectId = await db.projects.add(project);
            if (items && items.length > 0) {
                const itemsWithProjectId = items.map(item => ({ ...item, projectId }));
                await db.budgetItems.bulkAdd(itemsWithProjectId);
            }
            return projectId;
        });
    },
    updateProjectStatus: (id, status) => db.projects.update(id, { status }),
    deleteProject: async (id) => {
        return await db.transaction('rw', db.projects, db.budgetItems, db.payments, db.logbook, async () => {
            await db.projects.delete(id);
            await db.budgetItems.where({projectId: id}).delete();
            await db.payments.where({projectId: id}).delete();
            await db.logbook.where({projectId: id}).delete();
        });
    },
    getBudgetItems: (projectId) => db.budgetItems.where({projectId}).toArray(),

    // Pagos (Abonos)
    getPayments: (projectId) => db.payments.where({projectId}).toArray(),
    addPayment: (payment) => db.payments.add(payment),
    deletePayment: (id) => db.payments.delete(id),

    // Bitácora
    getLogs: () => db.logbook.orderBy('date').reverse().toArray(),
    getLogsByProject: (projectId) => db.logbook.where({projectId}).toArray(),
    addLog: (log) => db.logbook.add(log),

    // Configuraciones
    getSettings: async () => {
        const settingsArray = await db.settings.toArray();
        const settings = {};
        settingsArray.forEach(s => {
            settings[s.key] = s.value;
        });
        return settings;
    },
    updateSetting: (key, value) => db.settings.put({key, value})
};
