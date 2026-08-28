
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormData, COMPLIANCE_ITEMS } from '../types';
import { COMPANY_NAME, DCC_LOGO_BASE64 } from '../constants';

/**
 * Safely generates a PDF report matching the Web Form theme and layout.
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

    const primaryText: [number, number, number] = [15, 23, 42]; // slate-900
    const secondaryText: [number, number, number] = [71, 85, 105]; // slate-600
    const skyAccent: [number, number, number] = [2, 132, 199]; // sky-600
    const lightHeaderBg: [number, number, number] = [241, 245, 249]; // slate-100

    const addSectionTitle = (text: string, y: number) => {
      const safeY = isNaN(y) ? 20 : y;
      doc.setFontSize(9.5);
      doc.setTextColor(primaryText[0], primaryText[1], primaryText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(String(text).toUpperCase(), 15, safeY);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, safeY + 2, 195, safeY + 2);
      return safeY + 8;
    };

    const getNextY = (currentY: number) => {
      const lastTable = (doc as any).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : currentY;
      return isNaN(finalY) ? currentY + 8 : finalY + 8;
    };

    // Header Branding - Light theme matching web form
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 10, 180, 26, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, 10, 180, 26, 'S');

    try {
      if (DCC_LOGO_BASE64) {
        doc.addImage(DCC_LOGO_BASE64, 'PNG', 19, 13, 20, 20);
      }
    } catch (imgErr) {
      console.warn("PDF Logo addImage error:", imgErr);
    }

    doc.setFontSize(15);
    doc.setTextColor(primaryText[0], primaryText[1], primaryText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, 110, 19, { align: 'center' });

    // Sky blue divider line under title
    doc.setDrawColor(skyAccent[0], skyAccent[1], skyAccent[2]);
    doc.setLineWidth(0.6);
    doc.line(95, 22, 125, 22);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.text("CREDIT ASSESSMENT & RISK EVALUATION SYSTEM", 110, 27, { align: 'center' });

    doc.setLineWidth(0.2); // reset line width
    let currentY = 42;

    // FORM SUBMISSION PERSONA
    const filledByText = data.filledBy === 'Sales Manager' 
      ? `Sales Manager on behalf of Customer (${data.salesManagerName || 'N/A'})`
      : 'Direct Customer';

    currentY = addSectionTitle("FORM SUBMISSION PERSONA", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Form Filled By', filledByText, 'Submission Date', String(data.fillingDate || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 38 }, 
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 35 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 1: BUSINESS PROFILE
    currentY = addSectionTitle("SECTION 1: BUSINESS PROFILE", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Customer Code', String(data.customerCode || 'N/A (Optional)'), 'Customer Name / Company', String(data.companyName || 'N/A')],
        ['Owner Name', String(data.ownerName || 'N/A'), 'Year Established', String(data.yearEstablished || 'N/A')],
        ['Firm Type / Legal Status', String(data.legalStatus || 'N/A'), 'Nature of Business', String(data.natureOfBusiness || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 42 }, 
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 42 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 2: CONTACTS
    currentY = addSectionTitle("SECTION 2: CONTACTS", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Registered Address', String(data.registeredAddress || 'N/A'), 'Home Address', String(data.homeAddress || 'N/A')],
        ['Office Phone', String(data.officePhone || 'N/A'), 'Owner Mobile', String(data.ownerNumber || 'N/A')],
        ['Email Address', String(data.email || 'N/A'), 'Contact Person', String(data.contactPerson || 'N/A')],
        ['Key Contact Mobile', String(data.contactPersonMobile || 'N/A'), '', '']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 38 }, 
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 38 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 3: BUSINESS REFERENCES
    currentY = addSectionTitle("SECTION 3: BUSINESS REFERENCES", currentY);
    autoTable(doc, {
      startY: currentY,
      head: [['Vendor Name', 'Contact / Phone Number']],
      body: data.references.map((r, idx) => [
        String(r.vendorName || `Reference ${idx + 1}`),
        String(r.phoneNumber || '-')
      ]),
      theme: 'grid',
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5 },
      headStyles: { fillColor: skyAccent, textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // Page break check if needed before Section 4 & 5
    if (currentY > 210) { doc.addPage(); currentY = 18; }

    // SECTION 4: FINANCIAL DETAILS
    currentY = addSectionTitle("SECTION 4: FINANCIAL DETAILS", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Last Year Turnover (₹)', String(data.lastYearTurnover || '0'), 'Current Year Turnover (₹)', String(data.currentYearTurnover || '0')],
        ['Primary Bank Name', String(data.bankName || 'N/A'), 'Account Number', String(data.accountNumber || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 42 }, 
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 42 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 5: COMPLIANCE CHECKLIST & DOCUMENT ATTACHMENTS
    if (currentY > 210) { doc.addPage(); currentY = 18; }
    currentY = addSectionTitle("SECTION 5: COMPLIANCE CHECKLIST & DOCUMENT ATTACHMENTS", currentY);
    const complianceData = COMPLIANCE_ITEMS.map(item => {
      const isChecked = data.compliance && data.compliance[item];
      const attached = data.attachedFiles ? data.attachedFiles.find(f => f.complianceItem === item) : undefined;
      const statusText = isChecked ? 'YES ✔' : 'NO';
      const fileText = attached ? `${attached.name} (${(attached.size / 1024).toFixed(1)} KB)` : 'No attachment';
      return [String(item), statusText, fileText];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Compliance Item', 'Verified', 'Attached Document']],
      body: complianceData,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.2, font: 'helvetica' },
      headStyles: { fillColor: skyAccent, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
        2: { fontStyle: 'italic', textColor: [51, 65, 85] }
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 6: FIELD VISIT
    if (currentY > 220) { doc.addPage(); currentY = 18; }
    currentY = addSectionTitle("SECTION 6: FIELD VISIT", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Site Visit Summary', String(data.fieldVisitSummary || 'No summary provided.')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 38 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 7: EXPECTED CREDIT LIMIT & PAYMENT TERM
    if (currentY > 220) { doc.addPage(); currentY = 18; }
    currentY = addSectionTitle("SECTION 7: EXPECTED CREDIT LIMIT & PAYMENT TERM", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Expected Credit Limit', String(data.expectedCreditLimit || 'N/A'), 'New Increase Credit Limit', String(data.newIncreaseCreditLimit || 'N/A')],
        ['Proposed Payment Terms', String(data.proposedPaymentTerms || 'N/A'), '', '']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 45 }, 
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 45 } 
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 8: AUTHORIZATION & SANCTION AUTHORITIES
    if (currentY > 210) { doc.addPage(); currentY = 18; }
    currentY = addSectionTitle("SECTION 8: AUTHORIZATION & SANCTION AUTHORITIES", currentY);
    
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
      headStyles: { fillColor: skyAccent, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightHeaderBg }
      },
      margin: { left: 15, right: 15 }
    });
    currentY = getNextY(currentY);

    // SECTION 9: FILLING AUTHORITY
    if (currentY > 220) { doc.addPage(); currentY = 18; }
    currentY = addSectionTitle("SECTION 9: FILLING AUTHORITY", currentY);
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Prepared By Name', String(data.fillingAuthorityName || 'N/A'), 'Filing Date', String(data.fillingDate || 'N/A')]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, font: 'helvetica' },
      columnStyles: { 
        0: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 38 },
        2: { fontStyle: 'bold', fillColor: lightHeaderBg, cellWidth: 35 }
      },
      margin: { left: 15, right: 15 }
    });

    // Page Number Footers
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.text(`System Reference: CARES-${Date.now().toString().slice(-6)}`, 15, pageHeight - 8);
      doc.text(`DCC INFOTECH INTERNAL CONFIDENTIAL`, 105, pageHeight - 8, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 195, pageHeight - 8, { align: 'right' });
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
