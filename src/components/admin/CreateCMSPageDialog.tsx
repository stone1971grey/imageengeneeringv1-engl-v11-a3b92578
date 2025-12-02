import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CreateCMSPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (slug: string, languages: string[], iconKey: string | null) => void;
}

interface LanguageOption {
  code: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
];

type CMSNavIconKey =
  | 'automotive'
  | 'security'
  | 'mobile'
  | 'webcamera'
  | 'machine-vision'
  | 'medical'
  | 'scanners'
  | 'photo-video';

const ICON_OPTIONS: { key: CMSNavIconKey; label: string }[] = [
  { key: 'automotive', label: 'Automotive' },
  { key: 'security', label: 'Security & Surveillance' },
  { key: 'mobile', label: 'Mobile Phone' },
  { key: 'webcamera', label: 'Web Camera' },
  { key: 'machine-vision', label: 'Machine Vision' },
  { key: 'medical', label: 'Medical & Endoscopy' },
  { key: 'scanners', label: 'Scanners & Archiving' },
  { key: 'photo-video', label: 'Photo & Video' },
];

export function CreateCMSPageDialog({ open, onOpenChange, onSuccess }: CreateCMSPageDialogProps) {
  const [slug, setSlug] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'de', 'ja', 'ko', 'zh']);
  const [selectedIcon, setSelectedIcon] = useState<CMSNavIconKey | "">("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setValidationError(null);
    setValidationSuccess(null);
  };

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  const validateSlug = async () => {
    if (!slug.trim()) {
      setValidationError("Please enter a slug");
      return false;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(null);

    try {
      // Parse slug to extract parent
      const slugParts = slug.split('/');
      
      if (slugParts.length === 1) {
        // Top-level page (no parent)
        setValidationSuccess("✓ Top-level page (no parent required)");
        setIsValidating(false);
        return true;
      }

      // Extract parent slug (everything except last part)
      const parentSlug = slugParts.slice(0, -1).join('/');

      // Check if parent exists in page_registry
      const { data: parentPage, error } = await supabase
        .from('page_registry')
        .select('page_id, page_slug, page_title')
        .or(`page_slug.eq.${parentSlug},page_slug.ilike.%/${parentSlug}`)
        .maybeSingle();

      if (error) {
        console.error("Error checking parent:", error);
        setValidationError("Database error checking parent page");
        setIsValidating(false);
        return false;
      }

      if (!parentPage) {
        setValidationError(`❌ Parent page "${parentSlug}" does not exist. Please create the parent page first.`);
        setIsValidating(false);
        return false;
      }

      setValidationSuccess(`✓ Parent found: "${parentPage.page_title}" (ID ${parentPage.page_id})`);
      setIsValidating(false);
      return true;

    } catch (err) {
      console.error("Validation error:", err);
      setValidationError("Unexpected error during validation");
      setIsValidating(false);
      return false;
    }
  };

  const handleCreate = async () => {
    // Validate first
    const isValid = await validateSlug();
    if (!isValid) return;

    if (selectedLanguages.length === 0) {
      setValidationError("Please select at least one language");
      return;
    }

    setIsCreating(true);

    try {
      // Call the creation function with slug, selected languages and optional icon
      onSuccess(slug, selectedLanguages, selectedIcon || null);
      
      // Reset form
      setSlug("");
      setSelectedLanguages(['en', 'de', 'ja', 'ko', 'zh']);
      setSelectedIcon("");
      setValidationError(null);
      setValidationSuccess(null);
      
    } catch (err) {
      console.error("Error creating page:", err);
      setValidationError("Failed to create page");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New CMS Page</DialogTitle>
          <DialogDescription>
            Enter the page slug and select languages. Parent pages must exist before creating child pages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Slug Input */}
          <div className="space-y-2">
            <Label htmlFor="slug">Page Slug</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                placeholder="e.g., styleguide/colors or products/testcharts/multipurpose"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={validateSlug} 
                disabled={isValidating || !slug.trim()}
                variant="outline"
              >
                {isValidating ? "Checking..." : "Validate"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use slashes (/) to define hierarchy. Example: parent/child
            </p>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label htmlFor="nav-icon">Navigation Icon (optional)</Label>
            <Select
              value={selectedIcon}
              onValueChange={(value) => setSelectedIcon(value as CMSNavIconKey)}
            >
              <SelectTrigger id="nav-icon">
                <SelectValue placeholder="No icon selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No icon</SelectItem>
                {ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This icon will be used as a prefix in the navigation if configured for this page.
            </p>
          </div>

          {/* Validation Feedback */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {validationSuccess && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{validationSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Language Selection */}
          <div className="space-y-3">
            <Label>Languages</Label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.code}`}
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => handleLanguageToggle(lang.code)}
                  />
                  <label
                    htmlFor={`lang-${lang.code}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {lang.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected. 
              Pages will only be created for selected languages.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !validationSuccess || selectedLanguages.length === 0}
          >
            {isCreating ? "Creating..." : "Create Page"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
