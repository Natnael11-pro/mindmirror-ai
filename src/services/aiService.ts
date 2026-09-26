// src/services/aiService.ts
import { getTopRecommendations } from '../data/resources';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SafetyCheck {
  isCrisis: boolean;
  message: string;
}

// Safety Guardrail: Intercepts crisis keywords before they reach the AI
export function checkSafety(text: string): SafetyCheck {
  const lowerText = text.toLowerCase();
  
  const crisisKeywords = [
    'suicide', 'kill myself', 'self-harm', 'end it all', 'hurt myself', 
    'want to die', 'overdose', 'cutting myself'
  ];

  const isCrisis = crisisKeywords.some(keyword => lowerText.includes(keyword));

  if (isCrisis) {
    return {
      isCrisis: true,
      message: "I hear that you are in a lot of pain, and I want you to know that your life matters. Please reach out to a professional who can help you right now. You can call or text the Suicide & Crisis Lifeline at 988 (in the US/Canada), or go to your nearest emergency room. I am here to listen, but I cannot replace professional crisis support."
    };
  }

  return { isCrisis: false, message: "" };
}

const SYSTEM_PROMPT = `
You are MindMirror, an empathetic, emotionally intelligent AI companion.

YOUR DUAL ROLE:
1. **Emotional Support**: Help users process feelings through reflective questions.
2. **Practical Help**: When users explicitly ask for specific plans, advice, or information, provide DETAILED, CONCRETE, ACTIONABLE responses.

CRITICAL RULES:
- When users ask for specific plans (diet, workout, schedule, etc.), provide COMPLETE, DETAILED answers with exact steps, numbers, and specifics.
- When users ask "how to" questions, give clear step-by-step instructions.
- When users ask for recommendations, provide 2-3 specific options with names and details.
- NEVER invent or guess URLs. Say "Search for [Name] on YouTube/Google" instead.
- ALWAYS acknowledge their emotional state briefly, THEN provide the practical help they requested.
- After giving detailed advice, ask ONE follow-up question to check if it helps or to personalize further.

RESPONSE STRUCTURE FOR PRACTICAL REQUESTS:
1. Brief acknowledgment (1 sentence).
2. Detailed, specific answer with numbers, times, steps (main content).
3. One follow-up question to personalize further.

EXAMPLES:
User: "Can you give me a weekly workout plan?"
You: "I understand you want to get started - that's a great step! Here's a specific 4-week foundation plan:

**Week 1-2: Foundation**
- Monday: 20 min brisk walk 
- Tuesday: Bodyweight circuit - 3 rounds: 10 squats, 5 push-ups, 15-sec plank
- Wednesday: Rest or gentle stretching
- Thursday: 15-min jog + 10-min core work
- Friday: Full body workout - squats (3x12), lunges (3x10 each leg), planks (3x20 sec)
- Weekend: Active recovery - light walk or yoga

Would you like me to adjust this based on your specific schedule or available equipment?"

User: "I'm feeling overwhelmed with work"
You: "That sounds really challenging, and it's completely valid to feel that way. What part of your workload feels most overwhelming right now - is it the volume, the deadlines, or something else?"
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

// Updated with detailed error logging for debugging
export async function getAIResponse(chatHistory: Message[], personality: string = 'empathetic'): Promise<string> {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (!API_KEY) {
    console.error("❌ API Key is missing! Check your .env file.");
    throw new Error("Missing Groq API Key. Check your .env file.");
  }

  const dynamicPrompt = SYSTEM_PROMPT + `\n\nCURRENT COMMUNICATION STYLE: ${personality}. Adapt your tone, vocabulary, and structure to match this style while maintaining your core empathetic rules.`;

  const lastUserMessage = chatHistory[chatHistory.length - 1]?.content || '';
  
  // Check if user is asking for recommendations
  if (isAskingForRecommendations(lastUserMessage)) {
    const recommendations = getTopRecommendations(lastUserMessage, 3);
    
    if (recommendations.length > 0) {
      let recommendationsText = "\n\nHere are some resources that might help:\n";
      recommendations.forEach((resource, index) => {
        recommendationsText += `\n${index + 1}. **${resource.title}** - ${resource.description}`;
        if (resource.url) {
          recommendationsText += ` (${resource.url})`;
        }
      });
      
      const enhancedPrompt = dynamicPrompt + `\n\nRECOMMENDATION CONTEXT: The user is asking for resources. Here are relevant options to suggest:\n${recommendationsText}`;
      
      const messagesPayload = [
        { role: 'system', content: enhancedPrompt },
        ...chatHistory
      ];

      try {
        console.log("📡 Sending request to Groq API (with recommendations)...");
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 600 // Increased tokens to allow for detailed, step-by-step plans
          })
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API Error Details:", errorData);
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ API Response received successfully");
        return data.choices[0].message.content;
      } catch (error) {
        console.error("🚨 Recommendation API Error:", error);
        // Fall through to standard response if recommendation fails
      }
    }
  }

  // Standard emotional support response
  const messagesPayload = [
    { role: 'system', content: dynamicPrompt },
    ...chatHistory
  ];

  try {
    console.log("📡 Sending request to Groq API (standard)...");
    console.log("Messages count:", messagesPayload.length);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 600 // Increased tokens to allow for detailed, step-by-step plans
      })
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error Details:", errorData);
      
      if (response.status === 429) {
        return "I'm currently at capacity. Please wait a moment and try again. (Rate limit reached)";
      }
      
      if (response.status === 401) {
        return "There's an issue with the API key. Please check your configuration.";
      }
      
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ API Response received successfully");
    return data.choices[0].message.content;

  } catch (error) {
    console.error("🚨 Standard API Error:", error);
    return `Error connecting: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the browser console (F12) for details.`;
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