import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { migrateNavigationToDb } from "@/utils/migrateNavigationToDb";

export const NavigationMigrationButton = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    if (!confirm("This will migrate all navigation links from static files to the database. Continue?")) {
      return;
    }

    setIsMigrating(true);
    try {
      const count = await migrateNavigationToDb();
      toast.success(`Successfully migrated ${count} navigation links to database!`, {
        description: "Navigation now supports automatic slug updates"
      });
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Failed to migrate navigation links", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Button
      onClick={handleMigration}
      disabled={isMigrating}
      variant="outline"
      className="bg-blue-900 border-blue-700 text-white hover:bg-blue-800 hover:border-blue-600"
    >
      {isMigrating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Migrating...
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-2" />
          Migrate Navigation to DB
        </>
      )}
    </Button>
  );
};
