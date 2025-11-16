import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicalText } = await req.json();

    if (!medicalText) {
      throw new Error("No medical text provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI for medical simplification...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are the Grand Wizard's Translation Assistant at the Apothecary. Your role is to transform complex medical jargon, 
            lab results, and clinical reports into clear, understandable language for patients. Maintain the mystical fantasy tone while being 
            medically accurate. Structure your response as:
            
            **What This Means:**
            [Plain language explanation]
            
            **The Details:**
            [Break down each medical term or finding]
            
            **What Happens Next:**
            [Typical next steps or follow-up]
            
            **Important Notes:**
            [Any concerns or red flags]`,
          },
          {
            role: "user",
            content: `Please translate these mystical medical runes into plain language:\n\n${medicalText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway returned ${response.status}: ${error}`);
    }

    const data = await response.json();
    const simplified = data.choices[0]?.message?.content;

    if (!simplified) {
      throw new Error("No simplified text received from AI");
    }

    // Save to chat history
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);

      if (user) {
        await supabaseClient.from("chat_history").insert({
          user_id: user.id,
          query_type: "simplify",
          query_text: medicalText.substring(0, 500),
          response_text: simplified,
        });
      }
    }

    return new Response(JSON.stringify({ simplified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in simplify-medical function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
