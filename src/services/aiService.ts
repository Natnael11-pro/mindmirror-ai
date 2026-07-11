// src/services/aiService.ts
import { getTopRecommendations } from '../data/resources';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `
You are MindMirror, an empathetic, emotionally intelligent AI companion.

YOUR DUAL ROLE:
1. **Emotional Support**: Help users process feelings through reflective questions
2. **Practical Help**: When users explicitly ask for resources, provide helpful suggestions

CRITICAL RULES FOR LINKS:
- **NEVER invent or guess URLs**. If you are not 100% sure of the exact link, do not provide one.
- Instead, say: "I recommend searching for [Name] on YouTube/Amazon."
- Only provide links for very famous, stable sites (like wikipedia.org or major official sites) if you are certain.
- If you do provide a link, ensure it is a clean URL (e.g., https://youtube.com) with no markdown formatting around it.

GUIDELINES:
- ALWAYS start by acknowledging their emotional state.
- If they ask for resources, provide 2-3 specific names/titles.
- Keep responses warm and conversational.
`;

// Check if user is asking for recommendations
function isAskingForRecommendations(text: string): boolean {
  const lowerText = text.toLowerCase();
  const recommendationKeywords = [
    'recommend', 'suggest', 'channel', 'youtube', 'book', 'app', 'tool',
    'resource', 'where can i find', 'how do i learn', 'course', 'tutorial',
    'podcast', 'video', 'guide', 'help me find', 'looking for'
  ];
  
  return recommendationKeywords.some(keyword => lowerText.includes(keyword));
}

export async function getAIResponse(chatHistory: Message[]): Promise<string> {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (!API_KEY) {
    throw new Error("Missing Groq API Key. Check your .env file.");
  }

  const lastUserMessage = chatHistory[chatHistory.length - 1]?.content || '';
  
  // Check if user is asking for recommendations
  if (isAskingForRecommendations(lastUserMessage)) {
    const recommendations = getTopRecommendations(lastUserMessage, 3);
    
    if (recommendations.length > 0) {
      // Build a message with recommendations
      let recommendationsText = "\n\nHere are some resources that might help:\n";
      recommendations.forEach((resource, index) => {
        recommendationsText += `\n${index + 1}. **${resource.title}** - ${resource.description}`;
        if (resource.url) {
          recommendationsText += ` (${resource.url})`;
        }
      });
      
      // Add recommendations context to the prompt
      const enhancedPrompt = SYSTEM_PROMPT + `\n\nRECOMMENDATION CONTEXT: The user is asking for resources. Here are relevant options to suggest:\n${recommendationsText}`;
      
      const messagesPayload = [
        { role: 'system', content: enhancedPrompt },
        ...chatHistory
      ];

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 400
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch AI response');
        }

        return data.choices[0].message.content;
      } catch (error) {
        console.error("AI API Error:", error);
        return "I'm having trouble connecting right now. Please try again.";
      }
    }
  }

  // Standard emotional support response
  const messagesPayload = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch AI response');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI API Error:", error);
    return "I'm having a little trouble connecting to my thoughts right now. Please check your internet or API key and try again.";
  }
}

export function detectEmotion(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('overwhelm') || lowerText.includes('too much') || lowerText.includes("can't handle") || lowerText.includes('exhausted')) {
    return 'overwhelmed';
  }
  if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('unhappy') || lowerText.includes('cry') || lowerText.includes('lonely')) {
    return 'sad';
  }
  if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous') || lowerText.includes('stress') || lowerText.includes('panic')) {
    return 'anxious';
  }
  if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad') || lowerText.includes('annoyed') || lowerText.includes('hate')) {
    return 'frustrated';
  }
  if (lowerText.includes('happy') || lowerText.includes('excited') || lowerText.includes('great') || lowerText.includes('wonderful') || lowerText.includes('hope') || lowerText.includes('grateful')) {
    return 'happy';
  }
  if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') || lowerText.includes('good')) {
    return 'calm';
  }
  
  return 'neutral';
}