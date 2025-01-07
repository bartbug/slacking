'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🚀', '🔥'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function ReactionPicker({ onSelect, trigger }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
          >
            <Smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 