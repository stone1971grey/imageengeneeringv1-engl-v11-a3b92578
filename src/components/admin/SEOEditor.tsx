import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface SEOData {
  title?: string;
  metaDescription?: string;
  slug?: string;
  canonical?: string;
  robotsIndex?: 'index' | 'noindex';
  robotsFollow?: 'follow' | 'nofollow';
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

interface SEOEditorProps {
  pageSlug: string;
  data: SEOData;
  onChange: (data: SEOData) => void;
  onSave: () => void;
}

export const SEOEditor = ({ pageSlug, data, onChange, onSave }: SEOEditorProps) => {
  const [checks, setChecks] = useState({
    titleLength: false,
    descriptionLength: false,
    hasH1: true,
    keywordInTitle: false,
    keywordInDescription: false,
    keywordInSlug: false,
  });

  useEffect(() => {
    const titleLength = (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60;
    const descriptionLength = (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160;
    
    const keyword = data.focusKeyword?.toLowerCase() || '';
    const keywordInTitle = keyword ? (data.title?.toLowerCase().includes(keyword) || false) : false;
    const keywordInDescription = keyword ? (data.metaDescription?.toLowerCase().includes(keyword) || false) : false;
    const keywordInSlug = keyword ? (data.slug?.toLowerCase().includes(keyword.replace(/\s+/g, '-')) || false) : false;

    setChecks({
      titleLength,
      descriptionLength,
      hasH1: true, // Could be enhanced with actual H1 detection
      keywordInTitle,
      keywordInDescription,
      keywordInSlug,
    });
  }, [data]);

  const handleChange = (field: keyof SEOData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-indigo-600" />
          SEO Health Check
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.titleLength)}
            <span className="text-sm">Title Length</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.descriptionLength)}
            <span className="text-sm">Description Length</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.keywordInTitle)}
            <span className="text-sm">FKW in Title</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.keywordInDescription)}
            <span className="text-sm">FKW in Description</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.keywordInSlug)}
            <span className="text-sm">FKW in Slug</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(checks.hasH1)}
            <span className="text-sm">H1 Present</span>
          </div>
        </div>
      </Card>

      {/* Basic SEO Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="focus-keyword" className="flex items-center gap-2">
            Fokus Keyword (FKW)
            <Badge variant="outline" className="text-xs">Empfohlen</Badge>
          </Label>
          <Input
            id="focus-keyword"
            value={data.focusKeyword || ''}
            onChange={(e) => handleChange('focusKeyword', e.target.value)}
            placeholder="z.B. camera testing software"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Hauptkeyword für diese Seite - sollte in Title, Description und Slug vorkommen
          </p>
        </div>

        <div>
          <Label htmlFor="seo-title" className="flex items-center gap-2">
            SEO Title (Meta Title)
            <Badge variant="outline" className="text-xs">Pflicht</Badge>
          </Label>
          <Input
            id="seo-title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="z.B. Professional Camera Testing Solutions | Image Engineering"
            className="mt-2"
            maxLength={70}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-sm ${
              (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                ? 'text-green-600'
                : (data.title?.length || 0) > 60
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {data.title?.length || 0} / 60 Zeichen (optimal: 50-60)
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="meta-description" className="flex items-center gap-2">
            Meta Description
            <Badge variant="outline" className="text-xs">Pflicht</Badge>
          </Label>
          <Textarea
            id="meta-description"
            value={data.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="z.B. Discover professional camera testing solutions with Image Engineering. Industry-leading test charts, analysis software, and illumination devices for precise image quality measurement."
            className="mt-2"
            rows={3}
            maxLength={170}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-sm ${
              (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                ? 'text-green-600'
                : (data.metaDescription?.length || 0) > 160
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {data.metaDescription?.length || 0} / 160 Zeichen (optimal: 120-160)
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="slug" className="flex items-center gap-2">
            URL Slug
            <Badge variant="outline" className="text-xs">Pflicht</Badge>
          </Label>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500 px-3 py-2 bg-gray-100 rounded-l-md border border-r-0">
              /
            </span>
            <Input
              id="slug"
              value={data.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
              placeholder={pageSlug}
              className="rounded-l-none"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Nur Kleinbuchstaben, Zahlen und Bindestriche. FKW sollte enthalten sein.
          </p>
        </div>

        <div>
          <Label htmlFor="canonical" className="flex items-center gap-2">
            Canonical URL
            <Badge variant="outline" className="text-xs">Empfohlen</Badge>
          </Label>
          <Input
            id="canonical"
            value={data.canonical || ''}
            onChange={(e) => handleChange('canonical', e.target.value)}
            placeholder="https://www.image-engineering.de/your-solution/machine-vision"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Verhindert Duplicate Content. Leer lassen = aktuelle URL verwenden.
          </p>
        </div>
      </div>

      {/* Robots Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="robots-index">Robots Index</Label>
          <Select
            value={data.robotsIndex || 'index'}
            onValueChange={(value: 'index' | 'noindex') => handleChange('robotsIndex', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index">index (empfohlen)</SelectItem>
              <SelectItem value="noindex">noindex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="robots-follow">Robots Follow</Label>
          <Select
            value={data.robotsFollow || 'follow'}
            onValueChange={(value: 'follow' | 'nofollow') => handleChange('robotsFollow', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="follow">follow (empfohlen)</SelectItem>
              <SelectItem value="nofollow">nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Open Graph / Social Media */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Open Graph / Social Media</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="og-title">OG Title</Label>
            <Input
              id="og-title"
              value={data.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              placeholder="Leer lassen = SEO Title verwenden"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="og-description">OG Description</Label>
            <Textarea
              id="og-description"
              value={data.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              placeholder="Leer lassen = Meta Description verwenden"
              className="mt-2"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="og-image">OG Image URL</Label>
            <Input
              id="og-image"
              value={data.ogImage || ''}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="https://... (empfohlen: 1200×630px)"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="twitter-card">Twitter Card Type</Label>
            <Select
              value={data.twitterCard || 'summary_large_image'}
              onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary_large_image">Summary Large Image (empfohlen)</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={onSave}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          SEO Settings speichern
        </Button>
      </div>
    </div>
  );
};
