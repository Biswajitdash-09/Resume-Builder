import React, { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';
import { ResumeData, Education, Experience, Project, Skill, Certification, CustomSection } from '../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  fontSize?: number;
  pageCount?: number;
  onPageCountCalculated?: (pageCount: number) => void;
}

type ResumeBlock = 
  | { type: 'header' }
  | { type: 'summary' }
  | { type: 'skills' }
  | { type: 'interests' }
  | { type: 'education', item: Education }
  | { type: 'experience', item: Experience }
  | { type: 'project', item: Project }
  | { type: 'certification', item: Certification }
  | { type: 'customSection', item: CustomSection };

const estimateBlockHeight = (block: ResumeBlock, data: ResumeData, fontSize: number): number => {
  const scale = fontSize / 12;
  switch (block.type) {
    case 'header':
      return (data.profilePicture ? 145 : 115) * scale;
    case 'summary': {
      const text = data.summary || '';
      const charsPerLine = Math.floor(85 / scale);
      const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
      return (35 + lines * 15) * scale;
    }
    case 'skills': {
      let height = 35;
      const categories = ['Technical Subjects', 'Programming Languages', 'Spoken Languages', 'Soft Skills', 'Frameworks', 'Dev Tools'];
      categories.forEach(category => {
        const categorySkills = data.skills.filter(s => s.category === category);
        if (categorySkills.length > 0) {
          const text = `${category}: ${categorySkills.map(s => s.name).join(', ')}`;
          const charsPerLine = Math.floor(85 / scale);
          const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
          height += lines * 16 + 4;
        }
      });
      return height * scale;
    }
    case 'interests': {
      const text = data.interests.map(interest => interest.name).join(', ');
      const charsPerLine = Math.floor(85 / scale);
      const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
      return (35 + lines * 15) * scale;
    }
    case 'education': {
      const edu = block.item;
      let textHeight = 50;
      if (edu.description) {
        const lines = edu.description.split('\n');
        let linesCount = 0;
        const charsPerLine = Math.floor(80 / scale);
        lines.forEach(line => {
          linesCount += Math.max(1, Math.ceil(line.length / charsPerLine));
        });
        textHeight += linesCount * 14;
      }
      return textHeight * scale;
    }
    case 'experience': {
      const exp = block.item;
      let textHeight = 70;
      if (exp.description) {
        const lines = exp.description.split('\n');
        let linesCount = 0;
        const charsPerLine = Math.floor(80 / scale);
        lines.forEach(line => {
          linesCount += Math.max(1, Math.ceil(line.length / charsPerLine));
        });
        textHeight += linesCount * 14;
      }
      return textHeight * scale;
    }
    case 'project': {
      const proj = block.item;
      let textHeight = 60;
      const charsPerLine = Math.floor(80 / scale);
      if (proj.description) {
        const lines = proj.description.split('\n');
        let linesCount = 0;
        lines.forEach(line => {
          linesCount += Math.max(1, Math.ceil(line.length / charsPerLine));
        });
        textHeight += linesCount * 14;
      }
      if (proj.technologies && proj.technologies.length > 0) {
        const techLength = proj.technologies.join(', ').length;
        const techLines = Math.max(1, Math.ceil(techLength / charsPerLine));
        textHeight += techLines * 14;
      }
      return textHeight * scale;
    }
    case 'certification':
      return 55 * scale;
    case 'customSection': {
      const section = block.item;
      let textHeight = 45;
      if (section.content) {
        const lines = section.content.split('\n');
        let linesCount = 0;
        const charsPerLine = Math.floor(80 / scale);
        lines.forEach(line => {
          linesCount += Math.max(1, Math.ceil(line.length / charsPerLine));
        });
        textHeight += linesCount * 14;
      }
      return textHeight * scale;
    }
    default:
      return 50 * scale;
  }
};

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, fontSize = 12, pageCount = 1, onPageCountCalculated }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
      const checkScale = () => {
        if (containerRef.current) {
          const parentWidth = containerRef.current.getBoundingClientRect().width;
          const targetWidth = 816; // 8.5in at 96 DPI
          const padding = 32; // padding around page sheet
          const newScale = Math.min(1, (parentWidth - padding) / targetWidth);
          setScale(newScale);
        }
      };

      checkScale();
      window.addEventListener('resize', checkScale);
      
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        resizeObserver = new ResizeObserver(checkScale);
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        window.removeEventListener('resize', checkScale);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }, []);
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    };

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

    const renderFormattedContent = (content: string) => {
      if (!content) return [];
      return content.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return <li key={index} className="ml-3 list-disc">{trimmedLine.substring(1).trim()}</li>;
        }
        return trimmedLine ? <p key={index} className="mb-1">{trimmedLine}</p> : null;
      }).filter(Boolean);
    };

    // Style adjustments
    const dynamicStyles = {
      fontSize: `${fontSize}px`,
      lineHeight: fontSize <= 10 ? '1.1' : fontSize <= 14 ? '1.3' : '1.4'
    };

    const headerFontSize = Math.max(fontSize + 8, 18);
    const sectionHeaderFontSize = Math.max(fontSize + 2, 14);

    // 1. Gather all blocks to paginate
    const blocks: ResumeBlock[] = [];
    blocks.push({ type: 'header' });
    if (data.summary) blocks.push({ type: 'summary' });
    if (data.skills && data.skills.length > 0) blocks.push({ type: 'skills' });

    if (data.education) {
      data.education.forEach(item => blocks.push({ type: 'education', item }));
    }
    if (data.experience) {
      data.experience.forEach(item => blocks.push({ type: 'experience', item }));
    }
    if (data.projects) {
      data.projects.forEach(item => blocks.push({ type: 'project', item }));
    }
    if (data.certifications) {
      data.certifications.forEach(item => blocks.push({ type: 'certification', item }));
    }
    if (data.interests && data.interests.length > 0) {
      blocks.push({ type: 'interests' });
    }
    if (data.customSections) {
      data.customSections.forEach(item => blocks.push({ type: 'customSection', item }));
    }

    // 2. Distribute blocks across pages dynamically
    const pages: ResumeBlock[][] = [];
    let currentPageBlocks: ResumeBlock[] = [];
    let currentPageHeight = 0;
    const pageHeightLimit = 900; // Limit content within page boundaries (Letter is 1056px height)

    for (const block of blocks) {
      const height = estimateBlockHeight(block, data, fontSize);
      if (currentPageHeight + height > pageHeightLimit && currentPageBlocks.length > 0) {
        pages.push(currentPageBlocks);
        currentPageBlocks = [];
        currentPageHeight = 0;
      }
      currentPageBlocks.push(block);
      currentPageHeight += height;
    }
    if (currentPageBlocks.length > 0) {
      pages.push(currentPageBlocks);
    }
    if (pages.length === 0) {
      pages.push([]);
    }

    const actualPageCount = pages.length;

    React.useEffect(() => {
      onPageCountCalculated?.(actualPageCount);
    }, [actualPageCount, onPageCountCalculated]);

    const isFirstOfTypeOnPage = (index: number, type: string, pageBlocks: ResumeBlock[]) => {
      for (let k = 0; k < index; k++) {
        if (pageBlocks[k].type === type) {
          return false;
        }
      }
      return true;
    };

    const renderBlock = (block: ResumeBlock, index: number, pageBlocks: ResumeBlock[]) => {
      const showHeader = isFirstOfTypeOnPage(index, block.type, pageBlocks);
      
      switch (block.type) {
        case 'header':
          return (
            <header key="header" className="text-center border-b border-gray-300 pb-3 mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 
                    className="font-bold text-gray-900 mb-2"
                    style={{ fontSize: `${headerFontSize}px` }}
                  >
                    {data.personalInfo.firstName} {data.personalInfo.lastName}
                  </h1>
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
                {data.profilePicture && (
                  <div className="ml-3 flex-shrink-0">
                    <img 
                      src={data.profilePicture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </header>
          );
          
        case 'summary':
          return (
            <section key="summary" className="mb-3">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-1 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Professional Summary
                </h2>
              )}
              <p className="text-gray-700 leading-tight">{data.summary}</p>
            </section>
          );
          
        case 'education': {
          const edu = block.item;
          return (
            <section key={`edu-${edu.id}`} className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Education
                </h2>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{edu.institution}</h3>
                  <p className="text-gray-700 text-xs">{edu.degree}</p>
                  <p className="text-gray-600 text-xs">{edu.fieldOfStudy}</p>
                </div>
                <div className="text-right text-gray-600 text-xs flex-shrink-0">
                  <p>{formatDateRange(edu.startDate, edu.endDate)}</p>
                  {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
                </div>
              </div>
              {edu.description && (
                <p className="text-gray-700 text-xs mt-1">{edu.description}</p>
              )}
            </section>
          );
        }
        
        case 'experience': {
          const exp = block.item;
          return (
            <section key={`exp-${exp.id}`} className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Work Experience
                </h2>
              )}
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                    <div className="flex gap-1">
                      {exp.link && (
                        <a 
                          href={exp.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View company/project link"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      )}
                      {exp.github && (
                        <a 
                          href={exp.github} 
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
                  <p className="font-bold text-gray-900 text-xs">{exp.company}</p>
                </div>
                <div className="text-right text-gray-600 text-xs flex-shrink-0">
                  <p>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                  {exp.location && <p>{exp.location}</p>}
                </div>
              </div>
              {exp.description && (
                <div className="text-gray-700 whitespace-pre-line text-xs leading-tight">
                  {exp.description}
                </div>
              )}
            </section>
          );
        }
        
        case 'project': {
          const project = block.item;
          return (
            <section key={`proj-${project.id}`} className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Projects
                </h2>
              )}
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{project.name}</h3>
                    <div className="flex gap-1">
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
                  {project.technologies.length > 0 && (
                    <p className="text-gray-600 italic text-xs">
                      {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right text-gray-600 text-xs flex-shrink-0">
                  <p>{formatDateRange(project.startDate, project.endDate)}</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs">{project.description}</p>
            </section>
          );
        }
        
        case 'skills':
          return (
            <section key="skills" className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Skills
                </h2>
              )}
              <div className="space-y-1">
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
          );
          
        case 'certification': {
          const cert = block.item;
          return (
            <section key={`cert-${cert.id}`} className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Certifications and Awards
                </h2>
              )}
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h3 className="font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-700">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-gray-600">ID: {cert.credentialId}</p>
                  )}
                </div>
                <div className="text-right text-gray-600 flex-shrink-0">
                  <p>{formatDate(cert.date)}</p>
                  {cert.expiryDate && (
                    <p>Expires: {formatDate(cert.expiryDate)}</p>
                  )}
                </div>
              </div>
            </section>
          );
        }
        
        case 'interests':
          return (
            <section key="interests" className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  Interests & Hobbies
                </h2>
              )}
              <p className="text-gray-700 text-xs">
                {data.interests.map(interest => interest.name).join(', ')}
              </p>
            </section>
          );
          
        case 'customSection': {
          const section = block.item;
          return (
            <section key={`custom-${section.id}`} className="mb-2">
              {showHeader && (
                <h2 
                  className="font-bold text-gray-900 mb-2 border-b border-gray-200 uppercase"
                  style={{ fontSize: `${sectionHeaderFontSize}px` }}
                >
                  {section.title}
                </h2>
              )}
              <div className="text-gray-700 text-xs">
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
          );
        }
        default:
          return null;
      }
    };

    return (
      <div 
        ref={containerRef}
        className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-xl border preview-scroll-container overflow-y-auto w-full overflow-x-hidden block"
      >
        <div
          style={{
            width: '100%',
            height: `${(1056 * actualPageCount + (actualPageCount - 1) * 24) * scale}px`,
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <div 
            className="resume-preview flex flex-col gap-6 bg-transparent origin-top" 
            ref={ref}
            style={{
              transform: `scale(${scale})`,
              width: '816px' // 8.5in at 96 DPI
            }}
          >
            {pages.map((pageBlocks, index) => (
              <Card 
                key={index}
                className="p-8 mx-auto bg-white text-black relative shadow-lg border border-gray-300 pdf-page overflow-hidden flex flex-col justify-start" 
                style={{
                  ...dynamicStyles,
                  width: '8.5in',
                  height: '11in',
                  minHeight: '11in',
                  maxHeight: '11in',
                  boxSizing: 'border-box'
                }}
              >
                <div className="space-y-3 relative z-10 w-full flex-1">
                  {pageBlocks.map((block, bIdx) => renderBlock(block, bIdx, pageBlocks))}
                </div>
                
                {/* Optional page number footer for display */}
                <div className="absolute bottom-4 right-8 text-[10px] text-gray-400 select-none print:hidden">
                  Page {index + 1} of {actualPageCount}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = 'ResumePreview';
