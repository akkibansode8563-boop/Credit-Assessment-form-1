
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormData } from '../types';

/**
 * Generates a 100% pixel-perfect PDF report by capturing each Web Form section card individually.
 * Prevents page break slicing across cards and eliminates text overlap.
 * 
 * @param data The form data to export
 * @param download Whether to trigger a browser download
 * @returns The base64 string of the PDF
 */
export const exportToPDF = async (
  data: FormData, 
  download: boolean = true
): Promise<string> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210; // A4 width mm
    const pdfHeight = 297; // A4 height mm
    const margin = 10; // 10mm margins left/right
    const printableWidth = pdfWidth - (margin * 2); // 190mm
    const maxY = pdfHeight - 12; // bottom threshold for page footer

    // Hide sticky action bar and system alert popups during canvas capture
    const nonPrintableElements = document.querySelectorAll('.no-pdf');
    nonPrintableElements.forEach(el => ((el as HTMLElement).style.display = 'none'));

    // 1. Capture Header Element
    const headerEl = document.querySelector('header');
    let currentY = 10;

    if (headerEl) {
      const headerCanvas = await html2canvas(headerEl as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.95);
      const headerHeightMm = (headerCanvas.height * printableWidth) / headerCanvas.width;
      
      pdf.addImage(headerImgData, 'JPEG', margin, currentY, printableWidth, headerHeightMm);
      currentY += headerHeightMm + 5;
    }

    // 2. Capture Each Section Card Individually with Smart Page Break Prevention
    const sections = Array.from(document.querySelectorAll('section'));

    for (let i = 0; i < sections.length; i++) {
      const sectionEl = sections[i] as HTMLElement;

      const canvas = await html2canvas(sectionEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const sectionHeightMm = (canvas.height * printableWidth) / canvas.width;

      // Smart Page Break: If card exceeds page height, start clean page
      if (currentY + sectionHeightMm > maxY && currentY > 20) {
        pdf.addPage();
        currentY = 12; // Reset Y for new page
      }

      pdf.addImage(imgData, 'JPEG', margin, currentY, printableWidth, sectionHeightMm);
      currentY += sectionHeightMm + 5; // Spacing between section cards
    }

    // Restore non-printable elements
    nonPrintableElements.forEach(el => ((el as HTMLElement).style.display = ''));

    // 3. System Page Footers
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      pdf.setPage(p);
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`System Reference: CARES-${Date.now().toString().slice(-6)}`, margin, pdfHeight - 6);
      pdf.text(`DCC INFOTECH INTERNAL CONFIDENTIAL`, 105, pdfHeight - 6, { align: 'center' });
      pdf.text(`Page ${p} of ${pageCount}`, pdfWidth - margin, pdfHeight - 6, { align: 'right' });
    }

    const fileName = `CARES_${data.customerCode || 'Report'}_${Date.now().toString().slice(-4)}.pdf`;

    if (download) {
      pdf.save(fileName);
    }

    return pdf.output('datauristring').split(',')[1];
  } catch (error) {
    console.error("Smart Section PDF Export failed:", error);
    throw error;
  }
};
