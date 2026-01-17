import 'dotenv/config'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

async function testQuota() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({ apiKey });

  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  for (const modelName of models) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const { text } = await generateText({
        model: google(modelName),
        prompt: 'Hi',
      });
      console.log(`✅ ${modelName} works! Response: ${text.trim()}`);
      return modelName; // Stop at the first working model
    } catch (error: any) {
      console.error(`❌ ${modelName} failed: ${error.message}`);
    }
  }
  return null;
}

testQuota();
