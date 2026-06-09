import ClearAllIcon from "@mui/icons-material/ClearAll";
import { SnackbarState } from "@/app/lots/type";
import { Button } from "@mui/material";

interface ClearAllButtonProps {
  onClearSuccess: () => void;
  showNotification: (message: string, severity: SnackbarState["severity"]) => void;
}

export default function ClearAllButton({ 
  onClearSuccess, 
  showNotification 
}: ClearAllButtonProps) {
  const handleClear = async () => {
    if (!confirm("Are you sure you want to delete ALL lots?")) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Clear operation failed");
      
      onClearSuccess();
      showNotification("All lots cleared successfully", "success");
    } catch {
      showNotification("Failed to clear lots", "error");
    }
  };

  return (
    <div className="flex justify-end my-4">
      <Button
        variant="contained"
        color="error"
        startIcon={<ClearAllIcon />}
        onClick={handleClear}
      >
        Clear All Lots
      </Button>
    </div>
  );
}