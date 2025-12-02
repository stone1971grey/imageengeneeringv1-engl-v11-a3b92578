import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TableEditorProps {
  data: any;
  onChange: (newData: any) => void;
  onSave: () => void;
}

const TableEditor = ({ data, onChange, onSave }: TableEditorProps) => {
  const [loading, setLoading] = useState(false);

  const title = data?.title || '';
  const subtext = data?.subtext || '';
  const headers = data?.headers || ['Column 1', 'Column 2', 'Column 3'];
  const rows = data?.rows || [['Row 1 Cell 1', 'Row 1 Cell 2', 'Row 1 Cell 3']];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave();
      toast.success('Table saved successfully');
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Failed to save Table');
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((row: string[]) => [...row, '']);
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };

  const removeColumn = (columnIndex: number) => {
    if (headers.length <= 1) {
      toast.error('Table must have at least one column');
      return;
    }
    const newHeaders = headers.filter((_: string, i: number) => i !== columnIndex);
    const newRows = rows.map((row: string[]) => row.filter((_: string, i: number) => i !== columnIndex));
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChange({ ...data, headers: newHeaders });
  };

  const addRow = () => {
    const newRow = Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    onChange({ ...data, rows: newRows });
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      toast.error('Table must have at least one row');
      return;
    }
    const newRows = rows.filter((_: string[], i: number) => i !== rowIndex);
    onChange({ ...data, rows: newRows });
  };

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][cellIndex] = value;
    onChange({ ...data, rows: newRows });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Section Title (H2)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="e.g., Technical Specifications"
            />
          </div>

          <div>
            <Label htmlFor="subtext">Subtext (optional)</Label>
            <Textarea
              id="subtext"
              value={subtext}
              onChange={(e) => onChange({ ...data, subtext: e.target.value })}
              placeholder="Optional description text below the title"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Table Headers</CardTitle>
            <Button onClick={addColumn} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {headers.map((header: string, index: number) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={`header-${index}`}>Column {index + 1}</Label>
                <Input
                  id={`header-${index}`}
                  value={header}
                  onChange={(e) => updateHeader(index, e.target.value)}
                  placeholder={`Column ${index + 1} header`}
                />
              </div>
              {headers.length > 1 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="mt-6">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Column</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this column? This will remove all data in this column.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeColumn(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Table Rows</CardTitle>
            <Button onClick={addRow} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row: string[], rowIndex: number) => (
            <Card key={rowIndex} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Row {rowIndex + 1}</CardTitle>
                  {rows.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Row</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this row? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeRow(rowIndex)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {row.map((cell: string, cellIndex: number) => (
                  <div key={cellIndex}>
                    <Label htmlFor={`cell-${rowIndex}-${cellIndex}`}>
                      {headers[cellIndex] || `Column ${cellIndex + 1}`}
                    </Label>
                    <Textarea
                      id={`cell-${rowIndex}-${cellIndex}`}
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                      placeholder={`Content for ${headers[cellIndex] || `Column ${cellIndex + 1}`}`}
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="pt-4 border-t">
        <Button onClick={handleSave} disabled={loading} className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default memo(TableEditor);
