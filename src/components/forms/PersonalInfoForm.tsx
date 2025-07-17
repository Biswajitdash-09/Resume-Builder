
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonalInfo } from '../../types/resume';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

/**
 * Personal Information Form Component
 * 
 * Handles collection of basic personal and contact information.
 * This is typically the first section users fill out.
 * 
 * Required fields:
 * - First Name, Last Name, Email, Phone
 * 
 * Optional fields:
 * - LinkedIn, GitHub, Address
 */
export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  data,
  onChange
}) => {
  /**
   * Handle input changes for any personal info field
   * @param field - The field being updated
   * @param value - New value for the field
   */
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">PERSONAL INFORMATION</h3>
      
      {/* Name fields - side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName" 
            value={data.firstName} 
            onChange={e => handleChange('firstName', e.target.value)} 
            placeholder="John" 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input 
            id="lastName" 
            value={data.lastName} 
            onChange={e => handleChange('lastName', e.target.value)} 
            placeholder="Doe" 
            required 
          />
        </div>
      </div>

      {/* Contact information fields */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email" 
          type="email" 
          value={data.email} 
          onChange={e => handleChange('email', e.target.value)} 
          placeholder="john.doe@email.com" 
          required 
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input 
          id="phone" 
          value={data.phone} 
          onChange={e => handleChange('phone', e.target.value)} 
          placeholder="+1 (555) 123-4567" 
          required 
        />
      </div>

      {/* Social media and professional profiles */}
      <div>
        <Label htmlFor="linkedin">LinkedIn Profile</Label>
        <Input 
          id="linkedin" 
          value={data.linkedin} 
          onChange={e => handleChange('linkedin', e.target.value)} 
          placeholder="linkedin.com/in/johndoe" 
        />
      </div>

      <div>
        <Label htmlFor="github">GitHub Profile</Label>
        <Input 
          id="github" 
          value={data.github} 
          onChange={e => handleChange('github', e.target.value)} 
          placeholder="github.com/johndoe" 
        />
      </div>

      {/* Address information */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          value={data.address} 
          onChange={e => handleChange('address', e.target.value)} 
          placeholder="City, State, Country" 
        />
      </div>
    </div>
  );
};
