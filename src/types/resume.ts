export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  address: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  cgpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location?: string;
  link?: string;
  github?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical Subjects' | 'Programming Languages' | 'Spoken Languages' | 'Soft Skills' | 'Frameworks' | 'Dev Tools';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Elementary' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface ProgrammingLanguage {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Interest {
  id: string;
  name: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  profilePicture: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  programmingLanguages: ProgrammingLanguage[];
  interests: Interest[];
  customSections: CustomSection[];
}
