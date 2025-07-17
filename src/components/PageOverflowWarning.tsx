
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PageOverflowWarningProps {
  onPageCountChange?: (pageCount: number) => void;
  currentPageCount?: number;
}

export const PageOverflowWarning: React.FC<PageOverflowWarningProps> = ({ 
  onPageCountChange, 
  currentPageCount = 1 
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const resumeElement = document.querySelector('.resume-preview');
      if (resumeElement) {
        const height = resumeElement.scrollHeight;
        // A4 height at 96 DPI is approximately 1123px, with margins it's around 1000px
        const maxHeight = 1000 * currentPageCount;
        setIsOverflowing(height > maxHeight);
      }
    };

    // Check overflow on mount and when content changes
    checkOverflow();
    
    // Set up a MutationObserver to watch for changes
    const resumeElement = document.querySelector('.resume-preview');
    if (resumeElement) {
      const observer = new MutationObserver(checkOverflow);
      observer.observe(resumeElement, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => observer.disconnect();
    }
  }, [currentPageCount]);

  const handlePageCountChange = (value: string) => {
    const pageCount = parseInt(value, 10);
    onPageCountChange?.(pageCount);
  };

  if (!isOverflowing) return null;

  return (
    <Alert className="border-red-200 bg-red-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex flex-col gap-3">
          <p className="font-medium">
            ⚠️ Warning: Resume content is exceeding the current page limit!
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm">Choose number of pages:</span>
            <Select value={currentPageCount.toString()} onValueChange={handlePageCountChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-red-600">
              Or consider reducing content/font size for better readability.
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
