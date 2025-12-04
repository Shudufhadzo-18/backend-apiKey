const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { message, about } = JSON.parse(event.body);

    if (!process.env.GEMINI_KEY) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "GEMINI_KEY not set" }) };
    }

    // Use Node 18+ built-in fetch (no import)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${about}\n\nUser question: ${message}` }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No valid output";
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ message: aiText }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};