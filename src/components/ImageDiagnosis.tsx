import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import wizardHD from "@/assets/wizard-hd.png";
import portalImg from "@/assets/portal.png";
import LoadingSpinner from "./LoadingSpinner";

const ImageDiagnosis = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowResponse(false);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("diagnose-image", {
        body: { image: selectedImage },
      });

      if (error) throw error;

      setShowResponse(true);
      const text = data.diagnosis;
      let currentText = "";
      
      for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        setResponse(currentText);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } catch (error: any) {
      toast({
        title: "The wizard is troubled",
        description: error.message || "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-card-foreground mb-3 font-gothic">
          Image Scrying Portal
        </h2>
        <p className="text-card-foreground/70 text-lg">
          Show the wizard your injury or concern for mystical analysis
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Image Upload Portal */}
        <div 
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative w-80 h-80 rounded-full overflow-hidden transition-all duration-500 group-hover:scale-105">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={portalImg} 
                  alt="Upload Portal" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 animate-crystal-spin"
                />
                <div className="relative z-10 text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <p className="text-xl font-gothic text-foreground">
                    Click to Upload Image
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedImage}
          className="ember-button text-white px-16 py-7 text-xl rounded-2xl font-semibold shadow-2xl"
        >
          {loading ? "Scrying the Image..." : "Consult the Wizard"}
        </Button>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="The wizard gazes into the crystal..." />}

      {/* Wizard's Response */}
      {showResponse && !loading && (
        <div className="mt-12 space-y-6 animate-page-enter">
          <div className="flex items-start gap-6">
            <img 
              src={wizardHD} 
              alt="Wizard" 
              className="w-24 h-24"
            />
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-card-foreground mb-4 font-gothic">
                The Wizard's Vision
              </h3>
              <div className="scroll-surface rounded-2xl p-8 shadow-2xl">
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed text-lg font-gothic">
                  {response}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Warning */}
          <div className="bg-destructive/20 border-2 border-destructive rounded-2xl p-8 shadow-xl">
            <p className="text-card-foreground font-semibold text-center text-lg">
              ⚠️ If your condition worsens or you feel unsafe, summon Emergency Services immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDiagnosis;
