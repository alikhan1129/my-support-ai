import 'dotenv/config'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env');
    return;
  }
  const openai = createOpenAI({ apiKey });

  const models = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ];

  for (const modelName of models) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const { text } = await generateText({
        model: openai(modelName) as any,
        prompt: 'Hi, are you working?',
      });
      console.log(`✅ ${modelName} works! Response: ${text.trim()}`);
    } catch (error: any) {
      console.error(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

testOpenAI();
