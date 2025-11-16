import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import wizardHD from "@/assets/wizard-hd.png";
import LoadingSpinner from "./LoadingSpinner";

const TextDiagnosis = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty scroll",
        description: "Please describe your ailment to the wizard.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowResponse(false);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: { symptoms: input },
      });

      if (error) throw error;

      // Typewriter effect
      setShowResponse(true);
      const text = data.diagnosis;
      let currentText = "";
      
      for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        setResponse(currentText);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error: any) {
      toast({
        title: "The wizard is troubled",
        description: error.message || "Failed to receive diagnosis. Please try again.",
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
          Describe Your Ailment
        </h2>
        <p className="text-card-foreground/70 text-lg">
          The Grand Wizard will analyze your symptoms and provide mystical guidance
        </p>
      </div>

      {/* Dragon scroll input */}
      <div className="space-y-6">
        <div className="scroll-surface rounded-2xl p-8 shadow-2xl">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell the wizard about your symptoms, injuries, or concerns..."
            className="min-h-[280px] bg-transparent border-0 text-card-foreground placeholder:text-card-foreground/50 text-lg resize-none focus-visible:ring-0 font-gothic"
            disabled={loading}
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="ember-button text-white px-16 py-7 text-xl rounded-2xl font-semibold shadow-2xl"
          >
            {loading ? "Invoking the Wizard..." : "Invoke the Wizard"}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="The wizard consults his ancient tomes..." />}

      {/* Wizard's response */}
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
                The Wizard's Counsel
              </h3>
              <div className="scroll-surface rounded-2xl p-8 shadow-2xl">
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed text-lg font-gothic">
                  {response}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency warning */}
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

export default TextDiagnosis;
