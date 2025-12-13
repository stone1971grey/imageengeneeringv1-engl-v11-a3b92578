import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { MediaSelector } from "./MediaSelector";

interface Product {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  image_url: string;
  category: string;
  subcategory: string | null;
  sku: string | null;
  specifications: Record<string, string>;
  features: string[];
  applications: string[];
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    teaser: "",
    description: "",
    image_url: "",
    category: "Test Charts",
    subcategory: "",
    sku: "",
    specifications: {} as Record<string, string>,
    features: [] as string[],
    applications: [] as string[],
    price_info: "",
    availability: "available",
    language_code: "EN",
    published: true,
    visibility: "public",
    position: 999
  });

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newApplication, setNewApplication] = useState("");

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
        specifications: typeof p.specifications === 'object' ? p.specifications : {},
        features: Array.isArray(p.features) ? p.features : [],
        applications: Array.isArray(p.applications) ? p.applications : []
      }));
      
      setProducts(transformedProducts as Product[]);
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
      category: "Test Charts",
      subcategory: "",
      sku: "",
      specifications: {},
      features: [],
      applications: [],
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
      category: product.category,
      subcategory: product.subcategory || "",
      sku: product.sku || "",
      specifications: product.specifications || {},
      features: product.features || [],
      applications: product.applications || [],
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
      
      const productData = {
        slug,
        title: formData.title,
        teaser: formData.teaser,
        description: formData.description || null,
        image_url: formData.image_url,
        category: formData.category,
        subcategory: formData.subcategory || null,
        sku: formData.sku || null,
        specifications: formData.specifications,
        features: formData.features,
        applications: formData.applications,
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
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        toast.success("Product created successfully");
      }

      await loadProducts();
      handleCancel();
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

      {isEditing ? (
        /* Editor Form */
        <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
          {/* Basic Info */}
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
              rows={4}
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <MediaSelector
              label="Product Image *"
              currentImageUrl={formData.image_url}
              onFileSelect={async (file) => {
                // Upload to Supabase Storage
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                  const filePath = `products/${fileName}`;
                  
                  const { error: uploadError } = await supabase.storage
                    .from('page-images')
                    .upload(filePath, file);
                    
                  if (uploadError) throw uploadError;
                  
                  const { data: { publicUrl } } = supabase.storage
                    .from('page-images')
                    .getPublicUrl(filePath);
                    
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

          {/* Specifications */}
          <div className="space-y-2">
            <Label className="text-white">Specifications</Label>
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-[#2a2a2a] p-2 rounded">
                  <span className="text-gray-400 min-w-[120px]">{key}:</span>
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
              <div className="flex gap-2">
                <Input
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Key (e.g., Size)"
                  className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                />
                <Input
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Value (e.g., 400x400mm)"
                  className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                />
                <Button type="button" onClick={addSpecification} variant="outline" className="border-gray-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label className="text-white">Features</Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#2a2a2a] p-2 rounded">
                  <span className="text-white flex-1">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline" className="border-gray-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="space-y-2">
            <Label className="text-white">Applications</Label>
            <div className="space-y-2">
              {formData.applications.map((app, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#2a2a2a] p-2 rounded">
                  <span className="text-white flex-1">{app}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeApplication(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newApplication}
                  onChange={(e) => setNewApplication(e.target.value)}
                  placeholder="Add an application"
                  className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
                />
                <Button type="button" onClick={addApplication} variant="outline" className="border-gray-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
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
