
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SummaryFormProps {
  data: string;
  onChange: (data: string) => void;
}

/**
 * Professional Summary Form Component
 * 
 * Allows users to write a professional summary or objective statement.
 * This section appears prominently at the top of the resume and should
 * be a concise 2-3 sentence overview of qualifications and career goals.
 * 
 * Best practices:
 * - Keep it concise (2-3 sentences)
 * - Focus on key qualifications
 * - Highlight career goals
 * - Use action words and specific achievements
 */
export const SummaryForm: React.FC<SummaryFormProps> = ({
  data,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">PROFESSIONAL SUMMARY</h3>
      
      <div>
        <Label htmlFor="summary">Summary or Objective</Label>
        <Textarea 
          id="summary" 
          value={data} 
          onChange={e => onChange(e.target.value)} 
          placeholder="Write a brief professional summary or objective statement..." 
          rows={4} 
        />
        <p className="text-sm text-muted-foreground mt-1">
          2-3 sentences highlighting your key qualifications and career goals.
        </p>
      </div>
    </div>
  );
};
