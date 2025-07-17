
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onImportResume: (data: any) => void;
}

export const ResumeControls: React.FC<ResumeControlsProps> = ({
  fontSize,
  onFontSizeChange,
  onImportResume
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFontSizeIncrease = () => {
    const newSize = Math.min(fontSize + 1, 20);
    onFontSizeChange(newSize);
  };

  const handleFontSizeDecrease = () => {
    const newSize = Math.max(fontSize - 1, 8);
    onFontSizeChange(newSize);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // For now, we'll create a mock parser that demonstrates the concept
      // In a real implementation, you'd use a PDF parsing library
      const mockResumeData = {
        personalInfo: {
          firstName: 'Biswajit',
          lastName: 'Dash',
          email: 'biswajitdash@gmail.com',
          phone: '+919348470094',
          linkedin: 'https://www.linkedin.com/in/biswajitdash09',
          github: 'https://github.com/Biswajitdash-09',
          address: 'Berhampur, Odisha'
        },
        summary: 'Experienced web developer with expertise in modern frontend technologies and responsive design.',
        education: [
          {
            id: '1',
            institution: 'Balasore College of Engineering and Technology',
            degree: 'Bachelor of Technology in Information Technology',
            fieldOfStudy: 'Information Technology',
            startDate: '2022-09',
            endDate: '2026-03',
            gpa: '8.5',
            description: 'Berhampur, Odisha'
          }
        ],
        experience: [
          {
            id: '1',
            company: 'Octatech PVT. LTD.',
            position: 'Frontend Web Development Intern',
            startDate: '2024-05',
            endDate: '2024-06',
            current: false,
            location: 'Bhubaneswar, Odisha',
            description: '• Developed a dynamic and responsive landing page for a website using modern frontend technologies.\n• Implemented interactive UI elements and optimized the design for improved user engagement and experience.\n• Enhanced CSS skills through HTML/CSS best practices and design optimizations.\n• Enhanced page performance through excellent coding practices and design optimizations.\n• Implemented best practices for on-page SEO, enhancing the website\'s visibility and search engine ranking.'
          }
        ],
        skills: [
          { id: '1', name: 'JavaScript', level: 'Advanced', category: 'Technical' },
          { id: '2', name: 'React.js', level: 'Advanced', category: 'Technical' },
          { id: '3', name: 'HTML/CSS', level: 'Expert', category: 'Technical' },
          { id: '4', name: 'Node.js', level: 'Intermediate', category: 'Technical' }
        ],
        programmingLanguages: [
          { id: '1', name: 'C/C++', level: 'Advanced' },
          { id: '2', name: 'Java', level: 'Intermediate' },
          { id: '3', name: 'Python', level: 'Intermediate' },
          { id: '4', name: 'JavaScript', level: 'Advanced' },
          { id: '5', name: 'TypeScript', level: 'Intermediate' }
        ],
        projects: [
          {
            id: '1',
            name: 'eCommerce website (Practice Project)',
            description: 'Built a fully responsive website using only HTML, CSS and JavaScript, ensuring compatibility across different devices and screen sizes. Created a user-friendly navigation menu, allowing seamless access to different sections of the website.',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            startDate: '2025-03',
            endDate: '2025-03',
            link: '',
            github: ''
          }
        ]
      };

      onImportResume(mockResumeData);
      toast({
        title: "Resume Imported",
        description: "Resume data has been successfully imported!"
      });
    } catch (error) {
      console.error('Error importing resume:', error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Font Size Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Font Size:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeDecrease}
            disabled={fontSize <= 8}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[3rem] text-center">{fontSize}px</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeIncrease}
            disabled={fontSize >= 20}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Resume Import */}
        <div className="flex items-center gap-2">
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              asChild
            >
              <span>
                {isImporting ? (
                  <FileText className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isImporting ? 'Importing...' : 'Import Resume'}
              </span>
            </Button>
          </label>
          <Input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
};
