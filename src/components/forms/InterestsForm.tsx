
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Interest } from '../../types/resume';

interface InterestsFormProps {
  data: Interest[];
  onChange: (data: Interest[]) => void;
}

/**
 * Interests and Hobbies Form Component
 * 
 * Allows users to add personal interests and hobbies to their resume.
 * This section is optional but can help humanize a candidate and
 * provide conversation starters during interviews.
 * 
 * Features:
 * - Dynamic addition/removal of interests
 * - Visual badge display for easy scanning
 * - Keyboard shortcut (Enter) for quick addition
 * 
 * Best practices:
 * - Include relevant interests that might relate to the job
 * - Show personality while maintaining professionalism
 * - Avoid controversial topics
 */
export const InterestsForm: React.FC<InterestsFormProps> = ({
  data,
  onChange
}) => {
  // Local state for the input field
  const [newInterest, setNewInterest] = useState('');

  /**
   * Add a new interest to the list
   * Validates that the interest is not empty and creates a unique ID
   */
  const addInterest = () => {
    if (newInterest.trim()) {
      const interest: Interest = {
        id: Date.now().toString(), // Simple unique ID generation
        name: newInterest.trim()
      };
      onChange([...data, interest]);
      setNewInterest(''); // Clear input after adding
    }
  };

  /**
   * Remove an interest from the list
   * @param id - ID of the interest to remove
   */
  const removeInterest = (id: string) => {
    onChange(data.filter(interest => interest.id !== id));
  };

  /**
   * Handle Enter key press for quick addition
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">INTERESTS & HOBBIES</h3>
      
      {/* Input section for adding new interests */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="interestName">Interests and hobbies</Label>
          <Input 
            id="interestName" 
            value={newInterest} 
            onChange={e => setNewInterest(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder="e.g., Photography, Hiking, Chess" 
          />
        </div>
        <Button onClick={addInterest} size="sm" className="mt-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Display existing interests as badges */}
      <div className="flex flex-wrap gap-2">
        {data.map(interest => (
          <Badge key={interest.id} variant="secondary" className="flex items-center gap-1">
            {interest.name}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeInterest(interest.id)} 
              className="h-auto p-0 ml-1 hover:bg-transparent"
              title="Remove interest"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Helpful guidance text */}
      <p className="text-sm text-muted-foreground">
        Optional section. Add interests that might be relevant to your target role or show your personality.
      </p>
    </div>
  );
};
