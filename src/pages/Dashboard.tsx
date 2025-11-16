import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Star, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import wizardLineArt from "@/assets/wizard-line-art.png";
import ChatInterface from "@/components/ChatInterface";
import FavoritesPanel from "@/components/FavoritesPanel";

type Tab = "chat" | "favorites";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={wizardLineArt} 
              alt="Wizard" 
              className="w-12 h-12"
            />
            <h1 className="text-xl font-bold text-foreground font-gothic">
              Medical AI
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Your personal health assistant
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === "favorites"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <Star className="w-5 h-5" />
            <span className="font-medium">Favorites</span>
          </button>
        </nav>

        {/* Back to Home button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "favorites" && <FavoritesPanel />}
      </main>
    </div>
  );
};

export default Dashboard;
