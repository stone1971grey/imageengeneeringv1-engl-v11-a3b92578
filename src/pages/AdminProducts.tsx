import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import ProductsEditor from "@/components/admin/ProductsEditor";
import { ArrowLeft } from "lucide-react";

const ADMIN_SELECTED_PAGE_KEY = "admin_selected_page";

const AdminProducts = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [backToOverviewHandler, setBackToOverviewHandler] = useState<(() => void) | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAdminRole = roles?.some(r => r.role === "admin");
      
      if (!hasAdminRole) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    const savedPage = sessionStorage.getItem(ADMIN_SELECTED_PAGE_KEY);
    if (savedPage) {
      navigate(`/en/admin-dashboard?page=${encodeURIComponent(savedPage)}`);
    } else {
      navigate("/en/admin-dashboard");
    }
  };

  const handleEditingChange = useCallback((isEditing: boolean, onBackToOverview: () => void) => {
    setIsEditingProduct(isEditing);
    setBackToOverviewHandler(() => onBackToOverview);
  }, []);

  const handleBackClick = () => {
    if (isEditingProduct && backToOverviewHandler) {
      backToOverviewHandler();
    } else {
      handleBackToDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-xl text-white">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-32 max-w-[1600px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Product Management</h1>
            <p className="text-gray-400 mt-2">Create and manage products, test charts, and equipment</p>
          </div>
          <Button
            onClick={handleBackClick}
            variant="outline"
            className="flex items-center gap-2 border-gray-600 text-white hover:bg-[#2a2a2a]"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEditingProduct ? "Back to Overview" : "Back to Dashboard"}
          </Button>
        </div>

        <ProductsEditor onEditingChange={handleEditingChange} />
      </div>
    </div>
  );
};

export default AdminProducts;
