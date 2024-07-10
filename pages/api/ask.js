import axios from 'axios';
import { openDB } from '../../lib/db';

const openaiApiKey = process.env.OPENAI_API_KEY;

const getGeneralKnowledgeResponse = async (question) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );
    console.log('ChatGPT API response:', response.data);
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      'Error calling ChatGPT API:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

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
    console.log('Intent detection result:', intent);
    return intent === 'proprietary' ? 'proprietary' : 'general';
  } catch (error) {
    console.error(
      'Error detecting intent:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export default async function handler(req, res) {
  const { question } = req.body;

  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  let answer;
  try {
    const intent = await detectIntent(question);
    if (intent === 'proprietary') {
      answer = 'this is proprietary information';
    } else {
      answer = await getGeneralKnowledgeResponse(question);
    }
  } catch (error) {
    console.error('Error processing the question:', error.message);
    res.status(500).json({ error: 'Error processing the question' });
    return;
  }
  res.status(200).json({ answer });
}
