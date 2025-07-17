import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Experience } from '../../types/resume';
interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}
export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  data,
  onChange
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      location: ''
    };
    onChange([...data, newExperience]);
    setOpenItems([...openItems, newExperience.id]);
  };
  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
    setOpenItems(openItems.filter(item => item !== id));
  };
  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map(exp => exp.id === id ? {
      ...exp,
      [field]: value
    } : exp));
  };
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">WORK EXPERIENCE</h3>
        <Button onClick={addExperience} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-3">
        {data.map(experience => <Collapsible key={experience.id} open={openItems.includes(experience.id)} onOpenChange={() => toggleItem(experience.id)}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <div className="flex items-center">
                      {openItems.includes(experience.id) ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      <span className="font-medium">
                        {experience.position || 'New Position'}
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" size="sm" onClick={() => removeExperience(experience.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`company-${experience.id}`}>Company *</Label>
                      <Input id={`company-${experience.id}`} value={experience.company} onChange={e => updateExperience(experience.id, 'company', e.target.value)} placeholder="Company Name" />
                    </div>
                    <div>
                      <Label htmlFor={`position-${experience.id}`}>Position *</Label>
                      <Input id={`position-${experience.id}`} value={experience.position} onChange={e => updateExperience(experience.id, 'position', e.target.value)} placeholder="Software Engineer" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`location-${experience.id}`}>Location</Label>
                    <Input id={`location-${experience.id}`} value={experience.location} onChange={e => updateExperience(experience.id, 'location', e.target.value)} placeholder="City, State" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`start-${experience.id}`}>Start Date</Label>
                      <Input id={`start-${experience.id}`} type="month" value={experience.startDate} onChange={e => updateExperience(experience.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`end-${experience.id}`}>End Date</Label>
                      <Input id={`end-${experience.id}`} type="month" value={experience.endDate} onChange={e => updateExperience(experience.id, 'endDate', e.target.value)} disabled={experience.current} />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id={`current-${experience.id}`} checked={experience.current} onCheckedChange={checked => updateExperience(experience.id, 'current', checked as boolean)} />
                    <Label htmlFor={`current-${experience.id}`}>I currently work here</Label>
                  </div>

                  <div>
                    <Label htmlFor={`description-${experience.id}`}>Description *</Label>
                    <Textarea id={`description-${experience.id}`} value={experience.description} onChange={e => updateExperience(experience.id, 'description', e.target.value)} placeholder="• Developed and maintained web applications using React and Node.js&#10;• Collaborated with cross-functional teams to deliver high-quality products&#10;• Improved application performance by 30% through code optimization" rows={4} />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use bullet points to describe your key responsibilities and achievements.
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>)}
      </div>
    </div>;
};