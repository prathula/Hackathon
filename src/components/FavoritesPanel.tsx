/**
 * FAVORITES PANEL COMPONENT
 * Purpose: Display favorited messages from session
 * Note: Favorites are stored in session only (no auth required)
 */

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import wizardLineArt from "@/assets/wizard-line-art.png";

const FavoritesPanel = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background">
        <div className="flex items-center gap-3">
          <img src={wizardLineArt} alt="Wizard" className="w-10 h-10" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Favorites</h2>
            <p className="text-sm text-muted-foreground">Your starred messages</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">No favorites yet</p>
            <p className="text-sm text-muted-foreground">
              Star important messages in the chat to see them here
            </p>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Note: Favorites are stored in your current session only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPanel;
