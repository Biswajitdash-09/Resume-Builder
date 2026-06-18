import { ResumeData, Education, Experience, Project, Skill, Certification } from '../types/resume';

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
  let currentEdu: Partial<Education> | null = null;

  for (const line of sections.education) {
    const isInst = /university|college|school|institute|academy|polytechnic/i.test(line);
    const isDegree = /bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\.|diploma|degree|hsc|ssc|cbse|icse/i.test(line);
    
    if (isInst || (!currentEdu && line.length > 0)) {
      if (currentEdu) {
        education.push(currentEdu as Education);
      }
      currentEdu = {
        id: `imported-edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        institution: line,
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        cgpa: '',
        description: ''
      };
    } else if (currentEdu) {
      // Look for GPA
      const gpaMatch = line.match(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/i);
      if (gpaMatch) {
        currentEdu.cgpa = gpaMatch[1];
      }
      
      // Look for Date Range
      const { start, end } = extractDateRange(line);
      if (start) {
        currentEdu.startDate = start;
        currentEdu.endDate = end;
      }
      
      // Look for Degree and Field of Study
      if (isDegree) {
        currentEdu.degree = line;
        
        const fieldMatch = line.match(/(?:in|of)\s+([a-zA-Z\s]+)(?:$|\(|,)/i);
        if (fieldMatch) {
          currentEdu.fieldOfStudy = fieldMatch[1].trim();
        }
      } else {
        if (!currentEdu.description) {
          currentEdu.description = line;
        } else {
          currentEdu.description += '\n' + line;
        }
      }
    }
  }
  if (currentEdu) {
    education.push(currentEdu as Education);
  }

  // 5. Parse Experience
  const experience: Experience[] = [];
  let currentExp: Partial<Experience> | null = null;

  for (const line of sections.experience) {
    const dateRange = extractDateRange(line);
    const hasPositionKeyword = /developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator/i.test(line);
    const hasCompanyKeyword = /pvt|ltd|inc|llc|corp|co\.|company|labs|technologies|solutions/i.test(line);
    
    const isNewEntry = dateRange.start || hasPositionKeyword || (hasCompanyKeyword && !currentExp);
    
    if (isNewEntry) {
      if (currentExp) {
        experience.push(currentExp as Experience);
      }
      currentExp = {
        id: `imported-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        company: '',
        position: '',
        startDate: dateRange.start || '',
        endDate: dateRange.end || '',
        current: dateRange.current,
        description: '',
        location: '',
        link: '',
        github: ''
      };
      
      if (hasPositionKeyword) {
        currentExp.position = line;
      } else if (hasCompanyKeyword) {
        currentExp.company = line;
      } else {
        currentExp.description = line;
      }
    } else if (currentExp) {
      const githubMatch = line.match(githubRegex);
      const generalUrlMatch = line.match(/https?:\/\/[^\s]+/);
      
      if (githubMatch) {
        currentExp.github = 'https://' + githubMatch[0];
      } else if (generalUrlMatch) {
        currentExp.link = generalUrlMatch[0];
      }
      
      if (dateRange.start && !currentExp.startDate) {
        currentExp.startDate = dateRange.start;
        currentExp.endDate = dateRange.end;
        currentExp.current = dateRange.current;
      }
      
      if (hasPositionKeyword && !currentExp.position) {
        currentExp.position = line;
      } else if (!currentExp.company && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
        currentExp.company = line;
      } else {
        if (!currentExp.description) {
          currentExp.description = line;
        } else {
          currentExp.description += '\n' + line;
        }
      }
    }
  }
  if (currentExp) {
    experience.push(currentExp as Experience);
  }

  // 6. Parse Projects
  const projects: Project[] = [];
  let currentProject: Partial<Project> | null = null;

  for (const line of sections.projects) {
    const githubMatch = line.match(githubRegex);
    const generalUrlMatch = line.match(/https?:\/\/[^\s]+/);
    const dateRange = extractDateRange(line);
    
    const isNewProject = githubMatch || generalUrlMatch || (!currentProject && line.length > 0 && line.length < 60);
    
    if (isNewProject) {
      if (currentProject) {
        projects.push(currentProject as Project);
      }
      currentProject = {
        id: `imported-proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: line.replace(/https?:\/\/[^\s]+/g, '').replace(/[-•*+]/g, '').trim(),
        description: '',
        technologies: [],
        link: generalUrlMatch ? generalUrlMatch[0] : '',
        github: githubMatch ? 'https://' + githubMatch[0] : '',
        startDate: dateRange.start || '',
        endDate: dateRange.end || ''
      };
    } else if (currentProject) {
      if (githubMatch) {
        currentProject.github = 'https://' + githubMatch[0];
      } else if (generalUrlMatch) {
        currentProject.link = generalUrlMatch[0];
      }
      
      const techKeywordsMatch = line.match(/(?:technologies|tech stack|built with|using)[:\s]+([a-zA-Z0-9\s,._+-]+)/i);
      const bracketMatch = line.match(/[\[\({]([a-zA-Z0-9\s,._+-]+)[\]\)}]/);
      
      if (techKeywordsMatch) {
        currentProject.technologies = techKeywordsMatch[1].split(/[,|]/).map(t => t.trim());
      } else if (bracketMatch) {
        currentProject.technologies = bracketMatch[1].split(/[,|]/).map(t => t.trim());
      }
      
      if (!currentProject.description) {
        currentProject.description = line;
      } else {
        currentProject.description += '\n' + line;
      }
    }
  }
  if (currentProject) {
    projects.push(currentProject as Project);
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
