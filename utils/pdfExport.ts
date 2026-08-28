
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
    const accentColor: [number, number, number] = [2, 132, 199];
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

    // Header Branding - DCC Infotech
    doc.setFillColor(15, 23, 42);
    doc.rect(15, 12, 180, 22, 'F');

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, 22, 22);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 189, 248);
    doc.text("DATA CARE CORPORATION GROUP", 22, 27);

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("CREDIT ASSESSMENT REPORT", 188, 22, { align: 'right' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text("INTERNAL EVALUATION & RISK CONTROL", 188, 27, { align: 'right' });
    
    let currentY = 42;

    // Persona / Submission Source Table
    const filledByText = data.filledBy === 'Sales Manager' 
      ? `Sales Manager on behalf of Customer (${data.salesManagerName || 'N/A'} - ${data.salesManagerContact || 'N/A'})`
      : 'Direct Customer';

    currentY = addSectionTitle("Form Filling Persona & Submission Details", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Form Filled By', filledByText, 'Submission Date', String(data.fillingDate || 'N/A')],
        ['Prepared By Name', String(data.fillingAuthorityName || 'N/A'), 'Customer Code', String(data.customerCode || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 38 }, 
        2: { fontStyle: 'bold', fillColor: lightBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

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

    // Document Uploads Section
    if (currentY > 220) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Uploaded Document Attachments", currentY);
    const attachedRows = (data.attachedFiles && data.attachedFiles.length > 0)
      ? data.attachedFiles.map(f => [String(f.name), String(f.type || 'File'), `${(f.size / 1024).toFixed(1)} KB`])
      : [['No separate document files uploaded.', '-', '-']];
      
    autoTable(doc, {
      startY: currentY,
      head: [['File Name', 'Format / Type', 'Size']],
      body: attachedRows,
      theme: 'striped',
      styles: { fontSize: 7.5, font: 'helvetica' },
      headStyles: { fillColor: accentColor, textColor: [255, 255, 255] as [number, number, number] },
      margin: { left: 15, right: 15 }
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

    if (currentY > 210) { doc.addPage(); currentY = 20; }
    currentY = addSectionTitle("Authorization & Sanction Authorities", currentY);
    
    const sanctionsData = Object.values(data.sanctions).map(s => [
      String(s.designation || 'Authority'),
      String(s.name || 'Pending Review'),
      String(s.date || '-')
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Role / Authority Designation', 'Authority Name', 'Sanction Date']],
      body: sanctionsData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] as [number, number, number] },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightBg }
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.text(`System Reference: CARES-${Date.now().toString().slice(-6)}`, 15, pageHeight - 10);
      doc.text(`DCC INFOTECH INTERNAL CONFIDENTIAL`, 105, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 195, pageHeight - 10, { align: 'right' });
    }

    const fileName = `CARES_${data.customerCode || 'Report'}_${Date.now().toString().slice(-4)}.pdf`;
    
    if (download) {
      doc.save(fileName);
    }
    
    return doc.output('datauristring').split(',')[1];
  } catch (error) {
    console.error("PDF Export failed with error:", error);
    throw error;
  }
};
