import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PageOverflowWarningProps {
  onPageCountChange?: (pageCount: number) => void;
  targetPageCount?: number;
  actualPageCount?: number;
}

export const PageOverflowWarning: React.FC<PageOverflowWarningProps> = ({ 
  onPageCountChange, 
  targetPageCount = 1,
  actualPageCount = 1
}) => {
  const isOverflowing = actualPageCount > targetPageCount;

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
            <Select value={targetPageCount.toString()} onValueChange={handlePageCountChange}>
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
