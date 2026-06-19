
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResumeData } from '../types/resume';

/**
 * PDF Export Utility
 * 
 * Exports the resume preview to a PDF file by rendering each page element 
 * to an individual canvas and compiling them into a high-quality vector-like PDF.
 * This prevents half-cut text lines at page boundaries.
 * 
 * @param data - Complete resume data for filename generation
 * @throws Error if resume page elements are not found or PDF generation fails
 */
export const exportToPDF = async (data: ResumeData) => {
  // Find all resume page elements
  const pages = document.querySelectorAll('.pdf-page');
  
  if (pages.length === 0) {
    console.error('No resume pages (.pdf-page) found');
    throw new Error('No resume pages found');
  }

  // Create jsPDF instance (letter size, portrait)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  // Temporarily set printing styles
  const printStyle = document.createElement('style');
  printStyle.id = 'pdf-print-temp-style';
  printStyle.innerHTML = `
    .pdf-page {
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
  `;
  
  try {
    console.log('Starting high-quality PDF generation page by page...');
    document.head.appendChild(printStyle);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      
      // Render page element to canvas with high resolution scale
      const canvas = await html2canvas(page, {
        scale: 3, // Crisp 3x scaling
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      // Add page to PDF (skip for the first page since jsPDF creates page 1 by default)
      if (i > 0) {
        pdf.addPage('letter', 'portrait');
      }
      
      // Draw image to fill the exact letter page dimensions (8.5 x 11 inches)
      pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11, undefined, 'FAST');
    }

    // Dynamic filename based on user's name
    const filename = `${data.personalInfo.firstName || 'Resume'}_${data.personalInfo.lastName || 'Data'}_Resume.pdf`;
    pdf.save(filename);
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    const styleTag = document.getElementById('pdf-print-temp-style');
    if (styleTag) {
      styleTag.remove();
    }
  }
};
