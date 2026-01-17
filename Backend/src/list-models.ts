import 'dotenv/config'

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in .env');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json() as any;
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach((model: any) => {
        console.log(`- ${model.name} (Supported methods: ${model.supportedGenerationMethods})`);
      });
    } else {
      console.log('No models found.');
      console.log(data);
    }
  } catch (error) {
    console.error('Failed to list models:', error);
  }
}

listModels();
