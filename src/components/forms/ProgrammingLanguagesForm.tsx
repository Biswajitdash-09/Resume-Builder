
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgrammingLanguage } from '../../types/resume';

interface ProgrammingLanguagesFormProps {
  data: ProgrammingLanguage[];
  onChange: (data: ProgrammingLanguage[]) => void;
}

const commonLanguages = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'React', 'Vue.js', 'Angular'
];

export const ProgrammingLanguagesForm: React.FC<ProgrammingLanguagesFormProps> = ({ data, onChange }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState<ProgrammingLanguage['level']>('Intermediate');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addLanguage = (languageName?: string) => {
    const name = languageName || newLanguage.trim();
    if (name && !data.some(lang => lang.name.toLowerCase() === name.toLowerCase())) {
      const language: ProgrammingLanguage = {
        id: Date.now().toString(),
        name: name,
        level: newLevel
      };
      onChange([...data, language]);
      setNewLanguage('');
      setShowSuggestions(false);
    }
  };

  const removeLanguage = (id: string) => {
    onChange(data.filter(lang => lang.id !== id));
  };

  const updateLanguage = (id: string, field: keyof ProgrammingLanguage, value: string) => {
    onChange(data.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const filteredSuggestions = commonLanguages.filter(lang => 
    lang.toLowerCase().includes(newLanguage.toLowerCase()) &&
    !data.some(existing => existing.name.toLowerCase() === lang.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🖥️ Programming Languages</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Label htmlFor="programmingLanguage">Programming Language</Label>
          <Input
            id="programmingLanguage"
            value={newLanguage}
            onChange={(e) => {
              setNewLanguage(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
            placeholder="e.g., JavaScript, Python, Java"
          />
          
          {showSuggestions && filteredSuggestions.length > 0 && newLanguage && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((lang) => (
                <button
                  key={lang}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  onClick={() => addLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Label>Proficiency Level</Label>
          <Select value={newLevel} onValueChange={(value) => setNewLevel(value as ProgrammingLanguage['level'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={() => addLanguage()} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Programming Language
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
                value={language.level}
                onValueChange={(value) => updateLanguage(language.id, 'level', value as ProgrammingLanguage['level'])}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
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
