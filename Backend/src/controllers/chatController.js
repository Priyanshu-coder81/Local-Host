import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'Medicine AI Chatbot',
  },
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Query medicine server for relevant medicine info
    let medicineInfo = '';
    try {
      const medicineResponse = await fetch(`http://localhost:8001/search?query=${encodeURIComponent(message)}`);
      if (medicineResponse.ok) {
        const medicineData = await medicineResponse.json();
        if (medicineData.length > 0) {
          medicineInfo = `Relevant medicine information: ${JSON.stringify(medicineData.slice(0, 3))}`;
        }
      }
    } catch (error) {
      console.log('Medicine server not available:', error.message);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant specializing in medicine and diseases. Keep your responses short and crisp. If the user explicitly asks for medicine suggestions (using words like \'suggest\', \'recommend\', \'what medicine\', \'what should I take\', etc.), then use the following medicine information to provide crisp medicine names and dosage tips for the illness the user shared. Otherwise, only provide information about the disease based on the symptoms provided, without mentioning any medicine names or suggesting any treatments involving medicine. ' + medicineInfo,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 300,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
};
