import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skill } from '../../types/resume';
interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}
const commonProgrammingLanguages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS'];
const commonFrameworks = ['React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'Next.js', 'Nuxt.js', 'Svelte', 'Flutter', 'React Native'];
const commonDevTools = ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Azure', 'Google Cloud', 'VS Code', 'IntelliJ IDEA', 'Eclipse', 'Postman', 'Jira', 'Slack', 'Figma', 'Adobe XD'];
export const SkillsForm: React.FC<SkillsFormProps> = ({
  data,
  onChange
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState<Skill['category']>('Technical Subjects');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addSkill = (skillName?: string) => {
    const name = skillName || newSkill.trim();
    if (name && !data.some(skill => skill.name.toLowerCase() === name.toLowerCase())) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: name,
        category: newCategory
      };
      onChange([...data, skill]);
      setNewSkill('');
      setShowSuggestions(false);
    }
  };
  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };
  const getSuggestions = () => {
    switch (newCategory) {
      case 'Programming Languages':
        return commonProgrammingLanguages;
      case 'Frameworks':
        return commonFrameworks;
      case 'Dev Tools':
        return commonDevTools;
      default:
        return [];
    }
  };
  const suggestions = getSuggestions();
  const filteredSuggestions = suggestions.filter(item => item.toLowerCase().includes(newSkill.toLowerCase()) && !data.some(existing => existing.name.toLowerCase() === item.toLowerCase()));
  const groupedSkills = data.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
  const categoryOrder: Skill['category'][] = ['Technical Subjects', 'Programming Languages', 'Spoken Languages', 'Soft Skills', 'Frameworks', 'Dev Tools'];
  return <div className="space-y-4">
      <h3 className="text-lg font-semibold">SKILLS</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Label htmlFor="skillName">Skill Name</Label>
          <Input id="skillName" value={newSkill} onChange={e => {
          setNewSkill(e.target.value);
          setShowSuggestions(true);
        }} onFocus={() => setShowSuggestions(true)} onKeyPress={handleKeyPress} placeholder="e.g., JavaScript, Leadership, Spanish" />
          
          {showSuggestions && filteredSuggestions.length > 0 && newSkill && <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map(item => <button key={item} className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm" onClick={() => addSkill(item)}>
                  {item}
                </button>)}
            </div>}
        </div>
        
        <div>
          <Label>Category</Label>
          <Select value={newCategory} onValueChange={value => setNewCategory(value as Skill['category'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technical Subjects">Technical Subjects</SelectItem>
              <SelectItem value="Programming Languages">Programming Languages</SelectItem>
              <SelectItem value="Spoken Languages">Spoken Languages</SelectItem>
              <SelectItem value="Soft Skills">Soft Skills</SelectItem>
              <SelectItem value="Frameworks">Frameworks</SelectItem>
              <SelectItem value="Dev Tools">Dev Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={() => addSkill()} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>

      <div className="space-y-4">
        {categoryOrder.map(category => {
        const categorySkills = groupedSkills[category];
        if (!categorySkills || categorySkills.length === 0) return null;
        return <div key={category}>
              <h4 className="font-medium mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map(skill => <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                    {skill.name}
                    <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)} className="h-auto p-0 ml-1 hover:bg-transparent">
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>)}
              </div>
            </div>;
      })}
      </div>
    </div>;
};