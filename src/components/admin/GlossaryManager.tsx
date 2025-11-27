import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type GlossaryEntryType = 'non-translate' | 'preferred-translation' | 'abbreviation' | 'company-specific';

interface GlossaryEntry {
  id: string;
  term: string;
  term_type: GlossaryEntryType;
  translations: Record<string, string>;
  context: string | null;
  created_at: string;
}

const typeLabels: Record<GlossaryEntryType, { label: string; color: string }> = {
  'non-translate': { label: 'Not Translated', color: 'bg-red-100 text-red-800' },
  'preferred-translation': { label: 'Preferred Translation', color: 'bg-blue-100 text-blue-800' },
  'abbreviation': { label: 'Abbreviation', color: 'bg-purple-100 text-purple-800' },
  'company-specific': { label: 'Company-Specific', color: 'bg-green-100 text-green-800' },
};

const languages = [
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

export const GlossaryManager = () => {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [term, setTerm] = useState("");
  const [termType, setTermType] = useState<GlossaryEntryType>('non-translate');
  const [context, setContext] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('glossary')
      .select('*')
      .order('term', { ascending: true });

    if (error) {
      console.error('Error loading glossary:', error);
      toast.error('Failed to load glossary');
      return;
    }

    // Type assertion for database records
    const typedData = (data || []).map(entry => ({
      ...entry,
      term_type: entry.term_type as GlossaryEntryType,
      translations: entry.translations as Record<string, string>,
    }));

    setEntries(typedData);
  };

  const resetForm = () => {
    setTerm("");
    setTermType('non-translate');
    setContext("");
    setTranslations({});
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!term.trim()) {
      toast.error('Term is required');
      return;
    }

    if ((termType === 'preferred-translation' || termType === 'company-specific') && 
        Object.keys(translations).length === 0) {
      toast.error('At least one translation is required for this term type');
      return;
    }

    const entryData = {
      term: term.trim(),
      term_type: termType,
      translations: (termType === 'preferred-translation' || termType === 'company-specific') 
        ? translations 
        : {},
      context: context.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from('glossary')
        .update(entryData)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating entry:', error);
        toast.error('Failed to update entry');
        return;
      }

      toast.success('Entry updated successfully');
    } else {
      const { error } = await supabase
        .from('glossary')
        .insert(entryData);

      if (error) {
        console.error('Error creating entry:', error);
        toast.error('Failed to create entry');
        return;
      }

      toast.success('Entry created successfully');
    }

    resetForm();
    loadEntries();
  };

  const handleEdit = (entry: GlossaryEntry) => {
    setTerm(entry.term);
    setTermType(entry.term_type);
    setContext(entry.context || "");
    setTranslations(entry.translations || {});
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('glossary')
      .delete()
      .eq('id', deleteId);

    if (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
      return;
    }

    toast.success('Entry deleted successfully');
    setDeleteId(null);
    loadEntries();
  };

  const handleTranslationChange = (langCode: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: value
    }));
  };

  const needsTranslations = termType === 'preferred-translation' || termType === 'company-specific';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Translation Glossary</CardTitle>
            <CardDescription>
              Manage terms and their translations for AI-powered content translation
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Term
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdding && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Glossary Entry' : 'New Glossary Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term (English) *</Label>
                <Input
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g., EMVA 1288, test chart, LE7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termType">Type *</Label>
                <Select value={termType} onValueChange={(val) => setTermType(val as GlossaryEntryType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsTranslations && (
                <div className="space-y-3 p-4 border rounded-md bg-muted/50">
                  <Label>Translations *</Label>
                  {languages.map(lang => (
                    <div key={lang.code} className="space-y-2">
                      <Label htmlFor={`trans-${lang.code}`} className="text-sm">
                        {lang.name}
                      </Label>
                      <Input
                        id={`trans-${lang.code}`}
                        value={translations[lang.code] || ''}
                        onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                        placeholder={`Translation in ${lang.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="context">Context / Notes</Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Optional notes about usage or context"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingId ? 'Update' : 'Create'} Entry
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Translations</TableHead>
                <TableHead>Context</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No glossary entries yet. Click "Add Term" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.term}</TableCell>
                    <TableCell>
                      <Badge className={typeLabels[entry.term_type].color}>
                        {typeLabels[entry.term_type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {Object.keys(entry.translations || {}).length > 0 ? (
                        <div className="text-sm space-y-1">
                          {Object.entries(entry.translations).map(([lang, trans]) => (
                            <div key={lang}>
                              <span className="font-medium">{lang.toUpperCase()}:</span> {trans}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {entry.context || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Glossary Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this glossary entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
