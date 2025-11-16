import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import spellbookImg from "@/assets/spellbook.png";

interface ChatEntry {
  id: string;
  created_at: string;
  query_text: string;
  response_text: string;
  query_type: string;
}

const ChatHistory = () => {
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory(history.filter(entry => entry.id !== id));
      toast({
        title: "Entry removed",
        description: "The scroll has been erased from history.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Text Diagnosis",
      image: "Image Scrying",
      simplify: "Rune Translation",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ScrollText className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-xl font-gothic text-card-foreground/70">
            Opening the ancient tome...
          </p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <img src={spellbookImg} alt="Empty book" className="w-32 h-32 mb-6 opacity-50" />
        <h3 className="text-2xl font-bold text-card-foreground mb-2 font-gothic">
          The Tome is Empty
        </h3>
        <p className="text-card-foreground/70 text-lg">
          Your consultation history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-card-foreground mb-3 font-gothic">
          The Grand Tome of Consultations
        </h2>
        <p className="text-card-foreground/70 text-lg">
          Browse your past exchanges with the wizard
        </p>
      </div>

      <div className="space-y-4">
        {history.map((entry, index) => (
          <div
            key={entry.id}
            className="parchment-card rounded-2xl p-6 shadow-xl transition-all duration-500 hover:shadow-2xl animate-page-enter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                    {getTypeLabel(entry.query_type)}
                  </span>
                  <span className="text-sm text-card-foreground/60">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-card-foreground font-gothic line-clamp-2">
                  {entry.query_text}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEntry(entry.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            {expandedId === entry.id ? (
              <div className="scroll-surface rounded-xl p-6 mt-4 animate-page-enter">
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed font-gothic">
                  {entry.response_text}
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setExpandedId(null)}
                  className="mt-4 text-primary hover:text-primary/80"
                >
                  Close scroll
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setExpandedId(entry.id)}
                className="mt-2 text-primary hover:text-primary/80"
              >
                Read the wizard's response →
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
