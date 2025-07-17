import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Certification } from '../../types/resume';
interface CertificationsFormProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}
export const CertificationsForm: React.FC<CertificationsFormProps> = ({
  data,
  onChange
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      link: ''
    };
    onChange([...data, newCertification]);
    setOpenItems([...openItems, newCertification.id]);
  };
  const removeCertification = (id: string) => {
    onChange(data.filter(cert => cert.id !== id));
    setOpenItems(openItems.filter(item => item !== id));
  };
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    onChange(data.map(cert => cert.id === id ? {
      ...cert,
      [field]: value
    } : cert));
  };
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">CERTIFICATIONS AND AWARDS</h3>
        <Button onClick={addCertification} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      <div className="space-y-3">
        {data.map(certification => <Collapsible key={certification.id} open={openItems.includes(certification.id)} onOpenChange={() => toggleItem(certification.id)}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <div className="flex items-center">
                      {openItems.includes(certification.id) ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      <span className="font-medium">
                        {certification.name || 'New Certification'}
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" size="sm" onClick={() => removeCertification(certification.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`name-${certification.id}`}>Certification Name *</Label>
                    <Input id={`name-${certification.id}`} value={certification.name} onChange={e => updateCertification(certification.id, 'name', e.target.value)} placeholder="AWS Certified Solutions Architect" />
                  </div>

                  <div>
                    <Label htmlFor={`issuer-${certification.id}`}>Issuing Organization *</Label>
                    <Input id={`issuer-${certification.id}`} value={certification.issuer} onChange={e => updateCertification(certification.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`date-${certification.id}`}>Issue Date</Label>
                      <Input id={`date-${certification.id}`} type="month" value={certification.date} onChange={e => updateCertification(certification.id, 'date', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`expiry-${certification.id}`}>Expiry Date (Optional)</Label>
                      <Input id={`expiry-${certification.id}`} type="month" value={certification.expiryDate} onChange={e => updateCertification(certification.id, 'expiryDate', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`credential-${certification.id}`}>Credential ID (Optional)</Label>
                    <Input id={`credential-${certification.id}`} value={certification.credentialId} onChange={e => updateCertification(certification.id, 'credentialId', e.target.value)} placeholder="ABC123DEF456" />
                  </div>

                  <div>
                    <Label htmlFor={`link-${certification.id}`}>Credential Link (Optional)</Label>
                    <Input id={`link-${certification.id}`} value={certification.link} onChange={e => updateCertification(certification.id, 'link', e.target.value)} placeholder="https://www.credly.com/badges/..." />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>)}
      </div>
    </div>;
};