'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EditableListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
  addButtonLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function EditableList({
  items,
  onItemsChange,
  placeholder = 'Enter item...',
  label,
  addButtonLabel = 'Add',
  className,
  disabled = false,
}: EditableListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onItemsChange([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="space-y-2">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge
                key={index}
                variant="colorful"
                className="flex items-center gap-1 pr-1"
              >
                {item}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                    aria-label={`Remove ${item}`}
                    data-scroll-speed="0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
        {!disabled && (
          <div className="flex gap-2" data-scroll-exclude>
            <div data-scroll-exclude className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1"
                data-scroll-speed="0"
              />
            </div>
            <div data-scroll-exclude>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={!inputValue.trim()}
                data-scroll-speed="0"
              >
                <Plus className="h-4 w-4 mr-1" />
                {addButtonLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
