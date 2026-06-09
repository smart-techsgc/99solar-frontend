'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

type QuickInputProps = {
  onSubmit: (value: string, type: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  defaultType?: string;
};

export function QuickInput({
  onSubmit,
  options,
  placeholder = 'Enter value...',
  defaultType = options[0]?.value,
}: QuickInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState(defaultType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue, selectedType);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="whitespace-nowrap">
            {options.find((opt) => opt.value === selectedType)?.label}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSelectedType(option.value)}
              className="flex justify-between"
            >
              {option.label}
              {selectedType === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1 min-w-[200px]"
      />

      <Button type="submit" size="icon" variant="default">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}