import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState, memo } from "react";

interface SpecificationRow {
  specification: string;
  value: string;
}

interface SpecificationEditorProps {
  segmentId: string;
  title: string;
  rows: SpecificationRow[];
  onUpdate: (data: { title: string; rows: SpecificationRow[] }) => void;
  onSave: () => void;
  saving: boolean;
  currentPageSlug: string;
}

const SpecificationEditor = ({
  segmentId,
  title: initialTitle,
  rows: initialRows,
  onUpdate,
  onSave,
  saving,
  currentPageSlug
}: SpecificationEditorProps) => {
  const [title, setTitle] = useState(initialTitle || "Detailed Specifications");
  const [rows, setRows] = useState<SpecificationRow[]>(
    initialRows.length > 0
      ? initialRows
      : [{ specification: "Specification Name", value: "Value" }]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ title: newTitle, rows });
  };

  const handleRowChange = (index: number, field: 'specification' | 'value', value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
    onUpdate({ title, rows: updatedRows });
  };

  const handleAddRow = () => {
    const newRows = [...rows, { specification: "New Specification", value: "Value" }];
    setRows(newRows);
    onUpdate({ title, rows: newRows });
  };

  const handleDeleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onUpdate({ title, rows: newRows });
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Specification Segment (ID: {segmentId})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor={`spec-title-${segmentId}`} className="text-white text-base">
            Section Title
          </Label>
          <Input
            id={`spec-title-${segmentId}`}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Detailed Specifications"
            className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-xl text-white placeholder:text-gray-400 h-12"
          />
        </div>

        {/* Specification Rows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white text-base">Specification Rows</Label>
            <Button
              type="button"
              onClick={handleAddRow}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>

          {rows.map((row, index) => (
            <Card key={index} className="bg-gray-700 border-gray-600">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-white font-medium">Row {index + 1}</span>
                  {rows.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Row?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this specification row. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRow(index)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div>
                  <Label htmlFor={`spec-name-${segmentId}-${index}`} className="text-white text-sm">
                    Specification Name
                  </Label>
                  <Input
                    id={`spec-name-${segmentId}-${index}`}
                    type="text"
                    value={row.specification}
                    onChange={(e) => handleRowChange(index, 'specification', e.target.value)}
                    placeholder="e.g. Light Source"
                    className="mt-1 bg-gray-600 border-2 border-gray-500 focus:border-[#f9dc24] text-lg text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor={`spec-value-${segmentId}-${index}`} className="text-white text-sm">
                    Value
                  </Label>
                  <Input
                    id={`spec-value-${segmentId}-${index}`}
                    type="text"
                    value={row.value}
                    onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                    placeholder="e.g. 36 temperature-controlled LEDs"
                    className="mt-1 bg-gray-600 border-2 border-gray-500 focus:border-[#f9dc24] text-lg text-white placeholder:text-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button - Full Width */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 h-12 text-lg font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SpecificationEditor);
