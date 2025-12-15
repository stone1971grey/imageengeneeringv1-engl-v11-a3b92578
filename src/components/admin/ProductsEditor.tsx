import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, X, FileText, FolderOpen } from "lucide-react";
import { MediaSelector } from "./MediaSelector";
import { DataHubDialog } from "./DataHubDialog";

interface ChartSizeRow {
  id: string;
  sizeId: string;
  aspectRatio43: string;
  aspectRatio169: string;
  chartSize: string;
}

interface ChartSizeSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rows: ChartSizeRow[];
}

interface ChartSizesData {
  introText: string;
  introImageUrl: string;
  sections: ChartSizeSection[];
}

// Filter options constants
const PRODUCT_TYPES = ["Custom", "Multi-Format"];
const MEASUREMENT_FOCUS = ["Low-Light", "Timing", "Multipurpose"];
const FORMAT_FOV = ["Ultra-Wide", "Standard", "Multi-Format"];
const APPLICATION_OPTIONS = ["Automotive", "Mobile Devices", "Industrial Imaging", "Video / Broadcast"];
const INTEGRATION_FEATURES = ["Integrated Illumination", "Timing Hardware", "ISO Compliant"];

interface Product {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  image_url: string;
  gallery_images: string[];
  documents: { url: string; title: string; type: string }[];
  category: string;
  subcategory: string | null;
  sku: string | null;
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
  product_types: string[];
  measurement_focus: string[];
  format_fov: string[];
  integration_features: string[];
  chart_sizes: ChartSizesData | null;
  price_info: string | null;
  availability: string;
  language_code: string;
  published: boolean;
  visibility: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "Test Charts",
  "Illumination Devices",
  "Measurement Devices",
  "Software",
  "Bundles & Services"
];

const SUBCATEGORIES: Record<string, string[]> = {
  "Test Charts": ["Resolution", "Color", "Geometry", "Multi-Purpose", "Custom"],
  "Illumination Devices": ["LED Panels", "Light Boxes", "Accessories"],
  "Measurement Devices": ["Spectroradiometers", "Colorimeters", "Accessories"],
  "Software": ["Analysis", "Calibration", "Automation"],
  "Bundles & Services": ["Training", "Consulting", "Bundles"]
};

const ProductsEditor = () => {
  // Helper function to ensure product folder exists
  const ensureProductFolder = async (categorySlug: string, productSlug: string, productTitle: string) => {
    const productFolderPath = `products/${categorySlug}/${productSlug}`;
    
    // Check if product folder exists
    const { data: existingProductFolder } = await supabase
      .from('media_folders')
      .select('id')
      .eq('storage_path', productFolderPath)
      .maybeSingle();
    
    if (!existingProductFolder) {
      // Get category folder
      const { data: categoryFolder } = await supabase
        .from('media_folders')
        .select('id')
        .eq('storage_path', `products/${categorySlug}`)
        .maybeSingle();
      
      if (categoryFolder) {
        await supabase.from('media_folders').insert({
          name: productTitle,
          parent_id: categoryFolder.id,
          storage_path: productFolderPath,
          position: 999
        });
      }
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [docMediaDialogOpen, setDocMediaDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    teaser: "",
    description: "",
    image_url: "",
    gallery_images: [] as string[],
    documents: [] as { url: string; title: string; type: string }[],
    category: "Test Charts",
    subcategory: "",
    sku: "",
    specifications: {} as Record<string, string>,
    features: [] as string[],
    applications: [] as string[],
    product_types: [] as string[],
    measurement_focus: [] as string[],
    format_fov: [] as string[],
    integration_features: [] as string[],
    chart_sizes: null as ChartSizesData | null,
    price_info: "",
    availability: "available",
    language_code: "EN",
    published: true,
    visibility: "public",
    position: 999
  });

  // Chart size editor state
  const [newChartSizeRow, setNewChartSizeRow] = useState<Omit<ChartSizeRow, 'id'>>({
    sizeId: "",
    aspectRatio43: "",
    aspectRatio169: "",
    chartSize: ""
  });

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newApplication, setNewApplication] = useState("");

  // Event listener for opening document media selector
  useEffect(() => {
    const handleOpenDocSelector = () => setDocMediaDialogOpen(true);
    window.addEventListener('open-doc-media-selector', handleOpenDocSelector);
    return () => window.removeEventListener('open-doc-media-selector', handleOpenDocSelector);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      
      // Transform JSONB fields
      const transformedProducts = (data || []).map(p => ({
        ...p,
        specifications: typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : {},
        features: Array.isArray(p.features) ? p.features : [],
        applications: Array.isArray(p.applications) ? p.applications : [],
        product_types: Array.isArray((p as any).product_types) ? (p as any).product_types : [],
        measurement_focus: Array.isArray((p as any).measurement_focus) ? (p as any).measurement_focus : [],
        format_fov: Array.isArray((p as any).format_fov) ? (p as any).format_fov : [],
        integration_features: Array.isArray((p as any).integration_features) ? (p as any).integration_features : [],
        gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
        documents: Array.isArray(p.documents) ? p.documents : [],
        chart_sizes: (p as any).chart_sizes || null
      }));
      
      setProducts(transformedProducts as unknown as Product[]);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      teaser: "",
      description: "",
      image_url: "",
      gallery_images: [],
      documents: [],
      category: "Test Charts",
      subcategory: "",
      sku: "",
      specifications: {},
      features: [],
      applications: [],
      product_types: [],
      measurement_focus: [],
      format_fov: [],
      integration_features: [],
      chart_sizes: null,
      price_info: "",
      availability: "available",
      language_code: "EN",
      published: true,
      visibility: "public",
      position: 999
    });
    setNewSpecKey("");
    setNewSpecValue("");
    setNewFeature("");
    setNewApplication("");
    setNewChartSizeRow({ sizeId: "", aspectRatio43: "", aspectRatio169: "", chartSize: "" });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      slug: product.slug,
      title: product.title,
      teaser: product.teaser,
      description: product.description || "",
      image_url: product.image_url,
      gallery_images: product.gallery_images || [],
      documents: product.documents || [],
      category: product.category,
      subcategory: product.subcategory || "",
      sku: product.sku || "",
      specifications: product.specifications || {},
      features: product.features || [],
      applications: product.applications || [],
      product_types: product.product_types || [],
      measurement_focus: product.measurement_focus || [],
      format_fov: product.format_fov || [],
      integration_features: product.integration_features || [],
      chart_sizes: product.chart_sizes || null,
      price_info: product.price_info || "",
      availability: product.availability,
      language_code: product.language_code,
      published: product.published,
      visibility: product.visibility,
      position: product.position
    });
    setEditingProduct(product);
    setIsCreating(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setEditingProduct(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!formData.title || !formData.teaser || !formData.image_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.title);
      
      // Create product folder in media_folders if it doesn't exist
      const categorySlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const productFolderPath = `products/${categorySlug}/${slug}`;
      
      // Check if product folder exists
      const { data: existingProductFolder } = await supabase
        .from('media_folders')
        .select('id')
        .eq('storage_path', productFolderPath)
        .maybeSingle();
      
      if (!existingProductFolder) {
        // Get category folder
        const { data: categoryFolder } = await supabase
          .from('media_folders')
          .select('id')
          .eq('storage_path', `products/${categorySlug}`)
          .maybeSingle();
        
        if (categoryFolder) {
          await supabase.from('media_folders').insert({
            name: formData.title,
            parent_id: categoryFolder.id,
            storage_path: productFolderPath,
            position: 999
          });
        }
      }
      
      const productData = {
        slug,
        title: formData.title,
        teaser: formData.teaser,
        description: formData.description || null,
        image_url: formData.image_url,
        gallery_images: formData.gallery_images,
        documents: formData.documents,
        category: formData.category,
        subcategory: formData.subcategory || null,
        sku: formData.sku || null,
        specifications: formData.specifications,
        features: formData.features,
        applications: formData.applications,
        product_types: formData.product_types,
        measurement_focus: formData.measurement_focus,
        format_fov: formData.format_fov,
        integration_features: formData.integration_features,
        chart_sizes: JSON.parse(JSON.stringify(formData.chart_sizes)),
        price_info: formData.price_info || null,
        availability: formData.availability,
        language_code: formData.language_code,
        published: formData.published,
        visibility: formData.visibility,
        position: formData.position
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast.success("Product updated successfully");
        
        // Update editingProduct with new data, stay in detail view
        setEditingProduct({ ...editingProduct, ...productData });
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        toast.success("Product created successfully");
        
        // After creating, reload and find the new product to stay in detail view
        await loadProducts();
        const { data: newProduct } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        
        if (newProduct) {
          handleEdit(newProduct as unknown as Product);
        }
        return;
      }

      await loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;
      toast.success("Product deleted");
      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };


  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpecKey]: newSpecValue }
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const addFeature = () => {
    if (newFeature) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addApplication = () => {
    if (newApplication) {
      setFormData(prev => ({
        ...prev,
        applications: [...prev.applications, newApplication]
      }));
      setNewApplication("");
    }
  };

  const removeApplication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== index)
    }));
  };

  // Chart size functions
  const initChartSizes = () => {
    if (!formData.chart_sizes) {
      setFormData(prev => ({
        ...prev,
        chart_sizes: {
          introText: "",
          introImageUrl: "",
          sections: []
        }
      }));
    }
  };

  const addChartSizeSection = () => {
    initChartSizes();
    setFormData(prev => ({
      ...prev,
      chart_sizes: {
        ...(prev.chart_sizes || { introText: "", introImageUrl: "", sections: [] }),
        sections: [...(prev.chart_sizes?.sections || []), {
          id: crypto.randomUUID(),
          title: "New Section",
          description: "",
          imageUrl: "",
          rows: []
        }]
      }
    }));
  };

  const removeChartSizeSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      chart_sizes: prev.chart_sizes ? {
        ...prev.chart_sizes,
        sections: prev.chart_sizes.sections.filter(s => s.id !== sectionId)
      } : null
    }));
  };

  const updateChartSizeSection = (sectionId: string, field: keyof Omit<ChartSizeSection, 'id' | 'rows'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      chart_sizes: prev.chart_sizes ? {
        ...prev.chart_sizes,
        sections: prev.chart_sizes.sections.map(s =>
          s.id === sectionId ? { ...s, [field]: value } : s
        )
      } : null
    }));
  };

  const addChartSizeRow = (sectionId: string) => {
    if (newChartSizeRow.sizeId) {
      setFormData(prev => ({
        ...prev,
        chart_sizes: prev.chart_sizes ? {
          ...prev.chart_sizes,
          sections: prev.chart_sizes.sections.map(s =>
            s.id === sectionId ? {
              ...s,
              rows: [...s.rows, { ...newChartSizeRow, id: crypto.randomUUID() }]
            } : s
          )
        } : null
      }));
      setNewChartSizeRow({ sizeId: "", aspectRatio43: "", aspectRatio169: "", chartSize: "" });
    }
  };

  const removeChartSizeRow = (sectionId: string, rowId: string) => {
    setFormData(prev => ({
      ...prev,
      chart_sizes: prev.chart_sizes ? {
        ...prev.chart_sizes,
        sections: prev.chart_sizes.sections.map(s =>
          s.id === sectionId ? {
            ...s,
            rows: s.rows.filter(r => r.id !== rowId)
          } : s
        )
      } : null
    }));
  };

  const updateChartSizeRow = (sectionId: string, rowId: string, field: keyof Omit<ChartSizeRow, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      chart_sizes: prev.chart_sizes ? {
        ...prev.chart_sizes,
        sections: prev.chart_sizes.sections.map(s =>
          s.id === sectionId ? {
            ...s,
            rows: s.rows.map(r =>
              r.id === rowId ? { ...r, [field]: value } : r
            )
          } : s
        )
      } : null
    }));
  };

  const updateChartSizesIntro = (field: 'introText' | 'introImageUrl', value: string) => {
    initChartSizes();
    setFormData(prev => ({
      ...prev,
      chart_sizes: {
        ...(prev.chart_sizes || { introText: "", introImageUrl: "", sections: [] }),
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="text-white">Loading products...</div>;
  }

  const isEditing = isCreating || editingProduct;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? (editingProduct ? "Edit Product" : "Create Product") : "Products"}
        </h2>
        {!isEditing && (
          <Button onClick={handleCreate} className="bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {!isEditing && (
        <p className="text-sm text-gray-400">
          Chart Sizes are edited inside a product: click the pencil icon to open the editor tabs.
        </p>
      )}

      {isEditing ? (
        /* Editor Form with Tabs */
        <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-6 bg-[#2a2a2a] p-1 h-auto mb-6">
              <TabsTrigger
                value="basic"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="chart-sizes"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Chart Sizes
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Product title"
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Auto-generated from title"
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Teaser *</Label>
                <Textarea
                  value={formData.teaser}
                  onChange={(e) => setFormData(prev => ({ ...prev, teaser: e.target.value }))}
                  placeholder="Short description for listings"
                  className="bg-[#2a2a2a] border-gray-600 text-white"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Full product description"
                  className="bg-[#2a2a2a] border-gray-600 text-white"
                  rows={6}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: "" }))}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {(SUBCATEGORIES[formData.category] || []).map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g., TE42-LL"
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              {/* Main Image */}
              <div className="space-y-2">
                <MediaSelector
                  label="Main Product Image *"
                  currentImageUrl={formData.image_url}
                  onFileSelect={async (file) => {
                    try {
                      const categorySlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      const productSlug = formData.slug || generateSlug(formData.title || 'new-product');
                      const folderPath = `products/${categorySlug}/${productSlug}`;
                      
                      await ensureProductFolder(categorySlug, productSlug, formData.title || 'New Product');
                      
                      const fileExt = file.name.split('.').pop();
                      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                      const fileName = `${baseName}.${fileExt}`;
                      const filePath = `${folderPath}/${fileName}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('page-images')
                        .upload(filePath, file);
                        
                      if (uploadError) throw uploadError;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('page-images')
                        .getPublicUrl(filePath);
                      
                      await supabase.from('file_segment_mappings').insert({
                        file_path: filePath,
                        bucket_id: 'page-images',
                        segment_ids: [],
                        alt_text: formData.title || file.name
                      });
                        
                      setFormData(prev => ({ ...prev, image_url: publicUrl }));
                      toast.success("Image uploaded successfully");
                    } catch (error: any) {
                      console.error("Upload error:", error);
                      toast.error(error.message || "Failed to upload image");
                    }
                  }}
                  onMediaSelect={(url) => {
                    setFormData(prev => ({ ...prev, image_url: url }));
                  }}
                  previewSize="small"
                />
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <Label className="text-white">Gallery Images</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {formData.gallery_images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          gallery_images: prev.gallery_images.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-0 right-0 text-red-400 hover:text-red-300 p-1 h-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <MediaSelector
                  label="Add Gallery Image"
                  currentImageUrl=""
                  onFileSelect={async (file) => {
                    try {
                      const categorySlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      const productSlug = formData.slug || generateSlug(formData.title || 'new-product');
                      const folderPath = `products/${categorySlug}/${productSlug}`;
                      
                      await ensureProductFolder(categorySlug, productSlug, formData.title || 'New Product');
                      
                      const fileExt = file.name.split('.').pop();
                      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                      const shortId = Math.random().toString(36).slice(2, 6);
                      const fileName = `${baseName}-${shortId}.${fileExt}`;
                      const filePath = `${folderPath}/${fileName}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('page-images')
                        .upload(filePath, file);
                        
                      if (uploadError) throw uploadError;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('page-images')
                        .getPublicUrl(filePath);
                      
                      await supabase.from('file_segment_mappings').insert({
                        file_path: filePath,
                        bucket_id: 'page-images',
                        segment_ids: [],
                        alt_text: `${formData.title} - Gallery`
                      });
                        
                      setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, publicUrl] }));
                      toast.success("Gallery image added");
                    } catch (error: any) {
                      console.error("Upload error:", error);
                      toast.error(error.message || "Failed to upload image");
                    }
                  }}
                  onMediaSelect={(url) => {
                    setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, url] }));
                  }}
                  previewSize="small"
                />
              </div>

              {/* Documents/PDFs */}
              <div className="space-y-2">
                <Label className="text-white">Documents (PDFs, Datasheets)</Label>
                <div className="space-y-2 mb-2">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 bg-[#2a2a2a] p-2 rounded">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-white flex-1">{doc.title}</span>
                      <span className="text-xs text-gray-500">{doc.type}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          documents: prev.documents.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="doc-upload-input"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          const categorySlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                          const productSlug = formData.slug || generateSlug(formData.title || 'new-product');
                          const folderPath = `products/${categorySlug}/${productSlug}`;
                          
                          await ensureProductFolder(categorySlug, productSlug, formData.title || 'New Product');
                          
                          const fileExt = file.name.split('.').pop() || 'pdf';
                          const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                          const fileName = `${baseName}.${fileExt}`;
                          const filePath = `${folderPath}/${fileName}`;
                          
                          const { error: uploadError } = await supabase.storage
                            .from('page-images')
                            .upload(filePath, file);
                            
                          if (uploadError) throw uploadError;
                          
                          const { data: { publicUrl } } = supabase.storage
                            .from('page-images')
                            .getPublicUrl(filePath);

                          await supabase.from('file_segment_mappings').insert({
                            file_path: filePath,
                            bucket_id: 'page-images',
                            segment_ids: [],
                            alt_text: file.name.replace(/\.[^/.]+$/, '')
                          });
                          
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, {
                              url: publicUrl,
                              title: file.name.replace(/\.[^/.]+$/, ''),
                              type: fileExt.toUpperCase()
                            }]
                          }));
                          toast.success("Document uploaded");
                          e.target.value = '';
                        } catch (error: any) {
                          console.error("Upload error:", error);
                          toast.error(error.message || "Failed to upload document");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-opacity"
                      onClick={() => {
                        const input = document.getElementById('doc-upload-input') as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload from Computer
                    </Button>
                  </div>
                  
                  <Button
                    type="button"
                    style={{ backgroundColor: '#1e3a8a', color: 'white' }}
                    className="flex-1 hover:opacity-90 transition-opacity"
                    onClick={() => {
                      const event = new CustomEvent('open-doc-media-selector');
                      window.dispatchEvent(event);
                    }}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Select from Media
                  </Button>
                </div>
                
                {docMediaDialogOpen && (
                  <DataHubDialog
                    isOpen={docMediaDialogOpen}
                    onClose={() => setDocMediaDialogOpen(false)}
                    selectionMode={true}
                    onSelect={(url) => {
                      const fileName = url.split('/').pop() || 'document';
                      const fileExt = fileName.split('.').pop()?.toUpperCase() || 'PDF';
                      setFormData(prev => ({
                        ...prev,
                        documents: [...prev.documents, {
                          url: url,
                          title: fileName.replace(/\.[^/.]+$/, ''),
                          type: fileExt
                        }]
                      }));
                      setDocMediaDialogOpen(false);
                      toast.success("Document selected");
                    }}
                  />
                )}
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Chart Attributes / Specifications</Label>
                <p className="text-sm text-gray-400 mb-4">Add key-value pairs for technical specifications that will be displayed in the product detail page.</p>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 bg-[#2a2a2a] p-3 rounded">
                      <span className="text-gray-400 min-w-[140px] font-medium">{key}:</span>
                      <span className="text-white flex-1">{value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecification(key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Key (e.g., Size)"
                      className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                    />
                    <Input
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Value (e.g., 400 x 400 mm)"
                      className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                    />
                    <Button type="button" onClick={addSpecification} className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Chart Sizes Tab */}
            <TabsContent value="chart-sizes" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Chart Sizes</Label>
                    <p className="text-sm text-gray-400">Add chart size information with sections, tables, and images.</p>
                  </div>
                  <Button 
                    type="button" 
                    onClick={addChartSizeSection}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {/* Intro Section */}
                <div className="bg-[#2a2a2a] p-4 rounded-lg space-y-4">
                  <Label className="text-white text-sm">Introduction</Label>
                  <Textarea
                    value={formData.chart_sizes?.introText || ""}
                    onChange={(e) => updateChartSizesIntro('introText', e.target.value)}
                    placeholder="Introduction text for chart sizes section..."
                    className="bg-[#1a1a1a] border-gray-600 text-white"
                    rows={3}
                  />
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Introduction Image</Label>
                    <MediaSelector
                      label=""
                      currentImageUrl={formData.chart_sizes?.introImageUrl || ""}
                      onFileSelect={async () => {}}
                      onMediaSelect={(url) => updateChartSizesIntro('introImageUrl', url)}
                      previewSize="small"
                    />
                  </div>
                </div>

                {/* Sections */}
                {formData.chart_sizes?.sections?.map((section, sectionIndex) => (
                  <div key={section.id} className="bg-[#2a2a2a] p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={section.title}
                        onChange={(e) => updateChartSizeSection(section.id, 'title', e.target.value)}
                        placeholder="Section title (e.g., Reflective)"
                        className="bg-[#1a1a1a] border-gray-600 text-white max-w-xs font-semibold"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChartSizeSection(section.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Textarea
                      value={section.description}
                      onChange={(e) => updateChartSizeSection(section.id, 'description', e.target.value)}
                      placeholder="Section description..."
                      className="bg-[#1a1a1a] border-gray-600 text-white"
                      rows={2}
                    />

                    {/* Section Image */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Section Image</Label>
                      <MediaSelector
                        label=""
                        currentImageUrl={section.imageUrl}
                        onFileSelect={async () => {}}
                        onMediaSelect={(url) => updateChartSizeSection(section.id, 'imageUrl', url)}
                        previewSize="small"
                      />
                    </div>

                    {/* Size Table */}
                    {section.rows.length > 0 && (
                      <div className="rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#1a1a1a]">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Size ID</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">4:3</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">16:9</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Chart Size</th>
                              <th className="px-3 py-2 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {section.rows.map((row) => (
                              <tr key={row.id}>
                                <td className="px-3 py-2">
                                  <Input
                                    value={row.sizeId}
                                    onChange={(e) => updateChartSizeRow(section.id, row.id, 'sizeId', e.target.value)}
                                    className="bg-[#1a1a1a] border-gray-600 text-white h-7 text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={row.aspectRatio43}
                                    onChange={(e) => updateChartSizeRow(section.id, row.id, 'aspectRatio43', e.target.value)}
                                    className="bg-[#1a1a1a] border-gray-600 text-white h-7 text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={row.aspectRatio169}
                                    onChange={(e) => updateChartSizeRow(section.id, row.id, 'aspectRatio169', e.target.value)}
                                    className="bg-[#1a1a1a] border-gray-600 text-white h-7 text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={row.chartSize}
                                    onChange={(e) => updateChartSizeRow(section.id, row.id, 'chartSize', e.target.value)}
                                    className="bg-[#1a1a1a] border-gray-600 text-white h-7 text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeChartSizeRow(section.id, row.id)}
                                    className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Add Row */}
                    <div className="grid grid-cols-5 gap-2">
                      <Input
                        value={newChartSizeRow.sizeId}
                        onChange={(e) => setNewChartSizeRow(prev => ({ ...prev, sizeId: e.target.value }))}
                        placeholder="Size ID"
                        className="bg-[#1a1a1a] border-gray-600 text-white text-sm"
                      />
                      <Input
                        value={newChartSizeRow.aspectRatio43}
                        onChange={(e) => setNewChartSizeRow(prev => ({ ...prev, aspectRatio43: e.target.value }))}
                        placeholder="4:3 (e.g., 800 x 600)"
                        className="bg-[#1a1a1a] border-gray-600 text-white text-sm"
                      />
                      <Input
                        value={newChartSizeRow.aspectRatio169}
                        onChange={(e) => setNewChartSizeRow(prev => ({ ...prev, aspectRatio169: e.target.value }))}
                        placeholder="16:9 (e.g., 1066 x 600)"
                        className="bg-[#1a1a1a] border-gray-600 text-white text-sm"
                      />
                      <Input
                        value={newChartSizeRow.chartSize}
                        onChange={(e) => setNewChartSizeRow(prev => ({ ...prev, chartSize: e.target.value }))}
                        placeholder="Chart Size"
                        className="bg-[#1a1a1a] border-gray-600 text-white text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => addChartSizeRow(section.id)}
                        disabled={!newChartSizeRow.sizeId}
                        className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!formData.chart_sizes?.sections || formData.chart_sizes.sections.length === 0) && (
                  <div className="text-center py-8 text-gray-500 bg-[#2a2a2a] rounded-lg">
                    No chart size sections yet. Click "Add Section" to create one.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Features & Filters Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Filter Criteria (2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Filter Criteria</h3>
                    
                    {/* 1. Product Type */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white text-sm">1. Product Type</Label>
                      <p className="text-xs text-gray-500">What is it fundamentally?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRODUCT_TYPES.map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={formData.product_types.includes(type) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                product_types: prev.product_types.includes(type)
                                  ? prev.product_types.filter(t => t !== type)
                                  : [...prev.product_types, type]
                              }));
                            }}
                            className={`text-xs ${formData.product_types.includes(type) 
                              ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Measurement Focus */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white text-sm">2. Measurement Focus</Label>
                      <p className="text-xs text-gray-500">What is primarily measured?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {MEASUREMENT_FOCUS.map((focus) => (
                          <Button
                            key={focus}
                            type="button"
                            variant={formData.measurement_focus.includes(focus) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                measurement_focus: prev.measurement_focus.includes(focus)
                                  ? prev.measurement_focus.filter(f => f !== focus)
                                  : [...prev.measurement_focus, focus]
                              }));
                            }}
                            className={`text-xs ${formData.measurement_focus.includes(focus) 
                              ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {focus}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Format / Field of View */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white text-sm">3. Format / Field of View</Label>
                      <p className="text-xs text-gray-500">Image format and field of view coverage</p>
                      <div className="flex flex-wrap gap-1.5">
                        {FORMAT_FOV.map((format) => (
                          <Button
                            key={format}
                            type="button"
                            variant={formData.format_fov.includes(format) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                format_fov: prev.format_fov.includes(format)
                                  ? prev.format_fov.filter(f => f !== format)
                                  : [...prev.format_fov, format]
                              }));
                            }}
                            className={`text-xs ${formData.format_fov.includes(format) 
                              ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Application */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-white text-sm">4. Application</Label>
                      <p className="text-xs text-gray-500">Where is the product typically used?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {APPLICATION_OPTIONS.map((app) => (
                          <Button
                            key={app}
                            type="button"
                            variant={formData.applications.includes(app) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                applications: prev.applications.includes(app)
                                  ? prev.applications.filter(a => a !== app)
                                  : [...prev.applications, app]
                              }));
                            }}
                            className={`text-xs ${formData.applications.includes(app) 
                              ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {app}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Integration / Special Features */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm">5. Integration / Special Features</Label>
                      <p className="text-xs text-gray-500">Special product features (optional)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {INTEGRATION_FEATURES.map((feature) => (
                          <Button
                            key={feature}
                            type="button"
                            variant={formData.integration_features.includes(feature) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                integration_features: prev.integration_features.includes(feature)
                                  ? prev.integration_features.filter(f => f !== feature)
                                  : [...prev.integration_features, feature]
                              }));
                            }}
                            className={`text-xs ${formData.integration_features.includes(feature) 
                              ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {feature}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Badges Preview */}
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700 sticky top-4">
                    <h3 className="text-white font-semibold mb-2">Display Badges</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Short, prominent labels shown on product cards. Auto-generated from selected filters.
                    </p>
                    
                    {/* Preview of current badges */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-400 text-xs">Preview (max 4)</Label>
                        <div className="flex flex-wrap gap-1.5 mt-2 min-h-[32px] bg-[#0f0f0f] rounded p-2">
                          {(() => {
                            const badges = [
                              ...formData.measurement_focus.slice(0, 2),
                              ...formData.format_fov.filter(f => f !== "Standard").slice(0, 1),
                              ...formData.applications.slice(0, 1),
                            ].slice(0, 4);
                            
                            return badges.length > 0 ? badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded bg-[#f9dc24]/15 text-[#f9dc24] border border-[#f9dc24]/30"
                              >
                                {badge}
                              </span>
                            )) : (
                              <span className="text-xs text-gray-600 italic">No badges selected</span>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700">
                        <Label className="text-gray-400 text-xs block mb-2">Badge Sources</Label>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Measurement Focus:</span>
                            <span className="text-white">{formData.measurement_focus.length} selected</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Format/FOV:</span>
                            <span className="text-white">{formData.format_fov.filter(f => f !== "Standard").length} visible</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Applications:</span>
                            <span className="text-white">{formData.applications.length} selected</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-600 pt-2">
                        Badge priority: 2× Measurement Focus, 1× Format (excl. Standard), 1× Application
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pre-order">Pre-Order</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Position</Label>
                  <Input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 999 }))}
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label className="text-white">Published</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions - Always visible */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90"
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-gray-600 text-white hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* Products List */
        <div className="grid gap-4">
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No products yet. Click "Add Product" to create one.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-4"
              >
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {product.title}
                    </h3>
                    {!product.published && (
                      <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{product.teaser}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-[#f9dc24]/20 text-[#f9dc24] px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        {product.subcategory}
                      </span>
                    )}
                    {product.sku && (
                      <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/en/products/test-charts/${product.slug}`, '_blank')}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="text-[hsl(var(--yellow))] hover:text-[hsl(var(--yellow))]/80"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default ProductsEditor;
