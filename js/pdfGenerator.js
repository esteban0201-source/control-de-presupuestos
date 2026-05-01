// ============================================================
// pdfGenerator.js — Generación de Presupuesto PDF (Boleta / Factura)
// ============================================================

// ---- Constructor compartido de PDF ----
async function buildPDF(project, items) {
    const { jsPDF } = window.jspdf;
    const doc        = new jsPDF({ unit: 'mm', format: 'letter' });

    const taxType  = project.taxType  || 'factura';
    const taxRate  = (project.taxRate != null) ? project.taxRate : (taxType === 'boleta' ? 15.5 : 19);
    const docLabel = taxType === 'boleta'
        ? `BOLETA (${taxRate}%)`
        : `FACTURA IVA ${taxRate}%`;

    const COLOR_DARK = [10, 110, 110];
    const COLOR_MID  = [10, 156, 156];
    const COLOR_PALE = [214, 245, 245];
    const COLOR_TEXT = [26, 42, 42];
    const COLOR_GRAY = [100, 120, 120];
    const pageW = doc.internal.pageSize.getWidth();

    // ---- CABECERA ----
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, 0, pageW, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('VoltManage Chile', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Servicios Electricos Profesionales', 14, 23);

    const badgeX = pageW - 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PRESUPUESTO', badgeX, 16, { align: 'right' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text(docLabel, badgeX, 23, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`N ${String(project.id || 0).padStart(5, '0')}`, badgeX, 30, { align: 'right' });
    doc.text(`Fecha: ${window.formatDate(project.date)}`, badgeX, 36, { align: 'right' });

    // ---- BANDA DE CLIENTE ----
    doc.setFillColor(...COLOR_PALE);
    doc.rect(0, 42, pageW, 22, 'F');
    doc.setTextColor(...COLOR_DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CLIENTE / PROYECTO', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(project.clientName || 'Sin nombre', 14, 58);

    // ---- TABLA DE ÍTEMS ----
    const tableBody = (items || []).map(it => [
        it.name,
        String(it.quantity),
        window.formatCurrency(it.unitPrice),
        window.formatCurrency(it.quantity * it.unitPrice)
    ]);
    tableBody.push([
        'Mano de Obra y Servicios Tecnicos Electricos', '1',
        window.formatCurrency(project.laborCost),
        window.formatCurrency(project.laborCost)
    ]);

    doc.autoTable({
        startY     : 70,
        head       : [['Descripcion', 'Cantidad', 'Precio Unit.', 'Total']],
        body       : tableBody,
        headStyles : { fillColor: COLOR_MID, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles : { fontSize: 9, textColor: COLOR_TEXT },
        alternateRowStyles: { fillColor: [248,253,253] },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 22 },
            2: { halign: 'right',  cellWidth: 38 },
            3: { halign: 'right',  cellWidth: 38 }
        },
        margin : { left: 14, right: 14 },
        styles : { lineColor: COLOR_PALE, lineWidth: 0.3 }
    });

    // ---- CAJA DE TOTALES ----
    const finalY = doc.lastAutoTable.finalY + 6;
    const boxX   = pageW - 14 - 82;
    const boxW   = 82;
    // Badge de tipo de documento (lado derecho)
    doc.setFillColor(...COLOR_MID);
    doc.roundedRect(boxX, finalY, boxW, 52, 4, 4, 'F');
    doc.setDrawColor(...COLOR_MID);
    doc.roundedRect(boxX, finalY, boxW, 52, 4, 4, 'S');

    const row = (label, value, y, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(bold ? 11 : 9);
        doc.setTextColor(...(bold ? COLOR_DARK : COLOR_GRAY));
        doc.text(label, boxX + 4, y);
        doc.text(value, boxX + boxW - 4, y, { align: 'right' });
    };

    row('Subtotal Neto:',  window.formatCurrency(project.subtotal), finalY + 10);
    const taxLabel2 = taxType === 'boleta' ? `Boleta (${taxRate}%):` : `IVA Factura (${taxRate}%):`;
    row(taxLabel2, window.formatCurrency(project.iva), finalY + 20);

    doc.setDrawColor(...COLOR_MID);
    doc.setLineWidth(0.4);
    doc.line(boxX + 4, finalY + 26, boxX + boxW - 4, finalY + 26);
    row('TOTAL A COBRAR:', window.formatCurrency(project.total), finalY + 40, true);

    // ---- NOTAS ----
    const notesY = finalY + 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_DARK);
    doc.text('FORMAS DE PAGO', 14, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_GRAY);
    doc.setFontSize(8.5);
    doc.text([
        '- Transferencia bancaria  /  Cheque  /  Efectivo',
        '- Se acepta pago en cuotas (abonos) previo acuerdo.',
        `- Documento: ${taxType === 'boleta' ? 'Boleta Electronica' : 'Factura Electronica'} - Valido por 15 dias.`
    ], 14, notesY + 6);

    // ---- PIE DE PÁGINA ----
    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, footerY - 4, pageW, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento generado por VoltManage PWA - Gestion de Servicios Electricos Chile', 105, footerY + 4, { align: 'center' });

    return { doc, project };
}

// ---- generatePDF: obtiene de la BD y luego genera ----
window.generatePDF = async (projectId) => {
    try {
        const project = await dbAPI.getProject(projectId);
        const items   = await dbAPI.getBudgetItems(projectId);
        const { doc } = await buildPDF(project, items);
        const safeClient = (project.clientName || 'Proyecto').replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
        doc.save(`Presupuesto_${safeClient}_N${String(project.id).padStart(5, '0')}.pdf`);
    } catch (err) {
        console.error('Error PDF:', err);
        alert('Error al generar el PDF: ' + err.message);
    }
};

// ---- generatePDFDirect: vista previa sin guardar en la BD ----
window.generatePDFDirect = async (projectData, items) => {
    try {
        const { doc } = await buildPDF(projectData, items);
        const safeClient = (projectData.clientName || 'Preview').replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
        doc.save(`Preview_${safeClient}.pdf`);
    } catch (err) {
        console.error('Error PDF preview:', err);
        alert('Error al generar PDF: ' + err.message);
    }
};
