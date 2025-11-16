/**
 * CHAT INTERFACE COMPONENT
 * Purpose: Text-based chat UI with PDF simplification
 * Features: Real-time streaming, favorites, PDF export, EMS button
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Star, StarOff, Download, Loader2, FileText, Phone, Trash2, X, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import wizardLineArt from "@/assets/wizard-line-art.png";
import scrollUnroll from "@/assets/scroll-unroll.png";

interface Message {
  id: string;
  created_at: string;
  query_text: string;
  response_text: string;
  query_type: string;
  is_favorite?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, pendingUserMessage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const streamText = async (text: string) => {
    setIsStreaming(true);
    setStreamingText("");

    for (let i = 0; i < text.length; i++) {
      setStreamingText(prev => prev + text[i]);
      await new Promise(resolve => setTimeout(resolve, 15));
    }

    setIsStreaming(false);
    setStreamingText("");
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) {
      toast({
        title: "Empty message",
        description: "Please enter a message or upload a PDF.",
        variant: "destructive",
      });
      return;
    }

    const userQuery = selectedFile ? `[PDF] ${selectedFile.name}\n${input}` : input;
    setPendingUserMessage(userQuery);

    setLoading(true);

    try {
      let response;
      let queryText = input;
      let queryType = "text";

      if (selectedFile) {
        const reader = new FileReader();
        const pdfText = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(selectedFile);
        });
        
        response = await supabase.functions.invoke("simplify-medical", {
          body: { medicalText: pdfText + "\n" + input },
        });
        queryText = `[PDF] ${selectedFile.name}\n${input}`;
        queryType = "pdf";
      } else {
        response = await supabase.functions.invoke("diagnose", {
          body: { symptoms: input },
        });
        queryText = input;
        queryType = "text";
      }

      if (response.error) throw response.error;

      const responseText = selectedFile ? response.data.simplified : response.data.diagnosis;

      await streamText(responseText);

      // Store message in local state (no database save)
      const newMessage: Message = {
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        query_text: queryText,
        response_text: responseText,
        query_type: queryType,
      };
      setMessages(prev => [...prev, newMessage]);

      setInput("");
      clearFile();
      setPendingUserMessage(null);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
      setPendingUserMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleFavorite = (messageId: string, currentFavorite: boolean) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, is_favorite: !currentFavorite } : msg
      )
    );
    toast({
      title: currentFavorite ? "Removed from favorites" : "Added to favorites",
    });
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Message deleted",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.text("Chat History", 20, yPosition);
    yPosition += 10;

    messages.forEach((msg) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("You:", 20, yPosition);
      yPosition += 7;

      doc.setFont(undefined, "normal");
      const queryLines = doc.splitTextToSize(msg.query_text, 170);
      doc.text(queryLines, 20, yPosition);
      yPosition += queryLines.length * 7 + 3;

      doc.setFont(undefined, "bold");
      doc.text("AI:", 20, yPosition);
      yPosition += 7;

      doc.setFont(undefined, "normal");
      const responseLines = doc.splitTextToSize(msg.response_text, 170);
      doc.text(responseLines, 20, yPosition);
      yPosition += responseLines.length * 7 + 10;
    });

    doc.save("chat-history.pdf");
  };

  const callEMS = () => {
    window.location.href = "tel:911";
    toast({
      title: "Calling Emergency Services",
      description: "Initiating call to 911",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex justify-between items-center bg-background">
        <div className="flex items-center gap-3">
          <img src={wizardLineArt} alt="Wizard" className="w-10 h-10" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Medical Assistant</h2>
            <p className="text-sm text-muted-foreground">Ask me anything about your health</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={callEMS}>
            <Phone className="w-4 h-4 mr-2" />
            Call EMS
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !pendingUserMessage && (
            <div className="text-center py-12">
              <img src={wizardLineArt} alt="Wizard" className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Start a conversation by describing your symptoms or uploading a medical PDF.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                  <p className="text-foreground whitespace-pre-wrap">{message.query_text}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <img src={wizardLineArt} alt="Wizard" className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1 bg-secondary/30 rounded-lg p-4">
                  <div className="markdown-content">
                    <ReactMarkdown>{message.response_text}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(message.id, message.is_favorite || false)}
                    >
                      {message.is_favorite ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pendingUserMessage && (
            <div className="flex justify-end">
              <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                <p className="text-foreground whitespace-pre-wrap">{pendingUserMessage}</p>
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="flex gap-3">
              <img src={wizardLineArt} alt="Wizard" className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 bg-secondary/30 rounded-lg p-4 relative">
                <img 
                  src={scrollUnroll} 
                  alt="Scroll" 
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-10 animate-scroll-unravel"
                />
                <div className="markdown-content relative z-10">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {loading && !isStreaming && (
            <div className="flex gap-3">
              <img src={wizardLineArt} alt="Wizard" className="w-8 h-8 flex-shrink-0" />
              <div className="bg-secondary/30 rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-3">
          {selectedFile && (
            <div className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2">
              <FileText className="w-4 h-4" />
              <span className="flex-1 text-sm text-foreground">{selectedFile.name}</span>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or add context for PDF..."
              className="min-h-[80px] resize-none flex-1"
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !selectedFile)}
                size="icon"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line. Upload PDF for medical document simplification.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
