'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllPractices } from '@/lib/services/practiceDirectoryService';
import { Practice } from '@/types/practice';

export type PracticeSelection = 
  | { type: 'existing'; practiceId: string }
  | { type: 'new'; practiceName: string; website?: string };

interface PracticeSelectionSectionProps {
  value?: PracticeSelection;
  onChange: (selection: PracticeSelection | null) => void;
  disabled?: boolean;
  preselectedPracticeId?: string;
}

export function PracticeSelectionSection({
  value,
  onChange,
  disabled = false,
  preselectedPracticeId,
}: PracticeSelectionSectionProps) {
  const [selectionType, setSelectionType] = useState<'existing' | 'new'>(
    value?.type || (preselectedPracticeId ? 'existing' : 'existing')
  );
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(
    value?.type === 'existing' ? value.practiceId : preselectedPracticeId || ''
  );
  const [newPracticeName, setNewPracticeName] = useState<string>(
    value?.type === 'new' ? value.practiceName : ''
  );
  const [newPracticeWebsite, setNewPracticeWebsite] = useState<string>(
    value?.type === 'new' ? value.website || '' : ''
  );
  const [practices, setPractices] = useState<Practice[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load practices on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allPractices = getAllPractices();
      setPractices(allPractices);
    }
  }, []);

  // Handle preselected practice
  useEffect(() => {
    if (preselectedPracticeId && !value) {
      setSelectionType('existing');
      setSelectedPracticeId(preselectedPracticeId);
      onChange({ type: 'existing', practiceId: preselectedPracticeId });
    }
  }, [preselectedPracticeId, value, onChange]);

  // Update parent when selection changes
  useEffect(() => {
    if (selectionType === 'existing' && selectedPracticeId) {
      onChange({ type: 'existing', practiceId: selectedPracticeId });
      setErrors({});
    } else if (selectionType === 'new' && newPracticeName.trim()) {
      onChange({
        type: 'new',
        practiceName: newPracticeName.trim(),
        website: newPracticeWebsite.trim() || undefined,
      });
      // Validate new practice name
      if (newPracticeName.trim().length < 2) {
        setErrors({ practiceName: 'Practice name must be at least 2 characters' });
      } else {
        setErrors({});
      }
    } else {
      onChange(null);
    }
  }, [selectionType, selectedPracticeId, newPracticeName, newPracticeWebsite, onChange]);

  const handleTypeChange = (newType: 'existing' | 'new') => {
    setSelectionType(newType);
    setErrors({});
    if (newType === 'existing') {
      setNewPracticeName('');
      setNewPracticeWebsite('');
    } else {
      setSelectedPracticeId('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Practice Selection <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Select an existing practice to join, or create a new practice.
        </p>
      </div>

      <RadioGroup
        value={selectionType}
        onValueChange={(val) => handleTypeChange(val as 'existing' | 'new')}
        disabled={disabled || !!preselectedPracticeId}
        className="space-y-4"
      >
        {/* Option 1: Select Existing Practice */}
        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="existing" id="existing" className="mt-1" />
          <div className="flex-1 space-y-3">
            <Label htmlFor="existing" className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Join an existing practice</span>
            </Label>
            {selectionType === 'existing' && (
              <div className="ml-6 space-y-2">
                <Select
                  value={selectedPracticeId}
                  onValueChange={(val) => {
                    setSelectedPracticeId(val);
                    setErrors({});
                  }}
                  disabled={disabled || !!preselectedPracticeId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a practice" />
                  </SelectTrigger>
                  <SelectContent>
                    {practices.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No practices available
                      </SelectItem>
                    ) : (
                      practices.map((practice) => (
                        <SelectItem key={practice.id} value={practice.id}>
                          {practice.name}
                          {practice.address?.city && practice.address?.state && (
                            <span className="text-muted-foreground ml-2">
                              ({practice.address.city}, {practice.address.state})
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {preselectedPracticeId && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Practice preselected via invitation link
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  This will create a <strong>doctor_join_practice</strong> request that requires
                  approval from both the Practice Admin and System Admin.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Option 2: Create New Practice */}
        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="new" id="new" className="mt-1" />
          <div className="flex-1 space-y-3">
            <Label htmlFor="new" className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Create a new practice</span>
            </Label>
            {selectionType === 'new' && (
              <div className="ml-6 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="newPracticeName">
                    Practice Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="newPracticeName"
                    value={newPracticeName}
                    onChange={(e) => {
                      setNewPracticeName(e.target.value);
                      if (errors.practiceName) setErrors({ ...errors, practiceName: '' });
                    }}
                    placeholder="Smith Medical Group"
                    disabled={disabled}
                    className={errors.practiceName ? 'border-destructive' : ''}
                  />
                  {errors.practiceName && (
                    <p className="text-sm text-destructive">{errors.practiceName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPracticeWebsite">Website (Optional)</Label>
                  <Input
                    id="newPracticeWebsite"
                    type="url"
                    value={newPracticeWebsite}
                    onChange={(e) => setNewPracticeWebsite(e.target.value)}
                    placeholder="https://www.example.com"
                    disabled={disabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will create a <strong>new_practice_with_admin_doctor</strong> request that
                  requires approval from System Admin only. You will become the Practice Admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
