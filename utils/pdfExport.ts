
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormData, COMPLIANCE_ITEMS } from '../types';
import { COMPANY_NAME } from '../constants';

/**
 * Safely generates a PDF report.
 * @param data The form data to export
 * @param download Whether to trigger a browser download
 * @returns The base64 string of the PDF
 */
export const exportToPDF = async (data: FormData, download: boolean = true): Promise<string> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor: [number, number, number] = [15, 23, 42]; 
    const lightBg: [number, number, number] = [248, 250, 252];

    const addSectionTitle = (text: string, y: number) => {
      const safeY = isNaN(y) ? 20 : y;
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(String(text).toUpperCase(), 15, safeY);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, safeY + 2, 195, safeY + 2);
      return safeY + 8;
    };

    const getNextY = (currentY: number) => {
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : currentY;
      return isNaN(finalY) ? currentY + 10 : finalY + 10;
    };

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, 15, 20);
    
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.line(15, 22, 15 + (doc.getTextWidth(COMPANY_NAME)), 22);

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text("CREDIT ASSESSMENT REPORT", 195, 20, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("INTERNAL EVALUATION SYSTEM", 195, 25, { align: 'right' });
    
    let currentY = 40;

    currentY = addSectionTitle("Business Profile & Contact Details", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Customer Code', String(data.customerCode || 'N/A'), 'Customer Name', String(data.companyName || 'N/A')],
        ['Owner Name', String(data.ownerName || 'N/A'), 'Year Established', String(data.yearEstablished || 'N/A')],
        ['Firm Type', String(data.legalStatus || 'N/A'), 'Nature of Business', String(data.natureOfBusiness || 'N/A')],
        ['Regd. Address', String(data.registeredAddress || 'N/A'), 'Home Address', String(data.homeAddress || 'N/A')],
        ['Contact Person', String(data.contactPerson || 'N/A'), 'Mobile Number', String(data.contactPersonMobile || 'N/A')],
        ['Email Address', String(data.email || 'N/A'), 'Office Phone', String(data.officePhone || 'N/A')],
        ['Owner Number', String(data.ownerNumber || 'N/A'), '', '']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 }, 
        2: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    currentY = addSectionTitle("Financial Details", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Last Year Turnover', String(data.lastYearTurnover || '0'), 'Current Year Turnover', String(data.currentYearTurnover || '0')],
        ['Primary Bank', String(data.bankName || 'N/A'), 'Account Number', String(data.accountNumber || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 }, 
        2: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    currentY = addSectionTitle("Business References", currentY);
    autoTable(doc, {
      startY: currentY,
      head: [['Vendor Name', 'Contact Number']],
      body: data.references.map(r => [String(r.vendorName || '-'), String(r.phoneNumber || '-')]),
      theme: 'striped',
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] as [number, number, number] },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    if (currentY > 210) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Compliance Checklist", currentY);
    const complianceData = COMPLIANCE_ITEMS.map(item => [String(item), data.compliance && data.compliance[item] ? 'YES' : 'NO']);
    autoTable(doc, {
      startY: currentY,
      body: complianceData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, font: 'helvetica' },
      columnStyles: { 
        1: { fontStyle: 'bold', halign: 'center', cellWidth: 25, textColor: [51, 65, 85] as [number, number, number] } 
      },
      margin: { left: 15, right: 15 },
      tableWidth: 120
    });
    currentY = getNextY(currentY);

    if (currentY > 220) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Field Visit Details", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Visit Summary', String(data.fieldVisitSummary || 'No summary provided.')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    if (currentY > 220) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Expected Credit limit & Payment Term", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Expected Credit Limit', String(data.expectedCreditLimit || 'N/A'), 'New Increase Credit Limit', String(data.newIncreaseCreditLimit || 'N/A')],
        ['Proposed Payment Terms', String(data.proposedPaymentTerms || 'N/A'), '', '']
      ],
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 45 }, 
        2: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 45 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    if (currentY > 240) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Submission Authority", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Prepared By', String(data.fillingAuthorityName || 'N/A'), 'Submission Date', String(data.fillingDate || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 }, 
        2: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    if (currentY > 210) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Authorization & Sanctions", currentY);
    
    const sanctions = data.sanctions;
    const sigWidth = 40;
    const sigLineOffset = 15;
    const marginX = 15;
    const spacingX = 45;

    Object.entries(sanctions).forEach(([key, sig], index) => {
      const x = marginX + (index % 4) * spacingX;
      const yBase = currentY + 5;
      
      doc.setDrawColor(148, 163, 184); 
      doc.setLineWidth(0.3);
      doc.line(x, yBase + sigLineOffset, x + sigWidth, yBase + sigLineOffset);

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139); 
      doc.setFont('helvetica', 'normal');
      doc.text(String(sig.designation || "Role"), x, yBase + sigLineOffset + 5);
      
      doc.setTextColor(30, 41, 59); 
      doc.setFont('helvetica', 'bold');
      doc.text(String(sig.name || "Pending Name"), x, yBase + sigLineOffset + 9);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(`Date: ${String(sig.date || "-")}`, x, yBase + sigLineOffset + 12);
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text(`System Reference: CARES-${Date.now().toString().slice(-6)}`, 15, pageHeight - 10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, pageHeight - 10, { align: 'center' });
    doc.text(`Page 1 of 1`, 195, pageHeight - 10, { align: 'right' });

    const fileName = `CARES_${data.customerCode || 'Report'}_${Date.now().toString().slice(-4)}.pdf`;
    
    if (download) {
      doc.save(fileName);
    }
    
    // Return base64 string for email/backend processing
    return doc.output('datauristring').split(',')[1];
  } catch (error) {
    console.error("PDF Export failed with error:", error);
    throw error;
  }
};
