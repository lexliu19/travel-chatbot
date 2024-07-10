import axios from 'axios';

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

export default getGeneralKnowledgeResponse;
