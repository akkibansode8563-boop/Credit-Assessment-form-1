
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormData } from '../types';

/**
 * Generates a 100% pixel-perfect PDF report by capturing the actual Web Form DOM canvas.
 * @param data The form data to export
 * @param download Whether to trigger a browser download
 * @param elementId Optional DOM element ID to capture (defaults to 'form-capture-area')
 * @returns The base64 string of the PDF
 */
export const exportToPDF = async (
  data: FormData, 
  download: boolean = true, 
  elementId: string = 'form-capture-area'
): Promise<string> => {
  try {
    const captureElement = document.getElementById(elementId) || document.querySelector('main');
    if (!captureElement) {
      throw new Error("Form capture element not found");
    }

    // Hide sticky action bar and system alert popups during canvas capture
    const nonPrintableElements = document.querySelectorAll('.no-pdf');
    nonPrintableElements.forEach(el => ((el as HTMLElement).style.display = 'none'));

    // Capture DOM using html2canvas
    const canvas = await html2canvas(captureElement as HTMLElement, {
      scale: 2, // High DPI resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: 1200
    });

    // Restore non-printable elements
    nonPrintableElements.forEach(el => ((el as HTMLElement).style.display = ''));

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate height in mm
    const imgHeightInMm = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeightInMm;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
    heightLeft -= pdfHeight;

    // Subsequent pages if length exceeds 1 A4 page
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
      heightLeft -= pdfHeight;
    }

    const fileName = `CARES_${data.customerCode || 'Report'}_${Date.now().toString().slice(-4)}.pdf`;

    if (download) {
      pdf.save(fileName);
    }

    return pdf.output('datauristring').split(',')[1];
  } catch (error) {
    console.error("DOM HTML Canvas PDF Export failed:", error);
    throw error;
  }
};
