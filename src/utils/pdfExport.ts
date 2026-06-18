
import html2pdf from 'html2pdf.js';
import { ResumeData } from '../types/resume';

/**
 * PDF Export Utility
 * 
 * Exports the resume preview to a PDF file using html2pdf.js library.
 * Configured for optimal print quality and professional formatting.
 * 
 * Features:
 * - High-quality PDF generation (2x scale)
 * - Letter size format with proper margins
 * - CORS support for external images
 * - Automatic filename generation based on user name
 * - Compression for smaller file sizes
 * 
 * @param data - Complete resume data for filename generation
 * @throws Error if resume preview element is not found or PDF generation fails
 */
export const exportToPDF = async (data: ResumeData) => {
  // Find the resume preview element in the DOM
  const element = document.querySelector('.resume-preview') as HTMLElement;
  
  if (!element) {
    console.error('Resume preview element not found');
    throw new Error('Resume preview element not found');
  }

  const opt = {
    // Page margins are handled by the .pdf-page card padding directly
    margin: 0,
    
    // Dynamic filename based on user's name
    filename: `${data.personalInfo.firstName || 'Resume'}_${data.personalInfo.lastName || 'Data'}_Resume.pdf`,
    
    // Image quality settings
    image: { 
      type: 'jpeg', 
      quality: 0.98 // High quality images
    },
    
    // HTML to Canvas conversion settings
    html2canvas: { 
      scale: 2, // 2x scaling for crisp text
      useCORS: true, // Enable CORS for external images
      letterRendering: true, // Better text rendering
      allowTaint: true, // Allow cross-origin images
      backgroundColor: '#ffffff' // Ensure white background
    },
    
    // PDF document settings
    jsPDF: { 
      unit: 'in', // Use inches for measurements
      format: 'letter', // Standard US letter size (8.5" x 11")
      orientation: 'portrait', // Vertical orientation
      compress: true // Enable PDF compression
    },
    
    // Break page cleanly at each pdf-page sheet element
    pagebreak: { mode: ['before', 'avoid-all'], selector: '.pdf-page' }
  };

  const oldTransform = element.style.transform;
  const oldWidth = element.style.width;

  // Append a temporary style tag to format elements for printing
  const printStyle = document.createElement('style');
  printStyle.id = 'pdf-print-temp-style';
  printStyle.innerHTML = `
    .resume-preview {
      gap: 0px !important;
    }
    .pdf-page {
      border: none !important;
      box-shadow: none !important;
      margin: 0 auto !important;
      height: 10.95in !important;
      min-height: 10.95in !important;
      max-height: 10.95in !important;
    }
  `;

  try {
    console.log('Starting PDF generation...');
    document.head.appendChild(printStyle);
    
    // Temporarily reset scaling styles for 100% full scale capture
    element.style.transform = 'none';
    element.style.width = '816px';
    
    // Generate and save the PDF
    await html2pdf().set(opt).from(element).save();
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error; // Re-throw for caller to handle
  } finally {
    // Clean up temporary styles
    const styleTag = document.getElementById('pdf-print-temp-style');
    if (styleTag) {
      styleTag.remove();
    }
    
    // Restore scaling
    element.style.transform = oldTransform;
    element.style.width = oldWidth;
  }
};
