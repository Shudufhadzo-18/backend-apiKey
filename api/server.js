const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        const { message, about } = JSON.parse(event.body);

        const GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
            process.env.GEMINI_KEY;

        const body = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${about}\n\nUser asked: ${message}`
                        }
                    ]
                }
            ]
        };

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const txt = await response.text();
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Gemini returned invalid data: ${txt}` })
            };
        }

        const data = await response.json();

        const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No valid output";

        return {
            statusCode: 200,
            body: JSON.stringify({ message: aiText })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server error: " + error.message })
        };
    }
};