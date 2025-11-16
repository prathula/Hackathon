import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Upload } from "lucide-react";
import wizardHD from "@/assets/wizard-hd.png";
import spellbookImg from "@/assets/spellbook.png";
import LoadingSpinner from "./LoadingSpinner";

const MedicalSimplification = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
      toast({
        title: "Document loaded",
        description: "Your document has been loaded into the translation chamber.",
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty scroll",
        description: "Please provide medical text to simplify.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowResponse(false);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("simplify-medical", {
        body: { medicalText: input },
      });

      if (error) throw error;

      setShowResponse(true);
      const text = data.simplified;
      let currentText = "";
      
      for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        setResponse(currentText);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } catch (error: any) {
      toast({
        title: "Translation failed",
        description: error.message || "Failed to simplify medical text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-card-foreground mb-3 font-gothic">
          Rune Translation Chamber
        </h2>
        <p className="text-card-foreground/70 text-lg">
          Transform complex medical scrolls into plain language
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Side - Enchanted Chest */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img src={spellbookImg} alt="Spellbook" className="w-16 h-16" />
            <h3 className="text-2xl font-bold text-card-foreground font-gothic">
              Original Text
            </h3>
          </div>

          <div className="scroll-surface rounded-2xl p-6 shadow-2xl">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your lab results, x-ray report, or doctor's notes here..."
              className="min-h-[300px] bg-transparent border-0 text-card-foreground placeholder:text-card-foreground/50 text-lg resize-none focus-visible:ring-0 font-gothic"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1 border-2 border-primary/50 hover:bg-primary/10"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full ember-button text-white py-6 text-xl rounded-2xl font-semibold"
          >
            {loading ? "Translating Runes..." : "Simplify Text"}
          </Button>
        </div>

        {/* Output Side - Translation */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img src={wizardHD} alt="Wizard" className="w-16 h-16" />
            <h3 className="text-2xl font-bold text-card-foreground font-gothic">
              Plain Translation
            </h3>
          </div>

          {loading && <LoadingSpinner message="Deciphering ancient medical runes..." />}

          {showResponse && !loading && (
            <div className="scroll-surface rounded-2xl p-8 shadow-2xl min-h-[300px] animate-page-enter">
              <div className="space-y-6">
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed text-lg font-gothic">
                  {response}
                </p>
              </div>
            </div>
          )}

          {!showResponse && !loading && (
            <div className="scroll-surface rounded-2xl p-8 shadow-2xl min-h-[300px] flex items-center justify-center">
              <div className="text-center text-card-foreground/50">
                <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-gothic">
                  Your simplified translation will appear here...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Warning */}
      {showResponse && (
        <div className="bg-destructive/20 border-2 border-destructive rounded-2xl p-8 shadow-xl animate-page-enter">
          <p className="text-card-foreground font-semibold text-center text-lg">
            ⚠️ This is a simplified explanation. Always consult your healer for medical decisions.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalSimplification;
