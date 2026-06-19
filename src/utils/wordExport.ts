import { ResumeData } from '../types/resume';

export const exportToWord = (data: ResumeData, sectionOrder?: string[]) => {
  const escapeHTML = (text: string) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if parsing fails!
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatDateRange = (startDate: string, endDate: string, current: boolean = false) => {
    const start = formatDate(startDate);
    if (current) return `${start} - Present`;
    if (!endDate) return start;
    return `${start} - ${formatDate(endDate)}`;
  };

  // Build clean contact info row, filtering out empty items first to prevent leading/dangling separators
  const contactParts = [
    data.personalInfo.email ? `<span>${escapeHTML(data.personalInfo.email)}</span>` : null,
    data.personalInfo.phone ? `<span>${escapeHTML(data.personalInfo.phone)}</span>` : null,
    data.personalInfo.address ? `<span>${escapeHTML(data.personalInfo.address)}</span>` : null,
    data.personalInfo.linkedin ? `<a href="${data.personalInfo.linkedin}">${escapeHTML(data.personalInfo.linkedin)}</a>` : null,
    data.personalInfo.github ? `<a href="${data.personalInfo.github}">${escapeHTML(data.personalInfo.github)}</a>` : null
  ].filter(Boolean);

  const contactInfoHTML = contactParts.join(' &nbsp;|&nbsp; ');

  // Compile styled HTML structures for each section
  const sectionsMap: Record<string, string> = {
    summary: data.summary ? `
      <h2>Professional Summary</h2>
      <p>${escapeHTML(data.summary)}</p>
    ` : '',
    
    skills: data.skills && data.skills.length > 0 ? `
      <h2>Skills</h2>
      ${['Technical Subjects', 'Programming Languages', 'Spoken Languages', 'Soft Skills', 'Frameworks', 'Dev Tools'].map(cat => {
        const catSkills = data.skills.filter(s => s.category === cat);
        if (catSkills.length === 0) return '';
        return `<p><span class="skill-category">${escapeHTML(cat)}:</span> ${catSkills.map(s => escapeHTML(s.name)).join(', ')}</p>`;
      }).join('')}
    ` : '',
    
    experience: data.experience && data.experience.length > 0 ? `
      <h2>Work Experience</h2>
      ${data.experience.map(exp => `
        <div style="margin-bottom: 10pt;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
            <tr>
              <td width="70%" valign="top" style="font-weight:bold; font-size:11pt; text-align:left;">${escapeHTML(exp.position)}</td>
              <td width="30%" valign="top" style="text-align:right; font-size:10pt; color:#666666;">${formatDateRange(exp.startDate, exp.endDate, exp.current)}</td>
            </tr>
            <tr>
              <td width="70%" valign="top" style="font-style:italic; font-size:10pt; color:#444444; padding-top:2pt;">${escapeHTML(exp.company)} ${exp.location ? ` - ${escapeHTML(exp.location)}` : ''}</td>
              <td width="30%" valign="top"></td>
            </tr>
          </table>
          ${exp.description ? `
          <ul style="margin-top: 4pt; margin-bottom: 0; font-size:10pt; color:#333333; padding-left: 18pt;">
            ${exp.description.split('\n').map(line => {
              const clean = line.replace(/^[-•*+]\s*/, '').trim();
              return clean ? `<li style="margin-bottom: 3pt;">${escapeHTML(clean)}</li>` : '';
            }).join('')}
          </ul>
          ` : ''}
        </div>
      `).join('')}
    ` : '',
    
    education: data.education && data.education.length > 0 ? `
      <h2>Education</h2>
      ${data.education.map(edu => `
        <div style="margin-bottom: 8pt;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
            <tr>
              <td width="70%" valign="top" style="font-weight:bold; font-size:11pt; text-align:left;">${escapeHTML(edu.institution)}</td>
              <td width="30%" valign="top" style="text-align:right; font-size:10pt; color:#666666;">${formatDateRange(edu.startDate, edu.endDate)}</td>
            </tr>
            <tr>
              <td width="70%" valign="top" style="font-size:10pt; color:#444444; padding-top:2pt;">${escapeHTML(edu.degree)} ${edu.fieldOfStudy ? ` in ${escapeHTML(edu.fieldOfStudy)}` : ''}</td>
              <td width="30%" valign="top" style="text-align:right; font-size:10pt; font-weight:bold; color:#333333;">${edu.cgpa ? `CGPA: ${escapeHTML(edu.cgpa)}` : ''}</td>
            </tr>
          </table>
          ${edu.description ? `<p style="font-size:10pt; margin-top:3pt; margin-bottom:0; color:#333333;">${escapeHTML(edu.description)}</p>` : ''}
        </div>
      `).join('')}
    ` : '',
    
    projects: data.projects && data.projects.length > 0 ? `
      <h2>Projects</h2>
      ${data.projects.map(proj => `
        <div style="margin-bottom: 8pt;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
            <tr>
              <td width="70%" valign="top" style="font-weight:bold; font-size:11pt; text-align:left;">${escapeHTML(proj.name)}</td>
              <td width="30%" valign="top" style="text-align:right; font-size:10pt; color:#666666;">${formatDateRange(proj.startDate, proj.endDate)}</td>
            </tr>
          </table>
          ${proj.technologies && proj.technologies.length > 0 ? `<p style="margin-top:2pt; margin-bottom:2pt; font-style:italic; color:#555555; font-size:10pt;">Technologies: ${proj.technologies.map(t => escapeHTML(t)).join(', ')}</p>` : ''}
          <p style="font-size:10pt; margin-top:2pt; margin-bottom:0; color:#333333;">${escapeHTML(proj.description)}</p>
        </div>
      `).join('')}
    ` : '',
    
    certifications: data.certifications && data.certifications.length > 0 ? `
      <h2>Certifications and Awards</h2>
      ${data.certifications.map(cert => `
        <div style="margin-bottom: 6pt;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;">
            <tr>
              <td width="70%" valign="top" style="font-weight:bold; font-size:10pt; text-align:left;">${escapeHTML(cert.name)}</td>
              <td width="30%" valign="top" style="text-align:right; font-size:10pt; color:#666666;">${formatDate(cert.date)}</td>
            </tr>
            <tr>
              <td width="70%" valign="top" style="font-size:9.5pt; color:#444444; padding-top:1pt;">${escapeHTML(cert.issuer)}</td>
              <td width="30%" valign="top"></td>
            </tr>
          </table>
        </div>
      `).join('')}
    ` : '',
    
    interests: data.interests && data.interests.length > 0 ? `
      <h2>Interests & Hobbies</h2>
      <p>${data.interests.map(interest => escapeHTML(interest.name)).join(', ')}</p>
    ` : '',
    
    customSections: data.customSections && data.customSections.length > 0 ? data.customSections.map(section => `
      <h2>${escapeHTML(section.title)}</h2>
      <div style="font-size: 10pt; color: #333333; margin-bottom: 8pt;">
        ${section.content.includes('•') || section.content.includes('-') ? `
          <ul style="margin-top: 4pt; margin-bottom: 0; padding-left: 18pt;">
            ${section.content.split('\n').map(line => {
              const clean = line.replace(/^[-•*+]\s*/, '').trim();
              return clean ? `<li style="margin-bottom: 3pt;">${escapeHTML(clean)}</li>` : '';
            }).join('')}
          </ul>
        ` : section.content.split('\n').map(line => `<p style="margin-bottom: 4pt;">${escapeHTML(line)}</p>`).join('')}
      </div>
    `).join('') : ''
  };

  const order = sectionOrder || ['summary', 'skills', 'education', 'experience', 'projects', 'certifications', 'interests', 'customSections'];
  const bodyHTML = order.map(key => sectionsMap[key] || '').join('');

  // Assemble unique valid HTML structure (no nested html tags)
  const sourceHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${data.personalInfo.firstName || 'Resume'}_Resume</title>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.25; color: #333333; margin: 1in; }
        h1 { font-size: 20pt; font-weight: bold; color: #111111; text-align: center; margin-bottom: 5pt; }
        h2 { font-size: 13pt; font-weight: bold; color: #222222; border-bottom: 1.5pt solid #cccccc; padding-bottom: 2pt; margin-top: 15pt; margin-bottom: 8pt; text-transform: uppercase; }
        h3 { font-size: 11pt; font-weight: bold; color: #111111; margin: 0; }
        p { margin: 0 0 5pt 0; }
        ul { margin: 0 0 10pt 0; padding-left: 20pt; }
        li { margin-bottom: 3pt; }
        .contact-info { text-align: center; font-size: 9.5pt; color: #666666; margin-bottom: 15pt; }
        .contact-info a { color: #666666; text-decoration: none; }
        .skill-category { font-weight: bold; color: #111111; }
      </style>
    </head>
    <body>
      <h1>${escapeHTML(data.personalInfo.firstName || '')} ${escapeHTML(data.personalInfo.lastName || '')}</h1>
      <div class="contact-info">
        ${contactInfoHTML}
      </div>
      ${bodyHTML}
    </body>
    </html>
  `;
  
  const blob = new Blob(['\ufeff' + sourceHTML], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.personalInfo.firstName || 'Resume'}_${data.personalInfo.lastName || 'Data'}_Resume.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
