
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { ProfilePictureForm } from './forms/ProfilePictureForm';
import { SummaryForm } from './forms/SummaryForm';
import { EducationForm } from './forms/EducationForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { LanguagesForm } from './forms/LanguagesForm';
import { InterestsForm } from './forms/InterestsForm';
import { CustomSectionsForm } from './forms/CustomSectionsForm';
import { ResumePreview } from './ResumePreview';
import { PageOverflowWarning } from './PageOverflowWarning';
import { ResumeControls } from './ResumeControls';
import { Footer } from './Footer';
import { ResumeData } from '../types/resume';
import { exportToPDF } from '../utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

/**
 * Main Resume Builder component that orchestrates the entire resume creation experience
 * Features:
 * - Dark/Light mode toggle
 * - Responsive layout with mobile preview toggle
 * - Auto-save functionality every 10 seconds
 * - PDF export capability
 * - Import/Export resume data
 * - Real-time preview updates
 */
export const ResumeBuilder = () => {
  // UI State Management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Controls mobile preview visibility
  
  // Resume Configuration
  const [fontSize, setFontSize] = useState(12); // Font size for PDF export
  const [pageCount, setPageCount] = useState(1); // Number of pages for layout
  
  // Main resume data state - contains all user input
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      address: ''
    },
    profilePicture: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    programmingLanguages: [],
    interests: [],
    customSections: []
  });
  
  const { toast } = useToast();

  /**
   * Load saved data from localStorage on component mount
   * Ensures backward compatibility with existing user data
   */
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    const savedFontSize = localStorage.getItem('resumeFontSize');
    const savedPageCount = localStorage.getItem('resumePageCount');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure backward compatibility with existing data structure
        setResumeData({
          ...parsed,
          profilePicture: parsed.profilePicture || '',
          programmingLanguages: parsed.programmingLanguages || [],
          customSections: parsed.customSections || []
        });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    // Restore user preferences
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }

    if (savedPageCount) {
      setPageCount(parseInt(savedPageCount, 10));
    }
  }, []);

  /**
   * Auto-save functionality - saves data every 10 seconds
   * Prevents data loss and provides seamless user experience
   */
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('resumeFontSize', fontSize.toString());
      localStorage.setItem('resumePageCount', pageCount.toString());
    }, 10000);
    return () => clearInterval(interval);
  }, [resumeData, fontSize, pageCount]);

  /**
   * Dark mode toggle - applies theme to entire document
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Manual save handler - provides immediate feedback to user
   */
  const handleSave = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    localStorage.setItem('resumeFontSize', fontSize.toString());
    localStorage.setItem('resumePageCount', pageCount.toString());
    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully!"
    });
  };

  /**
   * PDF export handler with error handling and user feedback
   */
  const handleExportPDF = async () => {
    try {
      console.log('Export PDF clicked');
      await exportToPDF(resumeData);
      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully!"
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error downloading your resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  /**
   * Generic handler for updating any section of resume data
   * @param section - The section key to update
   * @param data - The new data for that section
   */
  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  /**
   * Import handler with data migration for backward compatibility
   * Migrates old language structures to new skills-based system
   * @param importedData - Partial resume data to import
   */
  const handleImportResume = (importedData: Partial<ResumeData>) => {
    // Migrate programming languages and spoken languages to skills if they exist
    let migratedSkills = importedData.skills || [];
    
    // Handle legacy programming languages data
    if (importedData.programmingLanguages && importedData.programmingLanguages.length > 0) {
      const programmingSkills = importedData.programmingLanguages.map(lang => ({
        id: `prog-${lang.id}`,
        name: lang.name,
        category: 'Programming Languages' as const
      }));
      migratedSkills = [...migratedSkills, ...programmingSkills];
    }

    // Handle legacy spoken languages data
    if (importedData.languages && importedData.languages.length > 0) {
      const languageSkills = importedData.languages.map(lang => ({
        id: `lang-${lang.id}`,
        name: lang.name,
        category: 'Spoken Languages' as const
      }));
      migratedSkills = [...migratedSkills, ...languageSkills];
    }

    // Update state with migrated data
    setResumeData(prev => ({
      ...prev,
      ...importedData,
      skills: migratedSkills,
      // Ensure arrays are properly set with fallbacks
      education: importedData.education || prev.education,
      experience: importedData.experience || prev.experience,
      projects: importedData.projects || prev.projects,
      certifications: importedData.certifications || prev.certifications,
      languages: [], // Clear legacy data as we've migrated to skills
      programmingLanguages: [], // Clear legacy data as we've migrated to skills
      interests: importedData.interests || prev.interests,
      customSections: importedData.customSections || prev.customSections
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Application Header - Navigation and controls */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Resume Builder - By Biswajit Dash</h1>
            <div className="flex items-center space-x-3">
              {/* Mobile preview toggle - only visible on mobile */}
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="md:hidden">
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              
              {/* Action buttons */}
              <Button onClick={handleSave} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleExportPDF} size="sm">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              
              {/* Dark mode toggle */}
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-4">
          {/* Resume Controls - Font size and import/export */}
          <ResumeControls
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onImportResume={handleImportResume}
          />

          {/* Two-column layout: Forms on left, Preview on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Form Section - Contains all input forms */}
            <div className={`space-y-4 ${showPreview ? 'block' : 'hidden'} lg:block`}>
              
              {/* Personal Information Form */}
              <Card className="p-4">
                <PersonalInfoForm data={resumeData.personalInfo} onChange={data => updateResumeData('personalInfo', data)} />
              </Card>

              {/* Profile Picture Upload */}
              <Card className="p-4">
                <ProfilePictureForm data={resumeData.profilePicture} onChange={data => updateResumeData('profilePicture', data)} />
              </Card>

              {/* Professional Summary */}
              <Card className="p-4">
                <SummaryForm data={resumeData.summary} onChange={data => updateResumeData('summary', data)} />
              </Card>

              {/* Education Section */}
              <Card className="p-4">
                <EducationForm data={resumeData.education} onChange={data => updateResumeData('education', data)} />
              </Card>

              {/* Work Experience Section */}
              <Card className="p-4">
                <ExperienceForm data={resumeData.experience} onChange={data => updateResumeData('experience', data)} />
              </Card>

              {/* Projects Section */}
              <Card className="p-4">
                <ProjectsForm data={resumeData.projects} onChange={data => updateResumeData('projects', data)} />
              </Card>

              {/* Skills Section - Categorized skills */}
              <Card className="p-4">
                <SkillsForm data={resumeData.skills} onChange={data => updateResumeData('skills', data)} />
              </Card>

              {/* Certifications and Awards */}
              <Card className="p-4">
                <CertificationsForm data={resumeData.certifications} onChange={data => updateResumeData('certifications', data)} />
              </Card>

              {/* Interests and Hobbies */}
              <Card className="p-4">
                <InterestsForm data={resumeData.interests} onChange={data => updateResumeData('interests', data)} />
              </Card>

              {/* Custom Sections - User-defined sections */}
              <Card className="p-4">
                <CustomSectionsForm data={resumeData.customSections} onChange={data => updateResumeData('customSections', data)} />
              </Card>
            </div>

            {/* Preview Section - Live resume preview */}
            <div className={`sticky top-4 ${!showPreview ? 'block' : 'hidden'} lg:block`}>
              {/* Page overflow warning for multi-page resumes */}
              <PageOverflowWarning 
                onPageCountChange={setPageCount}
                currentPageCount={pageCount}
              />
              
              {/* Live resume preview */}
              <ResumePreview 
                data={resumeData} 
                fontSize={fontSize} 
                pageCount={pageCount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Application Footer */}
      <Footer />
    </div>
  );
};
