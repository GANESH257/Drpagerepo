'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  const [practicesLoading, setPracticesLoading] = useState(true);
  const [practicesLoadError, setPracticesLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevSelectionRef = useRef<string>('');

  // Load practices from backend API on mount
  const loadPractices = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setPracticesLoading(true);
    setPracticesLoadError(null);
    try {
      const allPractices = await getAllPractices();
      setPractices(allPractices);
    } catch (error) {
      console.error('Error loading practices:', error);
      setPractices([]);
      setPracticesLoadError('Could not load practice list. You can still create a new practice.');
    } finally {
      setPracticesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  // Handle preselected practice (only once)
  useEffect(() => {
    if (preselectedPracticeId && !value) {
      setSelectionType('existing');
      setSelectedPracticeId(preselectedPracticeId);
      onChange({ type: 'existing', practiceId: preselectedPracticeId });
    }
  }, [preselectedPracticeId]); // Only run when preselectedPracticeId changes

  // Update parent when selection changes (only when internal state changes)
  useEffect(() => {
    let currentSelection: PracticeSelection | null = null;
    
    if (selectionType === 'existing' && selectedPracticeId && selectedPracticeId !== 'none' && selectedPracticeId !== '') {
      currentSelection = { type: 'existing', practiceId: selectedPracticeId };
    } else if (selectionType === 'new' && newPracticeName.trim()) {
      currentSelection = {
        type: 'new',
        practiceName: newPracticeName.trim(),
        website: newPracticeWebsite.trim() || undefined,
      };
    }

    // Create a key to compare selections
    const selectionKey = currentSelection
      ? currentSelection.type === 'existing' 
        ? `existing-${currentSelection.practiceId}`
        : `new-${currentSelection.practiceName}`
      : '';

    // Only call onChange if selection actually changed from our internal state
    if (currentSelection && selectionKey !== prevSelectionRef.current) {
      prevSelectionRef.current = selectionKey;
      onChange(currentSelection);
      setErrors({});
    }

    // Validate new practice name
    if (selectionType === 'new' && newPracticeName.trim()) {
      if (newPracticeName.trim().length < 2) {
        setErrors({ practiceName: 'Practice name must be at least 2 characters' });
      } else {
        setErrors({});
      }
    }
  }, [selectionType, selectedPracticeId, newPracticeName, newPracticeWebsite]); // Removed value and onChange from deps

  const handleTypeChange = (newType: 'existing' | 'new') => {
    setSelectionType(newType);
    setErrors({});
    if (newType === 'existing') {
      setNewPracticeName('');
      setNewPracticeWebsite('');
      // Don't clear selectedPracticeId if it was preselected
      if (!preselectedPracticeId) {
        setSelectedPracticeId('');
        onChange(null);
      }
    } else {
      setSelectedPracticeId('');
      onChange(null);
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
                  value={selectedPracticeId || undefined}
                  onValueChange={(val) => {
                    if (val && val !== 'none') {
                      setSelectedPracticeId(val);
                      setErrors({});
                    }
                  }}
                  disabled={disabled || !!preselectedPracticeId || practicesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        practicesLoading
                          ? 'Loading practices...'
                          : 'Select a practice'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {practicesLoading ? (
                      <SelectItem value="none" disabled>
                        Loading...
                      </SelectItem>
                    ) : practices.length === 0 ? (
                      <SelectItem value="none" disabled>
                        {practicesLoadError
                          ? 'Could not load list. Create a new practice or retry below.'
                          : 'No practices in network yet. Create a new practice below.'}
                      </SelectItem>
                    ) : (
                      practices.map((practice) => {
                        const city = practice.address?.city ?? (practice as any).city;
                        const state = practice.address?.state ?? (practice as any).state;
                        return (
                          <SelectItem key={practice.id} value={practice.id}>
                            {practice.name}
                            {city && state && (
                              <span className="text-muted-foreground ml-2">
                                ({city}, {state})
                              </span>
                            )}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {practicesLoadError && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={loadPractices}
                    disabled={practicesLoading}
                  >
                    {practicesLoading ? 'Loading...' : 'Retry loading practices'}
                  </Button>
                )}
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
