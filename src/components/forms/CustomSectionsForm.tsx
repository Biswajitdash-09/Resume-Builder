
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomSection } from '../../types/resume';

interface CustomSectionsFormProps {
  data: CustomSection[];
  onChange: (data: CustomSection[]) => void;
}

export const CustomSectionsForm: React.FC<CustomSectionsFormProps> = ({ data, onChange }) => {
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addSection = () => {
    if (newSectionTitle.trim()) {
      const newSection: CustomSection = {
        id: Date.now().toString(),
        title: newSectionTitle.trim(),
        content: ''
      };
      onChange([...data, newSection]);
      setNewSectionTitle('');
      setShowAddForm(false);
    }
  };

  const removeSection = (id: string) => {
    onChange(data.filter(section => section.id !== id));
  };

  const updateSection = (id: string, field: keyof CustomSection, value: string) => {
    onChange(data.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newData.length) {
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      onChange(newData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Sections</h3>
        <Button 
          onClick={() => setShowAddForm(true)} 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Section
        </Button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <Label htmlFor="sectionTitle">Section Title</Label>
              <Input
                id="sectionTitle"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g., Volunteer Experience, Publications, Awards"
                onKeyPress={(e) => e.key === 'Enter' && addSection()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addSection} size="sm">Add Section</Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data.map((section, index) => (
          <div key={section.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === data.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="Enter section content (supports bullet points with • or -)"
                    rows={4}
                  />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(section.id)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
