import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from './storage';

export async function generatePrediction(
  assetType: string,
  pair: string,
  timeframe: string,
  currentPrice?: number,
  priceChange?: number
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your Google AI Studio API key in the settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-flash-latest for confirmed compatibility and speed
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const marketContext = currentPrice 
    ? `The current price of ${pair} is $${currentPrice} with a 24h change of ${priceChange}%.`
    : `I do not have real-time price data for ${pair} right now, please use your general knowledge.`;

  const prompt = `
    You are an expert financial analyst and AI trading algorithm.
    I need a trading prediction for the following asset:
    - Asset Type: ${assetType}
    - Trading Pair: ${pair}
    - Timeframe for Prediction: ${timeframe}
    - Current Market Context: ${marketContext}

    Based on your training data, technical analysis patterns, and overall market sentiment for this asset, provide a prediction for the next ${timeframe}.
    
    You MUST respond in ONLY the following JSON format, absolutely no other text or markdown block formatting.
    {
      "direction": "UP" | "DOWN",
      "confidence": number (between 50 and 99),
      "reasoning": "A concise 2-3 sentence explanation of why this direction is predicted."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up response if the model accidentally included markdown formatting
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as {
      direction: 'UP' | 'DOWN';
      confidence: number;
      reasoning: string;
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message?.includes('API key not valid') || error.status === 403) {
      throw new Error('Invalid API Key. Please check your settings.');
    }
    throw new Error('Failed to generate prediction. ' + (error.message || 'Unknown error.'));
  }
}
