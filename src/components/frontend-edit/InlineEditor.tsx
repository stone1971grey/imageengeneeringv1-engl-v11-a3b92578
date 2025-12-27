import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditorProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  onCancel?: () => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  onSave,
  onCancel,
  multiline = false,
  className,
  placeholder = 'Text eingeben...',
  isEditing,
  setIsEditing
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Reset edit value when original value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(editValue);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, onSave, setIsEditing]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  }, [value, setIsEditing, onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSave();
    }
  }, [handleCancel, handleSave, multiline]);

  if (!isEditing) {
    return null;
  }

  const commonProps = {
    ref: inputRef as any,
    value: editValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setEditValue(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder,
    disabled: isSaving,
    className: cn(
      "w-full bg-white dark:bg-gray-800 border border-blue-500 rounded-md px-3 py-2",
      "text-gray-900 dark:text-white",
      "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
      "disabled:opacity-50",
      className
    )
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          {...commonProps}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={Math.min(10, Math.max(3, editValue.split('\n').length + 1))}
        />
      ) : (
        <input
          {...commonProps}
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
        />
      )}
      
      {/* Action buttons */}
      <div className="absolute -bottom-10 right-0 flex items-center gap-2 bg-gray-900 rounded-md p-1 shadow-lg border border-gray-700">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-7 px-2 bg-green-600 hover:bg-green-500 text-white"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {multiline && (
        <p className="text-xs text-gray-500 mt-1">
          Cmd+Enter zum Speichern, Esc zum Abbrechen
        </p>
      )}
    </div>
  );
};
