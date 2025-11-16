import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import dragonLineArt from "@/assets/dragon-line-art.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
      {/* Main content */}
      <div className="relative z-10 animate-page-enter max-w-2xl mx-auto px-6">
        <div className="bg-card border border-border rounded-3xl p-12 shadow-sm">
          {/* Dragon line art */}
          <div className="flex justify-center mb-8">
            <img 
              src={dragonLineArt} 
              alt="Dragon seeking medical help" 
              className="w-40 h-40 opacity-80"
            />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-light text-foreground mb-4 tracking-wide">
              Medical AI
            </h1>
            <p className="text-lg text-muted-foreground font-light">
              Your personal health assistant powered by AI
            </p>
          </div>

          {/* Enter button */}
          <div className="mt-10">
            <Button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-2xl font-light transition-all duration-300"
            >
              Start Chatting
            </Button>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center mt-8 text-muted-foreground font-light text-sm">
          Intelligent health guidance at your fingertips
        </p>
      </div>
    </div>
  );
};

export default Landing;
