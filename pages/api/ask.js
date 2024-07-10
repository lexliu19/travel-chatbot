import getGeneralKnowledgeResponse from '@/utils/getGeneralKnowledgeResponse';
import detectIntent from '@/utils/detectIntent';
import getProprietaryResponse from '@/utils/getProprietaryResponse';

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
      answer = await getProprietaryResponse(question);
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
