const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Base context for the counselor AI
const BASE_CONTEXT = `You are an AI-powered counselor assistant designed to support university students in Ghana. Your goal is to provide empathetic, helpful guidance while respecting the student's privacy and well-being.

Guidelines:
1. Be empathetic and understanding of the student's situation.
2. Provide practical advice and support for common student issues.
3. Respect cultural contexts specific to Ghana and West Africa.
4. Recognize when to suggest escalation to a human counselor.
5. If a student shows signs of crisis or harm, immediately recommend appropriate resources.
6. Maintain a professional, supportive tone throughout the conversation.
7. Do not make assumptions but ask clarifying questions when needed.
8. Support multiple languages including English, Twi, Ewe, and Hausa if requested.
9. Be knowledgeable about common educational, personal, and mental health challenges in university settings.
10. Maintain confidentiality and emphasize that you're an AI tool, not a replacement for a licensed mental health professional.

Areas of Support:
- Academic stress and workload management
- Time management and study techniques
- Adjustment to university life and homesickness
- Relationship challenges with friends, family, or romantic partners
- Financial stress and resource management
- Career guidance and future planning
- Mild anxiety, stress, or low mood
- Identity and personal growth
- Social skills and community integration

Crisis Warning Signs (Escalate to Human Counselor):
- Expressions of suicide or self-harm
- Severe depression symptoms
- Trauma or abuse disclosure
- Substance abuse issues
- Severe anxiety or panic attacks
- Academic crisis (risk of failing/dropping out)
- Violence or harm to others
`;

// Get the appropriate Gemini model
const getGeminiModel = () => {
  // Using the latest model as recommended in the docs
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Process chat messages and get AI response
exports.processChatMessage = async (studentMessage, chatHistory = []) => {
  try {
    const model = getGeminiModel();

    // Create a chat instance
    const chat = model.startChat({
      history: formatChatHistory(chatHistory),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // Add base context if this is a new chat
    if (chatHistory.length === 0) {
      await chat.sendMessage(BASE_CONTEXT);
    }

    // Send the student message and get response
    const result = await chat.sendMessage(studentMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error processing chat message:", error);

    // Return a user-friendly error message
    if (error.message && error.message.includes("API key")) {
      return "Sorry, there's a configuration issue with the counseling service. Please try again later or contact support.";
    }

    return "I apologize, but I'm having trouble processing your message. Could you try rephrasing or try again later?";
  }
};

// Helper function to format chat history for the model
function formatChatHistory(chatHistory) {
  return chatHistory.map((msg) => ({
    role: msg.sender === "student" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}

// Analyze text for risk factors
exports.analyzeForRiskFactors = async (text) => {
  try {
    const model = getGeminiModel();

    const prompt = `Analyze the following text for any signs that would require counselor attention or review. Consider both serious mental health concerns and inappropriate content that violates counseling platform guidelines.

Rate the risk level from 1-5:
1 = No concern
2 = Minor concern, monitor
3 = Moderate concern, review recommended  
4 = High concern, requires immediate review
5 = Severe concern, urgent intervention needed

Look for:
- Mental health concerns: self-harm, suicidal ideation, severe depression, trauma disclosure, substance abuse
- Inappropriate content: profanity, disrespectful language, harassment, threats
- Behavioral concerns: aggression toward counselors/staff, inappropriate sexual content
- Academic crisis indicators: failing, dropping out, severe stress

Text to analyze: "${text}"

Please format your response as JSON with the following structure:
{
  "riskLevel": [number 1-5],
  "concerns": [array of specific concerns identified],
  "explanation": [brief explanation of the assessment],
  "recommendedAction": [what action should be taken],
  "contentType": ["mental_health", "inappropriate_language", "behavioral", "academic", "normal"]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = result.response.text();

    // Try to parse the response as JSON
    try {
      return JSON.parse(response);
    } catch (e) {
      // If parsing fails, extract the key information manually
      const riskLevelMatch = response.match(/riskLevel"?\s*:\s*(\d+)/);
      const riskLevel = riskLevelMatch ? parseInt(riskLevelMatch[1], 10) : 1;

      return {
        riskLevel,
        concerns: [],
        explanation: "Unable to fully process risk analysis",
        recommendedAction:
          riskLevel >= 3 ? "Review message" : "No action needed",
      };
    }
  } catch (error) {
    console.error("Error analyzing risk factors:", error);

    // Return a default low-risk assessment in case of error
    return {
      riskLevel: 1,
      concerns: [],
      explanation: "Unable to analyze risk factors due to technical error",
      recommendedAction: "Technical error - manual review recommended",
    };
  }
};

// Generate journal insights
exports.generateJournalInsights = async (journalText) => {
  try {
    const model = getGeminiModel();

    const prompt = `As a supportive AI counselor, analyze the following journal entry from a university student in Ghana. Provide thoughtful, culturally appropriate insights and gentle suggestions that might help the student reflect on their situation. Focus on being empathetic and constructive.

Journal entry: "${journalText}"

Please structure your response to include:
1. A brief summary of the key themes or emotions expressed
2. Positive observations about the student's strengths or coping methods
3. One or two gentle suggestions that might be helpful
4. A supportive closing thought`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error generating journal insights:", error);
    return "I couldn't generate insights for this journal entry right now. Please try again later.";
  }
};
