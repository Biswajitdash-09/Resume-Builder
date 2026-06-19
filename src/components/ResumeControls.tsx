
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResumeData } from '../types/resume';
import { extractTextFromPDF, extractTextFromDOCX, parseResumeText } from '../utils/resumeParser';

interface ResumeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  template: string;
  onTemplateChange: (template: string) => void;
  onImportResume: (data: any) => void;
  resumeData: ResumeData;
}

export const ResumeControls: React.FC<ResumeControlsProps> = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  template,
  onTemplateChange,
  onImportResume,
  resumeData
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
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            onImportResume(data);
            toast({
              title: "Resume Data Imported",
              description: "JSON configuration loaded successfully."
            });
          } catch (err) {
            console.error(err);
            toast({
              title: "Import Failed",
              description: "Invalid JSON format in the uploaded file.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      } else if (fileName.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = await extractTextFromPDF(arrayBuffer);
            const parsedData = parseResumeText(text);
            onImportResume(parsedData);
            toast({
              title: "PDF Resume Parsed",
              description: "Extracted information from PDF successfully!"
            });
          } catch (err) {
            console.error(err);
            toast({
              title: "PDF Parsing Failed",
              description: "Could not extract data from the PDF file. Please ensure the PDF has selectable text.",
              variant: "destructive"
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = await extractTextFromDOCX(arrayBuffer);
            const parsedData = parseResumeText(text);
            onImportResume(parsedData);
            toast({
              title: "Word Resume Parsed",
              description: "Extracted information from Word document successfully!"
            });
          } catch (err) {
            console.error(err);
            toast({
              title: "Word Parsing Failed",
              description: "Could not extract data from the Word file.",
              variant: "destructive"
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          title: "Unsupported File",
          description: "Please upload a .pdf, .docx, .doc, or .json file.",
          variant: "destructive"
        });
      }
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

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(resumeData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const firstName = resumeData.personalInfo?.firstName || 'Resume';
      const lastName = resumeData.personalInfo?.lastName || 'Data';
      const exportFileDefaultName = `${firstName}_${lastName}_resume_data.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Data Exported",
        description: "Your resume data JSON has been downloaded successfully!"
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast({
        title: "Export Failed",
        description: "Could not export resume data.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-2 sm:p-4 mb-3 sm:mb-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        {/* Font Size Controls */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Font Size:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeDecrease}
            disabled={fontSize <= 8}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs sm:text-sm min-w-[3rem] text-center">{fontSize}px</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFontSizeIncrease}
            disabled={fontSize >= 20}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Font Family Selector */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Font Family:</span>
          <select 
            value={fontFamily} 
            onChange={e => onFontFamilyChange(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="inter">Inter (Sans)</option>
            <option value="poppins">Poppins (Sans)</option>
            <option value="montserrat">Montserrat (Sans)</option>
            <option value="outfit">Outfit (Sans)</option>
            <option value="lora">Lora (Serif)</option>
            <option value="playfair">Playfair Display (Serif)</option>
            <option value="mono">JetBrains Mono (Mono)</option>
          </select>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Template:</span>
          <select 
            value={template} 
            onChange={e => onTemplateChange(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="classic">Classic (Centered)</option>
            <option value="modern">Modern Professional</option>
            <option value="minimalist">Minimalist</option>
            <option value="two-column">Creative (Two-Column)</option>
          </select>
        </div>

        {/* Resume Import */}
        <div className="flex items-center justify-center sm:justify-start">
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              asChild
              className="h-8 px-3"
            >
              <span>
                {isImporting ? (
                  <FileText className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3 mr-2" />
                )}
                <span className="text-xs sm:text-sm">
                  {isImporting ? 'Importing...' : 'Import Resume'}
                </span>
              </span>
            </Button>
          </label>
          <Input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Resume Export JSON */}
        <div className="flex items-center justify-center sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="h-8 px-3"
          >
            <Download className="h-3 w-3 mr-2" />
            <span className="text-xs sm:text-sm">Export Data</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
