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
  // Wait for all custom Google fonts to load completely first
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Find all resume page elements
  const pages = document.querySelectorAll('.pdf-page');
  
  if (pages.length === 0) {
    console.error('No resume pages (.pdf-page) found');
    throw new Error('No resume pages found');
  }

  // Create temporary offscreen container to render the pages unscaled
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '816px'; // Standard letter width at 96 DPI
  tempContainer.style.transform = 'none';
  document.body.appendChild(tempContainer);

  // Create jsPDF instance (letter size, portrait)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });

  try {
    console.log('Starting high-quality PDF generation page by page...');
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      
      // Clone the page element so we can render it unscaled and without transforms
      const clonedPage = page.cloneNode(true) as HTMLElement;
      
      // Reset layout and styles that might conflict or scale
      clonedPage.style.transform = 'none';
      clonedPage.style.transformOrigin = 'top left';
      clonedPage.style.margin = '0';
      clonedPage.style.border = 'none';
      clonedPage.style.boxShadow = 'none';
      clonedPage.style.width = '8.5in'; // Force letter dimensions
      clonedPage.style.height = '11in';
      clonedPage.style.minHeight = '11in';
      clonedPage.style.maxHeight = '11in';
      clonedPage.style.boxSizing = 'border-box';
      
      tempContainer.appendChild(clonedPage);
      
      // Wait a frame to ensure the DOM layout is applied
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Render cloned page element to canvas with high resolution scale
      const canvas = await html2canvas(clonedPage, {
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
      
      // Clean up the clone
      tempContainer.removeChild(clonedPage);
    }

    // Dynamic filename based on user's name
    const filename = `${data.personalInfo.firstName || 'Resume'}_${data.personalInfo.lastName || 'Data'}_Resume.pdf`;
    pdf.save(filename);
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Clean up temporary container
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};
