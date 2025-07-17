import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Education } from '../../types/resume';
interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}
export const EducationForm: React.FC<EducationFormProps> = ({
  data,
  onChange
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      cgpa: '',
      description: ''
    };
    onChange([...data, newEducation]);
    setOpenItems([...openItems, newEducation.id]);
  };
  const removeEducation = (id: string) => {
    onChange(data.filter(edu => edu.id !== id));
    setOpenItems(openItems.filter(item => item !== id));
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(data.map(edu => edu.id === id ? {
      ...edu,
      [field]: value
    } : edu));
  };
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">EDUCATION</h3>
        <Button onClick={addEducation} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      <div className="space-y-3">
        {data.map(education => <Collapsible key={education.id} open={openItems.includes(education.id)} onOpenChange={() => toggleItem(education.id)}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <div className="flex items-center">
                      {openItems.includes(education.id) ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      <span className="font-medium">
                        {education.institution || 'New Education'}
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" size="sm" onClick={() => removeEducation(education.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`institution-${education.id}`}>Institution *</Label>
                    <Input id={`institution-${education.id}`} value={education.institution} onChange={e => updateEducation(education.id, 'institution', e.target.value)} placeholder="University of Example" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`degree-${education.id}`}>Degree *</Label>
                      <Input id={`degree-${education.id}`} value={education.degree} onChange={e => updateEducation(education.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                    </div>
                    <div>
                      <Label htmlFor={`field-${education.id}`}>Field of Study *</Label>
                      <Input id={`field-${education.id}`} value={education.fieldOfStudy} onChange={e => updateEducation(education.id, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`start-${education.id}`}>Start Date</Label>
                      <Input id={`start-${education.id}`} type="month" value={education.startDate} onChange={e => updateEducation(education.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`end-${education.id}`}>End Date</Label>
                      <Input id={`end-${education.id}`} type="month" value={education.endDate} onChange={e => updateEducation(education.id, 'endDate', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`cgpa-${education.id}`}>CGPA (Optional)</Label>
                      <Input id={`cgpa-${education.id}`} value={education.cgpa} onChange={e => updateEducation(education.id, 'cgpa', e.target.value)} placeholder="3.8/4.0" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`description-${education.id}`}>Description (Optional)</Label>
                    <Textarea id={`description-${education.id}`} value={education.description} onChange={e => updateEducation(education.id, 'description', e.target.value)} placeholder="Relevant coursework, achievements, honors..." rows={3} />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>)}
      </div>
    </div>;
};