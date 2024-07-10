import axios from 'axios';
import { openDB, getPackageNames, getFlightPrice } from '@/lib/db';

const openaiApiKey = process.env.OPENAI_API_KEY;

const getProprietaryResponse = async (question) => {
  const prompt = `
    Extract the key information from the following question to form a standardized SQL query for a SQLite database.
    The database contains tables for 'Packages' and 'Flights'. 
    Each table has columns for 'origin', 'destination', 'price', 'duration', etc.
    Ensure correct capitalization and avoid typos.
    Here are some examples:
    - "What packages does your travel company offer?" -> "SELECT name FROM Packages"
    - "How much would a flight ticket from Singapore to London cost?" -> "SELECT price FROM Flights WHERE origin = 'Singapore' AND destination = 'London'"
    - "What are the family holiday packages available for Europe?" -> "SELECT * FROM Packages WHERE destination = 'Europe' AND family_friendly = 1"
    - "What are the available travel packages from New York to Tokyo?" -> "SELECT * FROM Packages WHERE origin = 'New York' AND destination = 'Tokyo'"
    - "What's the flight price from New York to London?" -> "SELECT price FROM Flights WHERE origin = 'New York' AND destination = 'London'"

    Question: "${question}"
    Query:`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const query = response.data.choices[0].message.content.trim();
    console.log('Generated SQL query:', query);

    // Validate SQL query
    const validSelectQuery = query.match(
      /^SELECT\s.+?\sFROM\s.+?(\sWHERE\s.+)?;?$/i
    );
    if (!validSelectQuery) {
      console.error('Generated query is not a valid SELECT statement');
      throw new Error('Generated query is not a valid SELECT statement');
    }

    const db = await openDB();
    let result;

    // Determine the type of query
    if (query.toLowerCase().includes('from flights')) {
      const [origin, destination] = query
        .match(/origin\s*=\s*'([^']+)'\s*AND\s*destination\s*=\s*'([^']+)'/i)
        .slice(1, 3);
      result = await getFlightPrice(origin, destination);
    } else if (
      query.toLowerCase().includes('from packages') &&
      query.toLowerCase().includes('select name')
    ) {
      result = await getPackageNames();
    } else {
      result = await db.all(query);
    }

    console.log('Database query result:', result);

    if (!result || result.length === 0) {
      console.log('No matching records found in the database.');
      return 'We do not offer this flight or package.';
    }

    // Determine if the query is for Flights or Packages
    const isFlightQuery = query.toLowerCase().includes('from flights');
    const isPackageQuery =
      query.toLowerCase().includes('from packages') &&
      query.toLowerCase().includes('select name');

    // Send the query result to ChatGPT to generate a human-readable response
    const dataForGPT = JSON.stringify(result);
    let answerPrompt;
    if (isFlightQuery) {
      const { origin, destination } = query
        .match(/origin\s*=\s*'([^']+)'\s*AND\s*destination\s*=\s*'([^']+)'/i)
        .slice(1, 3);
      answerPrompt = `
        Generate a response for the flight price query. 
        Data: ${dataForGPT}
        Response format: "The flight price is ${result.price}."
        Example: The flight price is $700.
      `;
    } else if (isPackageQuery) {
      const packageNames = result.map((pkg) => pkg.name).join(', ');
      answerPrompt = `
        Generate a response for the package names query.
        Data: ${dataForGPT}
        Response format: "We offer the following packages: ${packageNames}."
        Example: We offer the following packages: Family Fun Europe, Romantic Paris, Adventure Australia.
      `;
    } else {
      const originMatch = query.match(
        /origin\s*=\s*'([^']+)'\s*AND\s*destination\s*=\s*'([^']+)'/i
      );
      const origin = originMatch ? originMatch[1].trim() : '';
      answerPrompt = `
        Format the following data into a human-readable response:
        Data: ${dataForGPT}
        Response format: "Yes! We provide [Tour Title] package for you to [Description]. Start from ${origin}. The price is $[Price], hope you enjoy it!"
        Example: Yes! We provide Family Fun Europe package for you and your family to Explore Europe with your family in this 10-day tour covering France, Germany, and Italy. The price is $5000, hope you enjoy it!
      `;
    }

    const answerResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: answerPrompt }],
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const humanReadableAnswer =
      answerResponse.data.choices[0].message.content.trim();
    return humanReadableAnswer;
  } catch (error) {
    console.error(
      'Error generating or executing query:',
      error.response ? error.response.data : error.message
    );
    return 'We do not offer this flight or package.';
  }
};

export default getProprietaryResponse;
