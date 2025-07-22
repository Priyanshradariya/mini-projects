const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Use your real OpenAI API Key here
const OPENAI_API_KEY = ''; // put your API key 

app.post('/get-diet-plan', async (req, res) => {
    const { weight, height, targetWeight, dietType } = req.body;

    const messages = [
        {
            role: "system",
            content: "You are a professional dietician. Output only valid JSON. No explanation or formatting. Respond only with keys: breakfast, lunch, and dinner. No text outside JSON."
        },
        {
            role: "user",
            content: `I am ${weight}kg, ${height}cm tall, and want to reach ${targetWeight}kg. My diet preference is ${dietType}.
Return JSON like:
{
  "breakfast": "Oatmeal with banana and almonds",
  "lunch": "Grilled tofu with brown rice and vegetables",
  "dinner": "Lentil soup with whole wheat bread" also give more details inside this 3 keys
}`
        }
    ];

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: messages,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        console.log(data);

        if (!data.choices || !data.choices[0]) {
            return res.status(500).json({ error: 'OpenAI did not return a valid response.' });
        }

        const reply = data.choices[0].message.content;

        try {
            const parsed = JSON.parse(reply); // ✅ ensure it's valid JSON
            res.json(parsed);
        } catch (err) {
            res.status(500).json({ error: 'OpenAI returned invalid JSON: ' + reply });
        }

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from OpenAI: ' + err.message });
    }
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
