import { config } from "dotenv";

config();

const API_KEY = process.env.DEEPSEEK_API_KEY;
const url = "https://api.deepseek.com/v1/chat/completions"; // DeepSeek endpoint

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function testDeepSeek() {
  try {
    // Check if API key exists
    if (!API_KEY) {
      console.error('DEEPSEEK_API_KEY is not set in environment variables');
      return;
    }

    console.log('Making request to DeepSeek API...');
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, who are you?" }
        ],
      }),
    });

    // Check if request was successful
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await res.json() as DeepSeekResponse;
    
    // Debug the response
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    // Check if response has expected structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Unexpected response structure. Expected choices array with at least one item.');
      console.error('Received:', data);
      return;
    }
    
    console.log('AI Response:', data.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
  }
}

testDeepSeek();