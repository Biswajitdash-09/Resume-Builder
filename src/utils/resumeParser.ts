import { ResumeData, Education, Experience, Project, Skill, Certification } from '../types/resume';

const splitLineIntoParts = (line: string): string[] => {
  return line.split(/\||—|--|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
};

const cleanAndDeduplicateLines = (lines: string[]): string[] => {
  const cleaned: string[] = [];
  const normalizedLines = lines
    .map(l => l.trim())
    .filter(l => l.length > 0);

  for (let i = 0; i < normalizedLines.length; i++) {
    const current = normalizedLines[i];
    const cleanCurrent = current.replace(/^[-•*+]\s*/, '').trim().toLowerCase();
    
    // Check if this line is a substring of any OTHER line in the list
    let isSubstring = false;
    for (let j = 0; j < normalizedLines.length; j++) {
      if (i === j) continue;
      const other = normalizedLines[j];
      const cleanOther = other.replace(/^[-•*+]\s*/, '').trim().toLowerCase();
      
      if (cleanOther.includes(cleanCurrent) && cleanOther.length > cleanCurrent.length) {
        isSubstring = true;
        break;
      }
    }
    
    // Check if this line is an exact duplicate of a line we already kept
    let isDuplicate = false;
    for (const kept of cleaned) {
      const cleanKept = kept.replace(/^[-•*+]\s*/, '').trim().toLowerCase();
      if (cleanKept === cleanCurrent) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isSubstring && !isDuplicate) {
      cleaned.push(current);
    }
  }
  
  return cleaned;
};

// Month mapper to normalize strings to 01-12
const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

export const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.trim().toLowerCase();
  
  if (/^\d{4}-\d{2}$/.test(clean)) {
    return clean;
  }
  
  // Try mapping common word/digits structures (e.g. "May 2024", "05/2024", "Sep. 2022")
  const monthYearRegex = /([a-z]+|\d{1,2})[-/.\s]+(\d{4}|\d{2})/i;
  const match = clean.match(monthYearRegex);
  if (match) {
    let month = match[1];
    let year = match[2];
    if (year.length === 2) {
      year = '20' + year;
    }
    
    let monthVal = '01';
    if (MONTH_MAP[month]) {
      monthVal = MONTH_MAP[month];
    } else {
      const parsedMonth = parseInt(month, 10);
      if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        monthVal = parsedMonth.toString().padStart(2, '0');
      }
    }
    return `${year}-${monthVal}`;
  }
  
  // 4-digit year format fallback (e.g. "2024")
  const yearMatch = clean.match(/\b(\d{4})\b/);
  if (yearMatch) {
    return `${yearMatch[1]}-01`;
  }
  
  return '';
};

export const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('PDF.js library not loaded. Make sure script tags are functioning.');
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Sort items by Y descending (top to bottom), then by X ascending (left to right)
    const items = [...textContent.items] as any[];
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 5) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    let pageText = '';
    let lastY = -1;
    for (const item of items) {
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      } else if (lastY !== -1) {
        pageText += ' ';
      }
      pageText += item.str;
      lastY = item.transform[5];
    }
    fullText += pageText + '\n';
  }
  
  return fullText;
};

export const extractTextFromDOCX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const mammoth = (window as any).mammoth;
  if (!mammoth) {
    throw new Error('Mammoth.js library not loaded. Make sure script tags are functioning.');
  }
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const parseResumeText = (text: string): Partial<ResumeData> => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const SECTION_HEADERS = {
    summary: /^(?:professional\s+)?summary|objective|executive\s+summary|about\s+me|profile$/i,
    education: /^education|academic(?:\s+background|\s+profile|\s+record)?$/i,
    experience: /^(?:work\s+)?experience|professional\s+experience|employment(?:\s+history)?|work\s+history$/i,
    projects: /^projects|personal\s+projects|academic\s+projects|selected\s+projects$/i,
    skills: /^skills|technical\s+skills|key\s+skills|core\s+competencies|skills\s+&?\s+expertise|technologies$/i,
    certifications: /^certifications|certifications\s+&\s+awards|awards|licenses$/i,
    interests: /^interests|interests\s+&\s+hobbies|hobbies$/i
  };

  let currentSection: keyof typeof SECTION_HEADERS | 'header' = 'header';
  const sections: Record<keyof typeof SECTION_HEADERS | 'header', string[]> = {
    header: [],
    summary: [],
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    interests: []
  };

  for (const line of lines) {
    let matched = false;
    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(line)) {
        currentSection = key as any;
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[currentSection].push(line);
    }
  }

  // Helper regex patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+\d{1,3}[-\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-_\/\.]+/;
  const githubRegex = /github\.com\/[a-zA-Z0-9-_\/\.]+/;

  // 1. Parse Header Contact Data
  let email = '';
  let phone = '';
  let linkedin = '';
  let github = '';
  let address = '';
  const nameCandidates: string[] = [];

  for (const line of sections.header) {
    const lowerLine = line.toLowerCase();
    
    // Extract Email
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !email) {
      email = emailMatch[0];
    }
    
    // Extract Phone
    const phoneMatch = line.match(phoneRegex);
    if (phoneMatch && !phone) {
      phone = phoneMatch[0];
    }
    
    // Extract LinkedIn URL
    const linkedinMatch = line.match(linkedinRegex);
    if (linkedinMatch && !linkedin) {
      linkedin = 'https://' + linkedinMatch[0];
    }
    
    // Extract GitHub URL
    const githubMatch = line.match(githubRegex);
    if (githubMatch && !github) {
      github = 'https://' + githubMatch[0];
    }

    const isContactLine = emailRegex.test(line) || phoneRegex.test(line) || linkedinRegex.test(line) || githubRegex.test(line);
    
    if (!isContactLine) {
      const locationKeywords = ['street', 'road', 'ave', 'avenue', 'city', 'state', 'india', 'usa', 'uk', 'odisha', 'delhi', 'bangalore', 'mumbai', 'pune', 'california', 'new york', 'london', 'bhubaneswar', 'berhampur', 'balasore'];
      const hasLocationKeyword = locationKeywords.some(kw => lowerLine.includes(kw));
      
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 4 && !hasLocationKeyword && nameCandidates.length === 0) {
        nameCandidates.push(line);
      } else if (hasLocationKeyword || (wordCount >= 3 && line.includes(','))) {
        if (!address) {
          address = line;
        } else {
          address += ', ' + line;
        }
      }
    }
  }

  // Parse First / Last Name
  let firstName = '';
  let lastName = '';
  if (nameCandidates.length > 0) {
    const parts = nameCandidates[0].split(/\s+/);
    if (parts.length === 2) {
      firstName = parts[0];
      lastName = parts[1];
    } else if (parts.length > 2) {
      firstName = parts.slice(0, parts.length - 1).join(' ');
      lastName = parts[parts.length - 1];
    }
  }

  // 2. Parse Summary
  const summary = sections.summary.join(' ');

  // 3. Parse Skills
  const skills: Skill[] = [];
  const programmingLanguagesList = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c', 'c#', 'go', 'rust', 'ruby', 'php', 'sql', 'html', 'css', 'kotlin', 'swift'
  ];
  const frameworksList = [
    'react', 'angular', 'vue', 'next.js', 'express', 'django', 'flask', 'spring', 'laravel', 'tailwind', 'bootstrap', 'svelte'
  ];
  const devToolsList = [
    'git', 'github', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vs code', 'vite', 'webpack', 'jenkins', 'npm', 'yarn', 'bun'
  ];
  const spokenLanguagesList = [
    'english', 'spanish', 'french', 'german', 'hindi', 'bengali', 'odia', 'mandarin', 'japanese', 'chinese'
  ];

  for (const line of sections.skills) {
    let skillItemsString = line;
    if (line.includes(':')) {
      const parts = line.split(':');
      skillItemsString = parts[1];
    }
    
    // Split by commas, semicolons, bullets, or pipes
    const rawSkills = skillItemsString.split(/[,;|•]/);
    for (const rawSkill of rawSkills) {
      const name = rawSkill.trim().replace(/^[-•*+]\s*/, '');
      if (name.length > 1 && name.length < 50) {
        const lowerName = name.toLowerCase();
        let category: Skill['category'] = 'Technical Subjects';
        
        if (programmingLanguagesList.some(lang => lowerName === lang || lowerName.includes(lang))) {
          category = 'Programming Languages';
        } else if (frameworksList.some(fw => lowerName === fw || lowerName.includes(fw))) {
          category = 'Frameworks';
        } else if (devToolsList.some(tool => lowerName === tool || lowerName.includes(tool))) {
          category = 'Dev Tools';
        } else if (spokenLanguagesList.some(lang => lowerName === lang || lowerName.includes(lang))) {
          category = 'Spoken Languages';
        } else if (['leadership', 'communication', 'teamwork', 'problem solving', 'management', 'creativity'].some(soft => lowerName.includes(soft))) {
          category = 'Soft Skills';
        }
        
        skills.push({
          id: `imported-skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          category
        });
      }
    }
  }

  // Helper date-range extractor from string
  const extractDateRange = (line: string): { start: string, end: string, current: boolean } => {
    const dateRangeRegex = /([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to\s]+\s*([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4}|present|current)/i;
    const match = line.match(dateRangeRegex);
    if (match) {
      const startStr = match[1];
      const endStr = match[2];
      const current = /present|current/i.test(endStr);
      return {
        start: normalizeDate(startStr),
        end: current ? '' : normalizeDate(endStr),
        current
      };
    }
    
    // Single date fallback
    const singleDateRegex = /\b([a-z]+\s+\d{4}|\d{4})\b/i;
    const singleMatch = line.match(singleDateRegex);
    if (singleMatch) {
      return {
        start: normalizeDate(singleMatch[1]),
        end: '',
        current: false
      };
    }
    
    return { start: '', end: '', current: false };
  };

  // 4. Parse Education
  const education: Education[] = [];
  const eduGroups: string[][] = [];
  let currentGroup: string[] = [];
  
  for (const line of sections.education) {
    const isInst = /university|college|school|institute|academy|polytechnic/i.test(line);
    const isDegree = /bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\.|diploma|degree|hsc|ssc|cbse|icse/i.test(line);
    const dateRange = extractDateRange(line);
    
    const wordCount = line.split(/\s+/).length;
    const isShortLine = wordCount > 0 && wordCount < 6;
    const hasDegree = currentGroup.some(l => /bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\.|diploma|degree/i.test(l));
    const shouldStartNew = (isShortLine && (isInst || (isDegree && hasDegree))) || (dateRange.start && currentGroup.length > 0 && currentGroup.some(l => extractDateRange(l).start));
    
    if (shouldStartNew && currentGroup.length > 0) {
      eduGroups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(line);
  }
  if (currentGroup.length > 0) {
    eduGroups.push(currentGroup);
  }
  
  for (const group of eduGroups) {
    let institution = '';
    let degree = '';
    let fieldOfStudy = '';
    let startDate = '';
    let endDate = '';
    let cgpa = '';
    const descLines: string[] = [];
    
    for (const line of group) {
      const parts = splitLineIntoParts(line);
      let lineUsedForFields = false;
      
      for (const part of parts) {
        const dateRange = extractDateRange(part);
        const gpaMatch = part.match(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/i);
        const isDegree = /bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\.|diploma|degree/i.test(part);
        const isInst = /university|college|school|institute|academy|polytechnic/i.test(part);
        
        if (dateRange.start) {
          startDate = dateRange.start;
          endDate = dateRange.end;
          lineUsedForFields = true;
        }
        if (gpaMatch) {
          cgpa = gpaMatch[1];
          lineUsedForFields = true;
        }
        if (isDegree) {
          degree = part;
          const fieldMatch = part.match(/(?:in|of)\s+([a-zA-Z\s]+)(?:$|\(|,)/i);
          if (fieldMatch) {
            fieldOfStudy = fieldMatch[1].trim();
          }
          lineUsedForFields = true;
        }
        if (isInst) {
          institution = part;
          lineUsedForFields = true;
        }
      }
      
      if (!lineUsedForFields) {
        const wordCount = line.split(/\s+/).length;
        if (wordCount > 1 && !institution && /education|study|school|college|university/i.test(line)) {
          institution = line;
        } else {
          descLines.push(line);
        }
      }
    }
    
    if (!institution && group.length > 0) {
      const fallback = group.find(l => !/bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\./i.test(l) && !extractDateRange(l).start);
      institution = fallback || group[0];
    }
    
    education.push({
      id: `imported-edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      institution: institution.trim(),
      degree: degree.trim(),
      fieldOfStudy: fieldOfStudy.trim(),
      startDate,
      endDate,
      cgpa,
      description: cleanAndDeduplicateLines(descLines).join('\n').trim()
    });
  }

  // 5. Parse Experience
  const experience: Experience[] = [];
  const expGroups: string[][] = [];
  let currentExpGroup: string[] = [];
  
  for (const line of sections.experience) {
    const dateRange = extractDateRange(line);
    const hasPositionKeyword = /developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator/i.test(line);
    const hasCompanyKeyword = /pvt|ltd|inc|llc|corp|co\.|company|labs|technologies|solutions/i.test(line);
    
    const wordCount = line.split(/\s+/).length;
    const isShortLine = wordCount > 0 && wordCount < 6;
    const shouldStartNew = dateRange.start || (isShortLine && (hasPositionKeyword || (hasCompanyKeyword && currentExpGroup.length > 0)));
    
    if (shouldStartNew && currentExpGroup.length > 0) {
      expGroups.push(currentExpGroup);
      currentExpGroup = [];
    }
    currentExpGroup.push(line);
  }
  if (currentExpGroup.length > 0) {
    expGroups.push(currentExpGroup);
  }
  
  for (const group of expGroups) {
    let company = '';
    let position = '';
    let startDate = '';
    let endDate = '';
    let current = false;
    let location = '';
    let link = '';
    let github = '';
    const descLines: string[] = [];
    
    for (const line of group) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        descLines.push(line);
        continue;
      }
      
      const parts = splitLineIntoParts(line);
      let lineUsedForFields = false;
      
      for (const part of parts) {
        const dateRange = extractDateRange(part);
        const hasPosition = /developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator/i.test(part);
        const hasCompany = /pvt|ltd|inc|llc|corp|co\.|company|labs|technologies|solutions/i.test(part);
        const hasLocation = /(?:bhubaneswar|berhampur|balasore|odisha|delhi|mumbai|bangalore|pune|hyderabad|chennai|california|new york|london|india|usa|uk)/i.test(part);
        const githubMatch = part.match(githubRegex);
        const generalUrlMatch = part.match(/https?:\/\/[^\s]+/);
        
        if (dateRange.start) {
          startDate = dateRange.start;
          endDate = dateRange.end;
          current = dateRange.current;
          lineUsedForFields = true;
        }
        if (githubMatch) {
          github = 'https://' + githubMatch[0];
          lineUsedForFields = true;
        } else if (generalUrlMatch) {
          link = generalUrlMatch[0];
          lineUsedForFields = true;
        }
        if (hasPosition) {
          position = part;
          lineUsedForFields = true;
        }
        if (hasCompany && !hasPosition) {
          company = part;
          lineUsedForFields = true;
        }
        if (hasLocation && !hasPosition && !hasCompany) {
          location = part;
          lineUsedForFields = true;
        }
      }
      
      if (!lineUsedForFields) {
        const wordCount = line.split(/\s+/).length;
        if (wordCount > 0 && wordCount < 5 && !position && /developer|engineer|intern|manager|lead|analyst|consultant/i.test(line)) {
          position = line;
        } else if (wordCount > 0 && wordCount < 6 && !company && !line.includes(' ')) {
          company = line;
        } else {
          descLines.push(line);
        }
      }
    }
    
    if (!position && group.length > 0) {
      position = group[0];
    }
    if (!company && group.length > 1) {
      company = group[1];
    }
    
    experience.push({
      id: `imported-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      company: company.trim(),
      position: position.trim(),
      startDate,
      endDate,
      current,
      location: location.trim(),
      link,
      github,
      description: cleanAndDeduplicateLines(descLines).join('\n').trim()
    });
  }

  // 6. Parse Projects
  const projects: Project[] = [];
  const projGroups: string[][] = [];
  let currentProjGroup: string[] = [];
  
  for (const line of sections.projects) {
    const githubMatch = line.match(githubRegex);
    const generalUrlMatch = line.match(/https?:\/\/[^\s]+/);
    
    const isNewProject = githubMatch || generalUrlMatch || (!currentProjGroup.length && line.length > 0 && line.length < 60);
    
    if (isNewProject && currentProjGroup.length > 0) {
      projGroups.push(currentProjGroup);
      currentProjGroup = [];
    }
    currentProjGroup.push(line);
  }
  if (currentProjGroup.length > 0) {
    projGroups.push(currentProjGroup);
  }
  
  for (const group of projGroups) {
    let name = '';
    let description = '';
    let technologies: string[] = [];
    let link = '';
    let github = '';
    let startDate = '';
    let endDate = '';
    const descLines: string[] = [];
    
    for (const line of group) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        descLines.push(line);
        continue;
      }
      
      const parts = splitLineIntoParts(line);
      let lineUsedForFields = false;
      
      for (const part of parts) {
        const githubMatch = part.match(githubRegex);
        const generalUrlMatch = part.match(/https?:\/\/[^\s]+/);
        const dateRange = extractDateRange(part);
        
        if (dateRange.start) {
          startDate = dateRange.start;
          endDate = dateRange.end;
          lineUsedForFields = true;
        }
        if (githubMatch) {
          github = 'https://' + githubMatch[0];
          lineUsedForFields = true;
        } else if (generalUrlMatch) {
          link = generalUrlMatch[0];
          lineUsedForFields = true;
        }
        
        const techKeywordsMatch = part.match(/(?:technologies|tech stack|built with|using)[:\s]+([a-zA-Z0-9\s,._+-]+)/i);
        const bracketMatch = part.match(/[\[\({]([a-zA-Z0-9\s,._+-]+)[\]\)}]/);
        
        if (techKeywordsMatch) {
          technologies = techKeywordsMatch[1].split(/[,|]/).map(t => t.trim());
          lineUsedForFields = true;
        } else if (bracketMatch) {
          technologies = bracketMatch[1].split(/[,|]/).map(t => t.trim());
          lineUsedForFields = true;
        }
      }
      
      if (!lineUsedForFields) {
        if (!name && line.length < 50 && !line.includes(' ')) {
          name = line;
        } else {
          descLines.push(line);
        }
      }
    }
    
    if (!name && group.length > 0) {
      name = group[0].replace(/https?:\/\/[^\s]+/g, '').replace(/[-•*+]/g, '').trim();
    }
    
    projects.push({
      id: `imported-proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: cleanAndDeduplicateLines(descLines).join('\n').trim(),
      technologies,
      link,
      github,
      startDate,
      endDate
    });
  }

  // 7. Parse Certifications
  const certifications: Certification[] = [];
  for (const line of sections.certifications) {
    if (line.length > 3) {
      const parts = line.split(/[-–|]/);
      const name = parts[0].trim();
      const issuer = parts.length > 1 ? parts[1].trim() : 'Verified Issuer';
      const dateRange = extractDateRange(line);
      
      certifications.push({
        id: `imported-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        issuer,
        date: dateRange.start || new Date().toISOString().substring(0, 7),
        expiryDate: dateRange.end || undefined
      });
    }
  }

  // 8. Parse Interests
  const interests: { id: string, name: string }[] = [];
  if (sections.interests.length > 0) {
    const mergedInterests = sections.interests.join(', ');
    const rawInterests = mergedInterests.split(/[,;|•]/);
    for (const item of rawInterests) {
      const name = item.trim();
      if (name.length > 1 && name.length < 30) {
        interests.push({
          id: `imported-interest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name
        });
      }
    }
  }

  return {
    personalInfo: {
      firstName,
      lastName,
      email,
      phone,
      linkedin,
      github,
      address
    },
    summary,
    skills,
    education,
    experience,
    projects,
    certifications,
    interests
  };
};
