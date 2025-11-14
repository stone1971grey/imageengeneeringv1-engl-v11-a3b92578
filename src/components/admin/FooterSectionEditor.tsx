import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Trash2, Upload } from "lucide-react";
import { ImageMetadata } from '@/types/imageMetadata';

interface FooterSectionEditorProps {
  footerName: string;
  footerRole: string;
  footerEmail: string;
  footerPhone: string;
  footerTeamImageUrl: string;
  footerTeamImageMetadata: ImageMetadata | null;
  segmentRegistry: Record<string, number>;
  onFooterNameChange: (name: string) => void;
  onFooterRoleChange: (role: string) => void;
  onFooterEmailChange: (email: string) => void;
  onFooterPhoneChange: (phone: string) => void;
  onFooterTeamImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onFooterTeamAltTextChange: (altText: string) => void;
  onDeleteSegment: () => void;
  onSave: () => void;
  uploading: boolean;
}

export const FooterSectionEditor = ({
  footerName,
  footerRole,
  footerEmail,
  footerPhone,
  footerTeamImageUrl,
  footerTeamImageMetadata,
  segmentRegistry,
  onFooterNameChange,
  onFooterRoleChange,
  onFooterEmailChange,
  onFooterPhoneChange,
  onFooterTeamImageUpload,
  onFooterTeamAltTextChange,
  onDeleteSegment,
  onSave,
  uploading,
}: FooterSectionEditorProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-white">Footer Section</CardTitle>
            <CardDescription className="text-gray-300">Edit footer content</CardDescription>
            <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
              ID: {segmentRegistry['footer'] || 7}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
              Footer Template
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Segment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Footer Segment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the entire Footer section. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteSegment}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="footer_name" className="text-white">Contact Person Name</Label>
          <Input
            id="footer_name"
            value={footerName}
            onChange={(e) => onFooterNameChange(e.target.value)}
            className="border-2 border-gray-600"
            placeholder="e.g., Markus Schmidt"
          />
        </div>

        <div>
          <Label htmlFor="footer_role" className="text-white">Role / Position</Label>
          <Input
            id="footer_role"
            value={footerRole}
            onChange={(e) => onFooterRoleChange(e.target.value)}
            className="border-2 border-gray-600"
            placeholder="e.g., Sales Manager"
          />
        </div>

        <div>
          <Label htmlFor="footer_email" className="text-white">Email</Label>
          <Input
            id="footer_email"
            type="email"
            value={footerEmail}
            onChange={(e) => onFooterEmailChange(e.target.value)}
            className="border-2 border-gray-600"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <Label htmlFor="footer_phone" className="text-white">Phone</Label>
          <Input
            id="footer_phone"
            value={footerPhone}
            onChange={(e) => onFooterPhoneChange(e.target.value)}
            className="border-2 border-gray-600"
            placeholder="+49 123 456789"
          />
        </div>

        <div>
          <Label htmlFor="footer_team_image" className="text-white">Team Member Image</Label>
          <p className="text-sm text-white mb-2">
            {footerTeamImageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload a team member image"}
          </p>
          {footerTeamImageUrl && (
            <div className="mb-4">
              <img 
                src={footerTeamImageUrl} 
                alt={footerTeamImageMetadata?.altText || "Team member"} 
                className="max-w-xs h-auto object-contain rounded-lg border-2 border-gray-600"
              />
            </div>
          )}
          
          {footerTeamImageUrl ? (
            <Button
              type="button"
              onClick={() => document.getElementById('footer_team_image')?.click()}
              disabled={uploading}
              className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
            >
              {uploading ? "Uploading..." : "Replace Image"}
            </Button>
          ) : null}
          
          <Input
            id="footer_team_image"
            type="file"
            accept="image/*"
            onChange={onFooterTeamImageUpload}
            disabled={uploading}
            className={`border-2 border-gray-600 ${footerTeamImageUrl ? "hidden" : ""}`}
          />

          {footerTeamImageMetadata && (
            <div className="mt-4">
              <Label htmlFor="footer_team_alt_text" className="text-white">Alt Text (SEO)</Label>
              <Input
                id="footer_team_alt_text"
                value={footerTeamImageMetadata.altText || ''}
                onChange={(e) => onFooterTeamAltTextChange(e.target.value)}
                placeholder="Describe the image for accessibility and SEO"
                className="border-2 border-gray-600"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            className="bg-[#f9dc24] hover:bg-yellow-400 text-black"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Footer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
