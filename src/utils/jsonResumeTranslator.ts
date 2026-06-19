import { ResumeData, Skill, Education, Experience, Project, Certification, Interest } from '../types/resume';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const translateJSONResumeToInternal = (jsonResume: any): ResumeData => {
  const basics = jsonResume.basics || {};
  const location = basics.location || {};
  
  // Combine address elements
  const addressParts = [
    location.address,
    location.city,
    location.region,
    location.postalCode,
    location.countryCode
  ].filter(Boolean);
  const address = addressParts.join(', ');

  // Extract name parts
  const name = basics.name || '';
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Extract profiles
  const profiles = basics.profiles || [];
  const linkedinProfile = profiles.find((p: any) => 
    p.network?.toLowerCase() === 'linkedin' || p.url?.toLowerCase().includes('linkedin.com')
  );
  const githubProfile = profiles.find((p: any) => 
    p.network?.toLowerCase() === 'github' || p.url?.toLowerCase().includes('github.com')
  );

  const personalInfo = {
    firstName,
    lastName,
    email: basics.email || '',
    phone: basics.phone || '',
    linkedin: linkedinProfile?.url || linkedinProfile?.username || '',
    github: githubProfile?.url || githubProfile?.username || '',
    address
  };

  // Convert work experience
  const experience: Experience[] = (jsonResume.work || []).map((w: any): Experience => {
    const highlightsText = w.highlights && w.highlights.length > 0
      ? '\n' + w.highlights.map((h: string) => `• ${h}`).join('\n')
      : '';
    const description = ((w.summary || '') + highlightsText).trim();

    return {
      id: w.id || generateId(),
      company: w.name || '',
      position: w.position || '',
      startDate: w.startDate || '',
      endDate: w.endDate || '',
      current: !w.endDate,
      description,
      location: w.location || '',
      link: w.url || ''
    };
  });

  // Convert education
  const education: Education[] = (jsonResume.education || []).map((e: any): Education => {
    const desc = e.courses && e.courses.length > 0
      ? `Courses: ${e.courses.join(', ')}`
      : '';
    
    return {
      id: e.id || generateId(),
      institution: e.institution || '',
      degree: e.studyType || '',
      fieldOfStudy: e.area || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      cgpa: e.score || '',
      description: desc
    };
  });

  // Convert skills
  const skills: Skill[] = [];
  if (Array.isArray(jsonResume.skills)) {
    jsonResume.skills.forEach((s: any) => {
      const groupName = (s.name || '').toLowerCase();
      let category: Skill['category'] = 'Technical Subjects';
      if (groupName.includes('programming') || (groupName.includes('language') && !groupName.includes('spoken'))) {
        category = 'Programming Languages';
      } else if (groupName.includes('spoken') || (groupName.includes('languages') && groupName.includes('speak'))) {
        category = 'Spoken Languages';
      } else if (groupName.includes('soft') || groupName.includes('interpersonal') || groupName.includes('social')) {
        category = 'Soft Skills';
      } else if (groupName.includes('framework') || groupName.includes('library') || groupName.includes('libraries')) {
        category = 'Frameworks';
      } else if (groupName.includes('tool') || groupName.includes('dev') || groupName.includes('environment')) {
        category = 'Dev Tools';
      }

      if (Array.isArray(s.keywords)) {
        s.keywords.forEach((keyword: string) => {
          skills.push({
            id: generateId(),
            name: keyword,
            category
          });
        });
      } else if (s.name) {
        skills.push({
          id: generateId(),
          name: s.name,
          category
        });
      }
    });
  }

  // Convert projects
  const projects: Project[] = (jsonResume.projects || []).map((p: any): Project => {
    const highlightsText = p.highlights && p.highlights.length > 0
      ? '\n' + p.highlights.map((h: string) => `• ${h}`).join('\n')
      : '';
    const description = ((p.description || '') + highlightsText).trim();

    return {
      id: p.id || generateId(),
      name: p.name || '',
      description,
      technologies: p.keywords || [],
      link: p.url || '',
      startDate: p.startDate || '',
      endDate: p.endDate || ''
    };
  });

  // Convert certifications
  const certifications: Certification[] = (jsonResume.certificates || []).map((c: any): Certification => {
    return {
      id: c.id || generateId(),
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
      link: c.url || ''
    };
  });

  // Convert interests
  const interests: Interest[] = (jsonResume.interests || []).map((i: any): Interest => {
    return {
      id: i.id || generateId(),
      name: i.name || ''
    };
  });

  return {
    personalInfo,
    profilePicture: basics.image || '',
    summary: basics.summary || '',
    education,
    experience,
    skills,
    projects,
    certifications,
    languages: [],
    programmingLanguages: [],
    interests,
    customSections: []
  };
};

export const translateInternalToJSONResume = (internal: ResumeData): any => {
  const basics = {
    name: `${internal.personalInfo.firstName} ${internal.personalInfo.lastName}`.trim(),
    email: internal.personalInfo.email || undefined,
    phone: internal.personalInfo.phone || undefined,
    image: internal.profilePicture || undefined,
    summary: internal.summary || undefined,
    location: internal.personalInfo.address ? {
      address: internal.personalInfo.address
    } : undefined,
    profiles: [
      internal.personalInfo.linkedin ? {
        network: 'LinkedIn',
        url: internal.personalInfo.linkedin
      } : null,
      internal.personalInfo.github ? {
        network: 'GitHub',
        url: internal.personalInfo.github
      } : null
    ].filter(Boolean)
  };

  const work = internal.experience.map(exp => {
    const lines = exp.description.split('\n');
    const highlights = lines
      .filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'))
      .map(l => l.trim().substring(1).trim());
    const summary = lines
      .filter(l => !l.trim().startsWith('•') && !l.trim().startsWith('-'))
      .join('\n')
      .trim();

    return {
      name: exp.company,
      position: exp.position,
      url: exp.link || undefined,
      startDate: exp.startDate || undefined,
      endDate: exp.endDate || undefined,
      summary: summary || undefined,
      highlights: highlights.length > 0 ? highlights : undefined
    };
  });

  const education = internal.education.map(edu => ({
    institution: edu.institution,
    studyType: edu.degree || undefined,
    area: edu.fieldOfStudy || undefined,
    startDate: edu.startDate || undefined,
    endDate: edu.endDate || undefined,
    score: edu.cgpa || undefined,
    courses: edu.description ? [edu.description] : undefined
  }));

  const categoryGroups: Record<string, string[]> = {};
  internal.skills.forEach(skill => {
    if (!categoryGroups[skill.category]) {
      categoryGroups[skill.category] = [];
    }
    categoryGroups[skill.category].push(skill.name);
  });

  const skills = Object.entries(categoryGroups).map(([category, names]) => ({
    name: category,
    keywords: names
  }));

  const projects = internal.projects.map(proj => {
    const lines = proj.description.split('\n');
    const highlights = lines
      .filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'))
      .map(l => l.trim().substring(1).trim());
    const description = lines
      .filter(l => !l.trim().startsWith('•') && !l.trim().startsWith('-'))
      .join('\n')
      .trim();

    return {
      name: proj.name,
      description: description || undefined,
      highlights: highlights.length > 0 ? highlights : undefined,
      keywords: proj.technologies.length > 0 ? proj.technologies : undefined,
      url: proj.link || undefined,
      startDate: proj.startDate || undefined,
      endDate: proj.endDate || undefined
    };
  });

  const certificates = internal.certifications.map(cert => ({
    name: cert.name,
    issuer: cert.issuer,
    date: cert.date || undefined,
    url: cert.link || undefined
  }));

  const interests = internal.interests.map(interest => ({
    name: interest.name
  }));

  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics,
    work: work.length > 0 ? work : undefined,
    education: education.length > 0 ? education : undefined,
    skills: skills.length > 0 ? skills : undefined,
    projects: projects.length > 0 ? projects : undefined,
    certificates: certificates.length > 0 ? certificates : undefined,
    interests: interests.length > 0 ? interests : undefined
  };
};
