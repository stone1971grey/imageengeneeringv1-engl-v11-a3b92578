import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, FileText, Download, ArrowLeft, Star } from "lucide-react";
import { charts } from "@/data/charts";
import { useLanguage } from "@/contexts/LanguageContext";

const TestChartDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);

  const chart = charts.find(c => c.slug === slug);

  if (!chart) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navigation />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Chart Not Found</h1>
          <p className="text-gray-400 mb-8">The requested test chart could not be found.</p>
          <Button 
            onClick={() => navigate(`/${language}/products/test-charts`)}
            className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Charts
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const priceDisplay = chart.price_mode === 'rfq' 
    ? 'Price on Request' 
    : chart.price_mode === 'from' 
      ? `from ${chart.price_from?.toLocaleString()}€`
      : `${chart.price_from?.toLocaleString()}€`;

  const allImages = chart.gallery.length > 0 ? chart.gallery : [chart.heroImage];

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navigation />

      {/* Breadcrumb */}
      <section className="pt-28 pb-4 border-b border-gray-800">
        <div className="container mx-auto px-6">
          <button 
            onClick={() => navigate(`/${language}/products/test-charts`)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#f9dc24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Test Charts
          </button>
        </div>
      </section>

      {/* Product Hero */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Gallery - Compact */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden max-w-md mx-auto lg:mx-0">
                <img
                  src={allImages[selectedImage]}
                  alt={chart.title}
                  className="w-full h-full object-contain p-6"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 justify-center lg:justify-start">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === idx 
                          ? 'border-[#f9dc24]' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1 bg-gray-900" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and SKU */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{chart.title}</h1>
                  <span className="text-gray-400 font-mono">{chart.sku}</span>
                </div>
                <p className="text-lg text-gray-300">{chart.excerpt}</p>
              </div>

              {/* Standards */}
              {chart.standards.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Standards</h3>
                  <div className="flex flex-wrap gap-2">
                    {chart.standards.map((standard, idx) => (
                      <Badge 
                        key={idx}
                        className="bg-gray-800 text-gray-200 border border-gray-700"
                      >
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility */}
              {chart.compatibility.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Compatibility</h3>
                  <div className="flex flex-wrap gap-2">
                    {chart.compatibility.map((item, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Section */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4">
                <div>
                  <span className={`text-2xl font-bold ${chart.price_mode === 'rfq' ? 'text-white' : 'text-[#f9dc24]'}`}>
                    {priceDisplay}
                  </span>
                  {chart.price_mode === 'rfq' && (
                    <p className="text-sm text-gray-400 mt-1">Contact us for an individual quote</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    size="lg"
                    className="flex-1 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {chart.price_mode === 'rfq' ? 'Request Quote' : 'Add to Cart'}
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24] hover:text-black"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Request Quote
                  </Button>
                </div>

                {/* Downloads Link */}
                {chart.downloads.length > 0 && (
                  <button className="flex items-center gap-2 text-gray-400 hover:text-[#f9dc24] transition-colors">
                    <Download className="w-4 h-4" />
                    Download Datasheet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="py-12 bg-[#141414]">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 bg-[#1a1a1a] p-1 h-auto">
              <TabsTrigger 
                value="description" 
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Technical Data
              </TabsTrigger>
              <TabsTrigger 
                value="compatibility" 
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Compatibility
              </TabsTrigger>
              <TabsTrigger 
                value="downloads" 
                className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
              >
                Downloads
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 max-w-4xl mx-auto">
              <TabsContent value="description" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Product Description</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{chart.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Application Areas</h3>
                    <ul className="space-y-2">
                      {chart.applications.map((app, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300">
                          <Star className="w-4 h-4 text-[#f9dc24]" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Available Materials</h3>
                    <ul className="space-y-2">
                      {chart.materials.map((material, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300">
                          <Star className="w-4 h-4 text-[#f9dc24]" />
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Technical Specifications</h2>
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="px-4 py-3 text-gray-400 font-medium">SKU</td>
                        <td className="px-4 py-3 text-white">{chart.sku}</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="px-4 py-3 text-gray-400 font-medium">Standards</td>
                        <td className="px-4 py-3 text-white">{chart.standards.join(', ')}</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="px-4 py-3 text-gray-400 font-medium">Available Sizes</td>
                        <td className="px-4 py-3 text-white">{chart.sizes.join(', ')}</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="px-4 py-3 text-gray-400 font-medium">Materials</td>
                        <td className="px-4 py-3 text-white">{chart.materials.join(', ')}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-400 font-medium">Categories</td>
                        <td className="px-4 py-3 text-white">{chart.categories.join(', ')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="compatibility" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">System Compatibility</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chart.compatibility.map((item, idx) => (
                    <div key={idx} className="bg-[#1a1a1a] rounded-lg p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f9dc24]/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-[#f9dc24]" />
                      </div>
                      <span className="text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="downloads" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Downloads & Resources</h2>
                <div className="space-y-3">
                  {chart.downloads.map((download, idx) => (
                    <a 
                      key={idx}
                      href={download.url}
                      className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#222] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-[#f9dc24]" />
                        <span className="text-white">{download.name}</span>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {download.type}
                      </Badge>
                    </a>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Test Chart Consultation?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Need help selecting the right test chart for your application? Our experts are here to help.
          </p>
          <Button size="lg" className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold">
            Contact Our Experts
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestChartDetail;