import axios from 'axios';

const openaiApiKey = process.env.OPENAI_API_KEY;
const queryDatabase = async (question) => {
  return 'Here would be the result from the database.';
};

export default async function handler(req, res) {
  const { question } = req.body;

  if (question.includes('distance') || question.includes('flight time')) {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: question,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );
    res.status(200).json({ answer: response.data.choices[0].text.trim() });
  } else {
    const answer = await queryDatabase(question);
    res.status(200).json({ answer });
  }
}
