export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const endpoint = "https://models.inference.ai.azure.com";

  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a lottery number prediction expert. Analyze patterns and provide predictions in JSON format. Only respond with valid JSON, no markdown or other text."
          },
          {
            role: "user",
            content: `Based on these lottery numbers from the past days: ${JSON.stringify(req.body.pastNumbers)}, predict the next winning numbers. Respond only with a JSON object in this exact format, nothing else: { "firstPrize": "XXXX", "secondPrize": "XXXX", "thirdPrize": "XXXX", "specialPrize": ["XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX"], "consolationPrize": ["XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX", "XXXX"] }`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        model: "gpt-4o"
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    try {
      // The model might include markdown formatting, so let's try to extract just the JSON
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const prediction = JSON.parse(jsonString);
      res.status(200).json(prediction);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse prediction',
        details: parseError.message,
        rawContent: data.choices[0].message.content 
      });
    }
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to generate prediction',
      details: error.message 
    });
  }
}