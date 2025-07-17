
import React, { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';
import { ResumeData } from '../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  fontSize?: number;
  pageCount?: number;
}

/**
 * Resume Preview Component
 * 
 * Renders a professional-looking resume preview that can be exported to PDF.
 * Features:
 * - Responsive design with configurable font sizes
 * - Multi-page layout support with visual page breaks
 * - Clickable links for projects and social profiles
 * - Professional typography and spacing
 * - Print-optimized styling
 * 
 * @param data - Complete resume data object
 * @param fontSize - Base font size for scaling (default: 12px)
 * @param pageCount - Number of pages for layout calculation (default: 1)
 */
export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, fontSize = 12, pageCount = 1 }, ref) => {
    
    /**
     * Format date string to readable format (MMM YYYY)
     * @param dateString - ISO date string
     * @returns Formatted date string
     */
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    };

    /**
     * Format date range with support for current positions
     * @param startDate - Start date string
     * @param endDate - End date string
     * @param current - Whether position is current
     * @returns Formatted date range string
     */
    const formatDateRange = (startDate: string, endDate: string, current: boolean = false) => {
      const start = formatDate(startDate);
      if (current) {
        return `${start} - Present`;
      }
      if (!endDate) {
        return start || '';
      }
      const end = formatDate(endDate);
      return `${start} - ${end}`;
    };

    /**
     * Render formatted content with bullet point support
     * Converts plain text with bullet characters to proper HTML lists
     * @param content - Raw text content
     * @returns Array of JSX elements
     */
    const renderFormattedContent = (content: string) => {
      return content.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return <li key={index} className="ml-3">{trimmedLine.substring(1).trim()}</li>;
        }
        return trimmedLine ? <p key={index} className="mb-1">{trimmedLine}</p> : null;
      }).filter(Boolean);
    };

    // Calculate dynamic styles based on font size for responsive typography
    const dynamicStyles = {
      fontSize: `${fontSize}px`,
      lineHeight: fontSize <= 10 ? '1.1' : fontSize <= 14 ? '1.3' : '1.4'
    };

    // Scale header fonts relative to base font size
    const headerFontSize = Math.max(fontSize + 8, 18);
    const sectionHeaderFontSize = Math.max(fontSize + 2, 14);

    // Calculate page dimensions for multi-page layout
    const pageHeight = pageCount > 1 ? `${1056 * pageCount}px` : 'auto';
    const minHeight = pageCount > 1 ? `${1056 * pageCount}px` : 'auto';

    /**
     * Generate visual page break indicators for multi-page resumes
     * Creates dashed lines to show where pages break
     */
    const renderPageBreaks = () => {
      if (pageCount <= 1) return null;
      
      const pageBreaks = [];
      for (let i = 1; i < pageCount; i++) {
        pageBreaks.push(
          <div
            key={i}
            className="absolute border-t-2 border-gray-400 border-dashed w-full pointer-events-none"
            style={{
              top: `${i * 1056 - 48}px`, // Account for card padding
              left: 24,
              right: 24,
              zIndex: 5
            }}
          />
        );
      }
      return pageBreaks;
    };

    return (
      <Card 
        className="p-6 max-w-4xl mx-auto bg-white text-black resume-preview border-2 border-gray-300 relative overflow-hidden" 
        ref={ref} 
        style={{
          ...dynamicStyles,
          height: pageHeight,
          minHeight: minHeight,
          pageBreakInside: pageCount > 1 ? 'auto' : 'avoid'
        }}
      >
        {/* Page break visual indicators */}
        {renderPageBreaks()}
        
        <div className="space-y-3 relative z-10">
          
          {/* Header Section - Name and Contact Information */}
          <header className="text-center border-b border-gray-300 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                {/* Candidate Name - Prominently displayed */}
                <h1 
                  className="font-bold text-gray-900 mb-4"
                  style={{ fontSize: `${headerFontSize}px` }}
                >
                  {data.personalInfo.firstName} {data.personalInfo.lastName}
                </h1>
                
                {/* Contact Information - Horizontally laid out */}
                <div className="flex flex-wrap justify-center gap-3 text-gray-600">
                  {data.personalInfo.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{data.personalInfo.email}</span>
                    </div>
                  )}
                  {data.personalInfo.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{data.personalInfo.phone}</span>
                    </div>
                  )}
                  {data.personalInfo.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{data.personalInfo.address}</span>
                    </div>
                  )}
                  {data.personalInfo.linkedin && (
                    <div className="flex items-center gap-1">
                      <Linkedin className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{data.personalInfo.linkedin}</span>
                    </div>
                  )}
                  {data.personalInfo.github && (
                    <div className="flex items-center gap-1">
                      <Github className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{data.personalInfo.github}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Picture - Optional, positioned to the right */}
              {data.profilePicture && (
                <div className="ml-3">
                  <img 
                    src={data.profilePicture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Professional Summary Section */}
          {data.summary && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-1 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-tight">{data.summary}</p>
            </section>
          )}

          {/* Education Section */}
          {data.education.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{edu.institution}</h3>
                        <p className="text-gray-700 text-xs">{edu.degree}</p>
                        <p className="text-gray-600 text-xs">{edu.fieldOfStudy}</p>
                      </div>
                      <div className="text-right text-gray-600 text-xs">
                        <p>{formatDateRange(edu.startDate, edu.endDate)}</p>
                        {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-gray-700 text-xs mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience Section */}
          {data.experience.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Work Experience
              </h2>
              <div className="space-y-2">
                {data.experience.map((exp) => (
                  <div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                        {/* Company name highlighted in bold */}
                        <p className="font-bold text-gray-900 text-xs">{exp.company}</p>
                      </div>
                      <div className="text-right text-gray-600 text-xs">
                        <p>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                        {exp.location && <p>{exp.location}</p>}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-gray-700 whitespace-pre-line text-xs leading-tight">
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {data.projects.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Projects
              </h2>
              <div className="space-y-2">
                {data.projects.map((project) => (
                  <div key={project.id} style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        {/* Project name with clickable links positioned close to the name */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm">{project.name}</h3>
                          <div className="flex gap-1">
                            {/* Live project link - clickable and opens in new tab */}
                            {project.link && (
                              <a 
                                href={project.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View live project"
                              >
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            )}
                            {/* GitHub repository link - clickable and opens in new tab */}
                            {project.github && (
                              <a 
                                href={project.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                title="View source code"
                              >
                                <Github className="h-3 w-3 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                        {/* Technologies used */}
                        {project.technologies.length > 0 && (
                          <p className="text-gray-600 italic text-xs">
                            {project.technologies.join(', ')}
                          </p>
                        )}
                      </div>
                      {/* Project timeline */}
                      <div className="text-right text-gray-600 text-xs">
                        <p>{formatDateRange(project.startDate, project.endDate)}</p>
                      </div>
                    </div>
                    {/* Project description */}
                    <p className="text-gray-700 text-xs">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section - Organized by categories */}
          {data.skills.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Skills
              </h2>
              <div className="space-y-1">
                {/* Iterate through predefined skill categories */}
                {['Technical Subjects', 'Programming Languages', 'Spoken Languages', 'Soft Skills', 'Frameworks', 'Dev Tools'].map((category) => {
                  const categorySkills = data.skills.filter(skill => skill.category === category);
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <div key={category} className="text-xs">
                      <span className="font-bold text-gray-900">{category}: </span>
                      <span className="text-gray-700">
                        {categorySkills.map(skill => skill.name).join(', ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Certifications and Awards Section */}
          {data.certifications.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Certifications and Awards
              </h2>
              <div className="space-y-1">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start text-xs" style={{ pageBreakInside: 'avoid' }}>
                    <div>
                      <h3 className="font-bold text-gray-900">{cert.name}</h3>
                      <p className="text-gray-700">{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className="text-gray-600">ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <div className="text-right text-gray-600">
                      <p>{formatDate(cert.date)}</p>
                      {cert.expiryDate && (
                        <p>Expires: {formatDate(cert.expiryDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests and Hobbies Section */}
          {data.interests.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                Interests & Hobbies
              </h2>
              <p className="text-gray-700 text-xs">
                {data.interests.map(interest => interest.name).join(', ')}
              </p>
            </section>
          )}

          {/* Custom Sections - User-defined sections */}
          {data.customSections && data.customSections.map((section) => (
            <section key={section.id} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                style={{ fontSize: `${sectionHeaderFontSize}px` }}
              >
                {section.title}
              </h2>
              <div className="text-gray-700 text-xs">
                {/* Handle both list and paragraph content formats */}
                {section.content.includes('•') || section.content.includes('-') ? (
                  <ul className="space-y-1">
                    {renderFormattedContent(section.content)}
                  </ul>
                ) : (
                  <div>
                    {renderFormattedContent(section.content)}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </Card>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
