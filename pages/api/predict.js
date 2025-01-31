export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Based on these lottery numbers from the past days: ${JSON.stringify(req.body.pastNumbers)}, predict the next winning numbers for: 1st prize (1 number), 2nd prize (1 number), 3rd prize (1 number), special prize (10 numbers), and consolation prize (10 numbers). Return only the numbers in JSON format.`
          }
        ],
        model: 'o1-preview'
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 