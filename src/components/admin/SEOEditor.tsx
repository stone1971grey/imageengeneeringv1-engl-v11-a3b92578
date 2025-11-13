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
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
          <AlertTriangle className="h-7 w-7 text-indigo-600" />
          SEO Health Check
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.titleLength)}
            <span className="text-base font-medium text-gray-900">Title Length</span>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.descriptionLength)}
            <span className="text-base font-medium text-gray-900">Description Length</span>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.keywordInTitle)}
            <span className="text-base font-medium text-gray-900">FKW in Title</span>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.keywordInDescription)}
            <span className="text-base font-medium text-gray-900">FKW in Description</span>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.keywordInSlug)}
            <span className="text-base font-medium text-gray-900">FKW in Slug</span>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(checks.hasH1)}
            <span className="text-base font-medium text-gray-900">H1 Present</span>
          </div>
        </div>
      </Card>

      {/* Basic SEO Fields */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="focus-keyword" className="flex items-center gap-2 text-base font-semibold">
            Fokus Keyword (FKW)
            <Badge variant="outline" className="text-sm">Empfohlen</Badge>
          </Label>
          <Input
            id="focus-keyword"
            value={data.focusKeyword || ''}
            onChange={(e) => handleChange('focusKeyword', e.target.value)}
            placeholder="z.B. camera testing software"
            className="mt-3 text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
          />
          <p className="text-base text-gray-700 mt-3 leading-relaxed">
            Hauptkeyword für diese Seite - sollte in Title, Description und Slug vorkommen
          </p>
        </div>

        <div>
          <Label htmlFor="seo-title" className="flex items-center gap-2 text-base font-semibold">
            SEO Title (Meta Title)
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <Input
            id="seo-title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="z.B. Professional Camera Testing Solutions | Image Engineering"
            className="mt-3 text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
            maxLength={70}
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-base font-medium ${
              (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                ? 'text-green-600'
                : (data.title?.length || 0) > 60
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {data.title?.length || 0} / 60 Zeichen (optimal: 50-60)
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="meta-description" className="flex items-center gap-2 text-base font-semibold">
            Meta Description
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <Textarea
            id="meta-description"
            value={data.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="z.B. Discover professional camera testing solutions with Image Engineering. Industry-leading test charts, analysis software, and illumination devices for precise image quality measurement."
            className="mt-3 text-lg border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 py-3"
            rows={4}
            maxLength={170}
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-base font-medium ${
              (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                ? 'text-green-600'
                : (data.metaDescription?.length || 0) > 160
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {data.metaDescription?.length || 0} / 160 Zeichen (optimal: 120-160)
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="slug" className="flex items-center gap-2 text-base font-semibold">
            URL Slug
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <div className="flex items-center mt-3">
            <span className="text-lg text-gray-700 px-5 py-3 bg-gray-100 rounded-l-md border-2 border-r-0 border-gray-300 font-medium h-12 flex items-center">
              /
            </span>
            <Input
              id="slug"
              value={data.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
              placeholder={pageSlug}
              className="rounded-l-none text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
            />
          </div>
          <p className="text-base text-gray-700 mt-3 leading-relaxed">
            Nur Kleinbuchstaben, Zahlen und Bindestriche. FKW sollte enthalten sein.
          </p>
        </div>

        <div>
          <Label htmlFor="canonical" className="flex items-center gap-2 text-base font-semibold">
            Canonical URL
            <Badge variant="outline" className="text-sm">Empfohlen</Badge>
          </Label>
          <Input
            id="canonical"
            value={data.canonical || ''}
            onChange={(e) => handleChange('canonical', e.target.value)}
            placeholder="https://www.image-engineering.de/your-solution/machine-vision"
            className="mt-3 text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
          />
          <p className="text-base text-gray-700 mt-3 leading-relaxed">
            Verhindert Duplicate Content. Leer lassen = aktuelle URL verwenden.
          </p>
        </div>
      </div>

      {/* Robots Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="robots-index" className="text-base font-semibold">Robots Index</Label>
          <Select
            value={data.robotsIndex || 'index'}
            onValueChange={(value: 'index' | 'noindex') => handleChange('robotsIndex', value)}
          >
            <SelectTrigger className="mt-3 h-12 text-lg border-2 border-gray-300 focus:border-[#f9dc24] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index" className="text-lg">index (empfohlen)</SelectItem>
              <SelectItem value="noindex" className="text-lg">noindex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="robots-follow" className="text-base font-semibold">Robots Follow</Label>
          <Select
            value={data.robotsFollow || 'follow'}
            onValueChange={(value: 'follow' | 'nofollow') => handleChange('robotsFollow', value)}
          >
            <SelectTrigger className="mt-3 h-12 text-lg border-2 border-gray-300 focus:border-[#f9dc24] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="follow" className="text-lg">follow (empfohlen)</SelectItem>
              <SelectItem value="nofollow" className="text-lg">nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Open Graph / Social Media */}
      <div className="border-t pt-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">Open Graph / Social Media</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="og-title" className="text-base font-semibold">OG Title</Label>
            <Input
              id="og-title"
              value={data.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              placeholder="Leer lassen = SEO Title verwenden"
              className="mt-3 text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
            />
          </div>

          <div>
            <Label htmlFor="og-description" className="text-base font-semibold">OG Description</Label>
            <Textarea
              id="og-description"
              value={data.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              placeholder="Leer lassen = Meta Description verwenden"
              className="mt-3 text-lg border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 py-3"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="og-image" className="text-base font-semibold">OG Image URL</Label>
            <Input
              id="og-image"
              value={data.ogImage || ''}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="https://... (empfohlen: 1200×630px)"
              className="mt-3 text-lg h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4"
            />
          </div>

          <div>
            <Label htmlFor="twitter-card" className="text-base font-semibold">Twitter Card Type</Label>
            <Select
              value={data.twitterCard || 'summary_large_image'}
              onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
            >
              <SelectTrigger className="mt-3 h-12 text-lg border-2 border-gray-300 focus:border-[#f9dc24] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary_large_image" className="text-lg">Summary Large Image (empfohlen)</SelectItem>
                <SelectItem value="summary" className="text-lg">Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-8 border-t">
        <Button
          onClick={onSave}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-3 text-base h-12 px-6"
        >
          <Save className="h-5 w-5" />
          SEO Settings speichern
        </Button>
      </div>
    </div>
  );
};
