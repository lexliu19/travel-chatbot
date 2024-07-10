// In the detectIntent function, we use the OpenAI API to classify the user's question
// as either "general" or "proprietary". We then return the intent as a string value.

import axios from 'axios';

const openaiApiKey = process.env.OPENAI_API_KEY;

const detectIntent = async (question) => {
  const prompt = `
    Classify the following question as "general" or "proprietary":
    - "What’s the best place to visit in Singapore?" -> general
    - "How much would a flight ticket from Singapore to London cost?" -> proprietary
    - "What are the top tourist attractions in Paris?" -> general
    - "What packages does your travel company offer?" -> proprietary
    - "What is the best time to visit Japan?" -> general
    - "Can you provide details on the family holiday packages available for Europe?" -> proprietary
    - "Can you provide some packages available for family travel in this summer?" -> proprietary

    - "${question}" ->`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const intent = response.data.choices[0].message.content
      .trim()
      .toLowerCase();
    console.log('Intent detection result:🙋', intent);
    return intent === 'proprietary' ? 'proprietary' : 'general';
  } catch (error) {
    console.error(
      'Error detecting intent:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
export default detectIntent;
