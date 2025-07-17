
import React, { useState, useRef } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfilePictureFormProps {
  data: string;
  onChange: (data: string) => void;
}

export const ProfilePictureForm: React.FC<ProfilePictureFormProps> = ({ data, onChange }) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, JPEG, or PNG file.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    setError('');
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Profile Picture</h3>
      
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Profile pictures may be removed by ATS systems. Use only if required by the employer.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {data ? (
          <div className="flex items-center gap-4">
            <img 
              src={data} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="space-y-2">
              <Button onClick={triggerUpload} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <Button onClick={removePhoto} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <X className="h-4 w-4 mr-2" />
                Remove Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <Label className="cursor-pointer">
              <span className="text-sm text-gray-600">Click to upload profile picture</span>
              <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG up to 5MB</p>
            </Label>
            <Button onClick={triggerUpload} variant="outline" size="sm" className="mt-2">
              Choose File
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
