import { ResumeData, Education, Experience, Project, Skill, Certification } from '../types/resume';

const splitLineIntoParts = (line: string): string[] => {
  return line.split(/\||—|--|\t|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
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
  const monthYearRegex = /([a-z]+|\d{1,2})[-/.,\s]+(\d{4}|\d{2})/i;
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
  
  const cleanMetadata = (textVal: string): string => {
    let cleaned = textVal;
    // Match and remove common date range formats like "2020 - 2024", "July 2020 - Present", etc.
    const dateRangeRegex = /([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to\s]+\s*([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4}|present|current)/i;
    const singleDateRegex = /\b([a-z]+\s+\d{4}|\d{4})\b/i;
    
    cleaned = cleaned.replace(dateRangeRegex, '');
    cleaned = cleaned.replace(singleDateRegex, '');
    // Remove GPA patterns
    cleaned = cleaned.replace(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/i, '');
    // Clean up empty parentheses/brackets and leading/trailing separators/whitespace
    cleaned = cleaned.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '');
    cleaned = cleaned.replace(/^[-•*+|,\s]+|[-•*+|,\s]+$/g, '');
    return cleaned.trim();
  };
  
  const SECTION_HEADERS_KEYS = ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'interests'] as const;

  const isSectionHeader = (lineVal: string): keyof typeof SECTION_HEADERS | null => {
    const clean = lineVal.trim().toLowerCase();
    if (clean.length > 40) return null; // headers are short
    
    if (/\b(?:summary|objective|profile|about\s+me)\b/i.test(clean)) return 'summary';
    if (/\b(?:education|academic|academics)\b/i.test(clean)) return 'education';
    if (/\b(?:experience|employment|work\s+history|career|history)\b/i.test(clean) && !/no\s+experience/i.test(clean)) return 'experience';
    if (/\b(?:projects|key\s+projects|selected\s+projects|personal\s+projects)\b/i.test(clean)) return 'projects';
    if (/\b(?:skills|technologies|technical\s+expertise|technical\s+skills|competencies)\b/i.test(clean)) return 'skills';
    if (/\b(?:certifications|awards|licenses|achievements|accomplishments)\b/i.test(clean)) return 'certifications';
    if (/\b(?:interests|hobbies)\b/i.test(clean)) return 'interests';
    
    return null;
  };

  const SECTION_HEADERS = {
    summary: /summary/i,
    education: /education/i,
    experience: /experience/i,
    projects: /projects/i,
    skills: /skills/i,
    certifications: /certifications/i,
    interests: /interests/i
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
    const sectionMatch = isSectionHeader(line);
    if (sectionMatch) {
      currentSection = sectionMatch;
    } else {
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
  
  const mapCategory = (prefix: string, skillName: string): Skill['category'] => {
    const cleanPrefix = prefix.toLowerCase().trim();
    const cleanSkill = skillName.toLowerCase().trim();
    
    if (/programming|language|coding/i.test(cleanPrefix)) {
      return 'Programming Languages';
    }
    if (/soft\s*skill|interpersonal|communication|operations|leadership/i.test(cleanPrefix)) {
      return 'Soft Skills';
    }
    if (/tool|dev\s*tool|database|sql|office|software|git|aws|cloud/i.test(cleanPrefix)) {
      return 'Dev Tools';
    }
    if (/spoken|language|english|hindi|bengali|odia/i.test(cleanPrefix)) {
      return 'Spoken Languages';
    }
    if (/framework|library|react|angular|vue|django/i.test(cleanPrefix)) {
      return 'Frameworks';
    }
    
    // Fallback to skill-name matching
    const programmingLanguagesList = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c', 'c#', 'go', 'rust', 'ruby', 'php', 'sql', 'html', 'css', 'kotlin', 'swift'
    ];
    const frameworksList = [
      'react', 'angular', 'vue', 'next.js', 'express', 'django', 'flask', 'spring', 'laravel', 'tailwind', 'bootstrap', 'svelte'
    ];
    const devToolsList = [
      'git', 'github', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vs code', 'vite', 'webpack', 'jenkins', 'npm', 'yarn', 'bun', 'excel', 'word', 'outlook', 'supabase'
    ];
    const spokenLanguagesList = [
      'english', 'spanish', 'french', 'german', 'hindi', 'bengali', 'odia', 'mandarin', 'japanese', 'chinese'
    ];
    
    if (programmingLanguagesList.some(lang => cleanSkill === lang || cleanSkill.includes(lang))) {
      return 'Programming Languages';
    }
    if (frameworksList.some(fw => cleanSkill === fw || cleanSkill.includes(fw))) {
      return 'Frameworks';
    }
    if (devToolsList.some(tool => cleanSkill === tool || cleanSkill.includes(tool))) {
      return 'Dev Tools';
    }
    if (spokenLanguagesList.some(lang => cleanSkill === lang || cleanSkill.includes(lang))) {
      return 'Spoken Languages';
    }
    if (['leadership', 'communication', 'teamwork', 'problem solving', 'management', 'creativity'].some(soft => cleanSkill.includes(soft))) {
      return 'Soft Skills';
    }
    
    return 'Technical Subjects';
  };

  for (const line of sections.skills) {
    let prefix = '';
    let skillItemsString = line;
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      prefix = line.slice(0, colonIndex);
      skillItemsString = line.slice(colonIndex + 1);
    }
    
    // Split by commas, semicolons, bullets, or pipes, but NOT if they are inside parentheses
    const rawSkills: string[] = [];
    let currentSkill = '';
    let parenDepth = 0;
    for (let charIndex = 0; charIndex < skillItemsString.length; charIndex++) {
      const char = skillItemsString[charIndex];
      if (char === '(' || char === '[' || char === '{') parenDepth++;
      else if (char === ')' || char === ']' || char === '}') parenDepth--;
      
      if (parenDepth === 0 && (char === ',' || char === ';' || char === '|' || char === '•')) {
        rawSkills.push(currentSkill);
        currentSkill = '';
      } else {
        currentSkill += char;
      }
    }
    if (currentSkill) {
      rawSkills.push(currentSkill);
    }

    for (const rawSkill of rawSkills) {
      const name = rawSkill.trim().replace(/^[-•*+]\s*/, '');
      if (name.length > 1 && name.length < 100) {
        const category = mapCategory(prefix, name);
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
    // Remove GPA patterns to avoid misidentifying values like "8.5/10" as dates
    const cleanedLine = line.replace(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/gi, '');
    
    const dateRangeRegex = /([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to\s]+\s*([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4}|present|current)/i;
    const match = cleanedLine.match(dateRangeRegex);
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
    const singleMatch = cleanedLine.match(singleDateRegex);
    if (singleMatch) {
      return {
        start: normalizeDate(singleMatch[1]),
        end: '',
        current: false
      };
    }
    
    return { start: '', end: '', current: false };
  };

  const extractAndStripDates = (part: string): { cleanedText: string, startDate: string, endDate: string, current: boolean } => {
    let cleanedText = part;
    let startDate = '';
    let endDate = '';
    let current = false;

    // Remove GPA patterns to avoid misidentifying values like "8.5/10" as dates
    const lineWithoutGpa = part.replace(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/gi, '');
    
    const dateRangeRegex = /([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to\s]+\s*([a-z]+\s+\d{4}|\d{4}|\d{1,2}\/\d{2,4}|present|current)/i;
    const match = lineWithoutGpa.match(dateRangeRegex);
    
    if (match) {
      const startStr = match[1];
      const endStr = match[2];
      current = /present|current/i.test(endStr);
      startDate = normalizeDate(startStr);
      endDate = current ? '' : normalizeDate(endStr);
      cleanedText = part.replace(match[0], '');
    } else {
      const singleDateRegex = /\b([a-z]+\s+\d{4}|\d{4})\b/i;
      const singleMatch = lineWithoutGpa.match(singleDateRegex);
      if (singleMatch) {
        startDate = normalizeDate(singleMatch[1]);
        cleanedText = part.replace(singleMatch[0], '');
      }
    }
    
    // Clean up any remaining leading/trailing punctuation or connectors
    cleanedText = cleanedText.replace(/^[\s,;:\-|—–/()]+|[\s,;:\-|—–/()]+$/g, '').trim();
    
    return { cleanedText, startDate, endDate, current };
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
        const { cleanedText, startDate: sDate, endDate: eDate } = extractAndStripDates(part);
        if (sDate) {
          startDate = sDate;
          endDate = eDate;
          lineUsedForFields = true;
        }
        
        const gpaMatch = cleanedText.match(/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)[:\s]+(\d+(?:\.\d+)?(?:\/\d+)?|\d+%?)/i);
        const isDegree = /bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\.|diploma|degree/i.test(cleanedText);
        const isInst = /university|college|school|institute|academy|polytechnic/i.test(cleanedText);
        
        if (gpaMatch) {
          cgpa = gpaMatch[1];
          lineUsedForFields = true;
        }
        if (isDegree) {
          let fieldMatch = cleanedText.match(/\bin\s+([a-zA-Z\s]+)(?:$|\(|,)/i);
          if (!fieldMatch) {
            fieldMatch = cleanedText.match(/(?<!bachelor|master|associate|doctor|science)\s+of\s+([a-zA-Z\s]+)(?:$|\(|,)/i);
          }
          if (fieldMatch) {
            fieldOfStudy = cleanMetadata(fieldMatch[1].trim());
            degree = cleanMetadata(cleanedText.replace(fieldMatch[0], '').trim());
          } else {
            degree = cleanMetadata(cleanedText);
          }
          lineUsedForFields = true;
        }
        if (isInst) {
          institution = cleanMetadata(cleanedText);
          lineUsedForFields = true;
        }
      }
      
      if (!lineUsedForFields) {
        const wordCount = line.split(/\s+/).length;
        if (wordCount > 1 && !institution && /education|study|school|college|university/i.test(line)) {
          institution = cleanMetadata(line);
        } else {
          descLines.push(line);
        }
      }
    }
    
    if (!institution && group.length > 0) {
      const fallback = group.find(l => 
        !/bachelor|master|b\.tech|m\.tech|b\.s\.|b\.e\.|m\.s\.|ph\.d\./i.test(l) && 
        !extractDateRange(l).start &&
        !/(?:gpa|cgpa|percentage|score|g.p.a|c.g.p.a)/i.test(l) &&
        !/^[-•*+]\s*/.test(l)
      );
      institution = cleanMetadata(fallback || group[0]);
    }
    
    education.push({
      id: `imported-edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      institution: cleanMetadata(institution),
      degree: cleanMetadata(degree),
      fieldOfStudy: cleanMetadata(fieldOfStudy),
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
    const hasPositionKeyword = /developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator|staff|member/i.test(line);
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
    
    // Process line by line to keep context structures intact
    const lineTexts: string[][] = [];
    
    for (const line of group) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        descLines.push(line);
        continue;
      }
      
      const lineParts: string[] = [];
      const parts = splitLineIntoParts(line);
      for (const part of parts) {
        const githubMatch = part.match(githubRegex);
        const generalUrlMatch = part.match(/https?:\/\/[^\s]+/);
        
        if (githubMatch) {
          github = 'https://' + githubMatch[0];
        } else if (generalUrlMatch) {
          link = generalUrlMatch[0];
        } else {
          const { cleanedText, startDate: sDate, endDate: eDate, current: curr } = extractAndStripDates(part);
          if (sDate) {
            startDate = sDate;
            endDate = eDate;
            current = curr;
          }
          if (cleanedText) {
            lineParts.push(cleanedText);
          }
        }
      }
      if (lineParts.length > 0) {
        lineTexts.push(lineParts);
      }
    }
    
    // Find the position index first
    let positionLineIdx = -1;
    let positionPartIdx = -1;
    for (let lIdx = 0; lIdx < lineTexts.length; lIdx++) {
      const parts = lineTexts[lIdx];
      const pIdx = parts.findIndex(part => 
        /developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator|staff|member|associate|founder/i.test(part)
      );
      if (pIdx !== -1) {
        positionLineIdx = lIdx;
        positionPartIdx = pIdx;
        break;
      }
    }
    
    if (positionLineIdx !== -1) {
      position = lineTexts[positionLineIdx][positionPartIdx];
      lineTexts[positionLineIdx].splice(positionPartIdx, 1);
    }
    
    // The other element on the position line is the location
    if (positionLineIdx !== -1 && lineTexts[positionLineIdx].length > 0) {
      location = lineTexts[positionLineIdx][0];
      lineTexts[positionLineIdx].splice(0, 1);
    }
    
    // The remaining text elements are candidate companies
    const flatRemaining = lineTexts.flat().filter(Boolean);
    if (flatRemaining.length === 1) {
      company = flatRemaining[0];
    } else if (flatRemaining.length >= 2) {
      if (!location) {
        company = flatRemaining[0];
        location = flatRemaining[1];
      } else {
        company = flatRemaining.join(' - ');
      }
    }
    
    // Fallbacks
    if (!position && group.length > 0) {
      const fallbackPos = group.find(l => !/^[-•*+]\s*/.test(l) && !extractDateRange(l).start);
      position = cleanMetadata(fallbackPos || group[0]);
    }
    if (!company && group.length > 1) {
      const fallbackCompany = group.find((l, idx) => 
        idx > 0 && 
        !/^[-•*+]\s*/.test(l) && 
        !extractDateRange(l).start &&
        !/developer|engineer|intern|manager|lead|analyst|consultant|specialist|officer|administrator|staff|member/i.test(l)
      );
      company = cleanMetadata(fallbackCompany || group[1]);
    }
    
    experience.push({
      id: `imported-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      company: cleanMetadata(company),
      position: cleanMetadata(position),
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
        
        if (githubMatch) {
          github = 'https://' + githubMatch[0];
          lineUsedForFields = true;
        } else if (generalUrlMatch) {
          link = generalUrlMatch[0];
          lineUsedForFields = true;
        } else {
          const { cleanedText, startDate: sDate, endDate: eDate } = extractAndStripDates(part);
          if (sDate) {
            startDate = sDate;
            endDate = eDate;
            lineUsedForFields = true;
          }
          if (cleanedText) {
            const techKeywordsMatch = cleanedText.match(/(?:technologies|tech stack|built with|using)[:\s]+([a-zA-Z0-9\s,._+-]+)/i);
            const bracketMatch = cleanedText.match(/[\[\({]([a-zA-Z0-9\s,._+-]+)[\]\)}]/);
            
            if (techKeywordsMatch) {
              technologies = techKeywordsMatch[1].split(/[,|]/).map(t => t.trim());
              lineUsedForFields = true;
            } else if (bracketMatch) {
              technologies = bracketMatch[1].split(/[,|]/).map(t => t.trim());
              lineUsedForFields = true;
            }
          }
        }
      }
    }
    
    if (!name && group.length > 0) {
      const lineWithoutUrls = group[0].replace(/https?:\/\/[^\s]+/g, '').replace(/[-•*+]/g, '').trim();
      const { cleanedText } = extractAndStripDates(lineWithoutUrls);
      name = cleanMetadata(cleanedText);
    }
    
    projects.push({
      id: `imported-proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: cleanMetadata(name),
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
