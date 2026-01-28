'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  suggestions = [],
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 min-h-[42px]">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="colorful"
            className="flex items-center gap-1 pr-1"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-[120px]"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="rounded-md border bg-popover p-2 shadow-md">
          <div className="text-xs text-muted-foreground mb-2">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="colorful"
                className="cursor-pointer hover:bg-accent"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
