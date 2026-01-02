import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FkwOccurrence {
  text: string;
  segmentId: number;
  segmentType: string;
  segmentKey: string;
  fieldPath: string;
  position: 'h1' | 'h2' | 'h3' | 'intro' | 'body';
  priority: number; // Higher = more important to keep
  context: string; // Surrounding text for context
}

interface OptimizationSuggestion {
  occurrence: FkwOccurrence;
  suggestedReplacement: string;
  reason: string;
  keepScore: number; // 0-100, higher = should keep
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { occurrences, focusKeyword, targetDensity, currentDensity } = await req.json();

    if (!occurrences || !focusKeyword) {
      throw new Error('Missing required parameters: occurrences, focusKeyword');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate how many occurrences need to be replaced to reach target density
    const excessOccurrences = Math.ceil(
      (currentDensity - targetDensity) * occurrences.length / currentDensity
    );

    // Sort occurrences by priority (lowest priority = best candidates for replacement)
    const sortedOccurrences = [...occurrences].sort((a, b) => a.priority - b.priority);
    
    // Take only the ones we need to replace
    const candidatesForReplacement = sortedOccurrences.slice(0, Math.max(excessOccurrences, 3));

    // Generate synonyms and explanations for each candidate
    const suggestions: OptimizationSuggestion[] = [];

    for (const occurrence of candidatesForReplacement) {
      const prompt = `You are an SEO expert. The user has a keyword density that is too high for the focus keyword "${focusKeyword}".

Context where the keyword appears:
"${occurrence.context}"

The keyword "${focusKeyword}" appears in this ${occurrence.position} element.

Task: Generate a contextually appropriate synonym or alternative phrase that:
1. Maintains the same meaning
2. Fits naturally in the sentence
3. Is SEO-friendly (not too generic)
4. Varies the vocabulary

Respond in JSON format:
{
  "synonym": "the replacement word or phrase",
  "reason": "brief explanation why this replacement works (in German)",
  "keepScore": number between 0-100 indicating how important this occurrence is (higher = should keep, based on position: H1=95, Intro=85, H2=75, H3=60, Body=40)
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an SEO expert specializing in keyword optimization. Always respond in valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error("AI gateway error:", await response.text());
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        try {
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            suggestions.push({
              occurrence,
              suggestedReplacement: parsed.synonym || focusKeyword,
              reason: parsed.reason || "Synonym zur Reduktion der Keyword-Dichte",
              keepScore: parsed.keepScore || 50,
            });
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
        }
      }
    }

    // Sort suggestions by keepScore (lowest first = best candidates to replace)
    suggestions.sort((a, b) => a.keepScore - b.keepScore);

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        excessOccurrences,
        targetDensity,
        currentDensity,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error("Error in optimize-keyword-density:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
