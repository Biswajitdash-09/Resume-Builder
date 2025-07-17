
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '../../types/resume';

interface LanguagesFormProps {
  data: Language[];
  onChange: (data: Language[]) => void;
}

export const LanguagesForm: React.FC<LanguagesFormProps> = ({ data, onChange }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState<Language['proficiency']>('Intermediate');

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const language: Language = {
        id: Date.now().toString(),
        name: newLanguage.trim(),
        proficiency: newProficiency
      };
      onChange([...data, language]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (id: string) => {
    onChange(data.filter(lang => lang.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    onChange(data.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLanguage();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Languages</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="languageName">Language</Label>
          <Input
            id="languageName"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Spanish, French, Mandarin"
          />
        </div>
        
        <div>
          <Label>Proficiency</Label>
          <Select value={newProficiency} onValueChange={(value) => setNewProficiency(value as Language['proficiency'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Elementary">Elementary</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Native">Native</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={addLanguage} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Language
      </Button>

      <div className="space-y-2">
        {data.map((language) => (
          <div key={language.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-4">
              <Input
                value={language.name}
                onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
                className="w-auto"
              />
              <Select
                value={language.proficiency}
                onValueChange={(value) => updateLanguage(language.id, 'proficiency', value as Language['proficiency'])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Native">Native</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeLanguage(language.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
