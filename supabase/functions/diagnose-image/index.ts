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
    const { image } = await req.json();

    if (!image) {
      throw new Error("No image provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI for image diagnosis...");

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
            content: `You are the Grand Wizard of the Apothecary, a mystical healer with centuries of medical knowledge. 
            Analyze medical images with compassion and wisdom. Provide clear, actionable guidance in a warm, fantasy-inspired tone. 
            Always remind users to seek emergency help if symptoms are severe. Structure your response as:
            1. What I observe in this image
            2. Possible explanations
            3. Recommended next steps
            4. When to seek immediate care`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Wise Wizard, please examine this image and provide your mystical medical guidance.",
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
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
    const diagnosis = data.choices[0]?.message?.content;

    if (!diagnosis) {
      throw new Error("No diagnosis received from AI");
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
          query_type: "image",
          query_text: "Image analysis request",
          response_text: diagnosis,
        });
      }
    }

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in diagnose-image function:", error);
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
