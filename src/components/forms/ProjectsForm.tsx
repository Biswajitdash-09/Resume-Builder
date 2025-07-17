
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Project } from '../../types/resume';

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  data,
  onChange
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      startDate: '',
      endDate: ''
    };
    onChange([...data, newProject]);
    setOpenItems([...openItems, newProject.id]);
  };

  const removeProject = (id: string) => {
    onChange(data.filter(proj => proj.id !== id));
    setOpenItems(openItems.filter(item => item !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    onChange(data.map(proj => proj.id === id ? {
      ...proj,
      [field]: value
    } : proj));
  };

  const addTechnology = (id: string, tech: string) => {
    const project = data.find(p => p.id === id);
    if (project && tech.trim() && !project.technologies.includes(tech.trim())) {
      updateProject(id, 'technologies', [...project.technologies, tech.trim()]);
    }
  };

  const removeTechnology = (id: string, tech: string) => {
    const project = data.find(p => p.id === id);
    if (project) {
      updateProject(id, 'technologies', project.technologies.filter(t => t !== tech));
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PROJECTS</h3>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="space-y-3">
        {data.map(project => (
          <Collapsible key={project.id} open={openItems.includes(project.id)} onOpenChange={() => toggleItem(project.id)}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <div className="flex items-center">
                      {openItems.includes(project.id) ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      <span className="font-medium">
                        {project.name || 'New Project'}
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`name-${project.id}`}>Project Name *</Label>
                    <Input id={`name-${project.id}`} value={project.name} onChange={e => updateProject(project.id, 'name', e.target.value)} placeholder="My Awesome Project" />
                  </div>

                  <div>
                    <Label htmlFor={`description-${project.id}`}>Description *</Label>
                    <Textarea id={`description-${project.id}`} value={project.description} onChange={e => updateProject(project.id, 'description', e.target.value)} placeholder="Brief description of the project, its purpose, and key features..." rows={3} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`start-${project.id}`}>Start Date</Label>
                      <Input id={`start-${project.id}`} type="month" value={project.startDate} onChange={e => updateProject(project.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`end-${project.id}`}>End Date (Optional)</Label>
                      <Input id={`end-${project.id}`} type="month" value={project.endDate} onChange={e => updateProject(project.id, 'endDate', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`link-${project.id}`}>Live Demo Link</Label>
                      <Input id={`link-${project.id}`} value={project.link} onChange={e => updateProject(project.id, 'link', e.target.value)} placeholder="https://myproject.com" />
                    </div>
                    <div>
                      <Label htmlFor={`github-${project.id}`}>GitHub Repository</Label>
                      <Input id={`github-${project.id}`} value={project.github} onChange={e => updateProject(project.id, 'github', e.target.value)} placeholder="https://github.com/username/repo" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`tech-${project.id}`}>Technologies Used</Label>
                    <Input id={`tech-${project.id}`} placeholder="Type a technology and press Enter" onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology(project.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <Button variant="ghost" size="sm" onClick={() => removeTechnology(project.id, tech)} className="h-auto p-0 ml-1 hover:bg-transparent">
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
