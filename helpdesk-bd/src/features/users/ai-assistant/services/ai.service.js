const { GoogleGenAI } = require("@google/genai");

const VALID_CATEGORIES = ["Technical", "Billing", "Account", "General"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

class GeminiServiceError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "GeminiServiceError";
    this.statusCode = 503;
  }
}


/**
 * Deterministic Rule-Based Fallback Classifier.
 * Guarantees zero downtime even if GEMINI_API_KEY is not set or network fails.
 */
function fallbackClassifier(rawText) {
  const lower = (rawText || "").toLowerCase();
  // Category determination
  let category = "General";
  if (/\b(wifi|wi-fi|internet|network|dns|server|crash|bug|error|slow|hardware|laptop|software)\b/.test(lower)) {
    category = "Technical";
  } else if (/\b(bill|billing|invoice|payment|charge|cost|price|refund)\b/.test(lower)) {
    category = "Billing";
  } else if (/\b(login|password|account|email|auth|token|2fa|profile|permission)\b/.test(lower)) {
    category = "Account";
  }
  // Priority determination
  let priority = "Medium";
  if (/\b(urgent|emergency|critical|blocked|completely down|cannot work|security|breach)\b/.test(lower)) {
    priority = "High";
  } else if (/\b(minor|trivial|question|typo|cosmetic|when you can|suggestion)\b/.test(lower)) {
    priority = "Low";
  }
  // Generate clean title (under 60 chars)
  let cleanTitle = rawText.trim().replace(/[\r\n]+/g, " ");
  if (cleanTitle.length > 55) {
    cleanTitle = cleanTitle.substring(0, 52) + "...";
  }
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  return {
    subject: cleanTitle || "Support Request",
    category,
    priority,
    description: `Customer reported: "${rawText.trim()}"\n\nPlease investigate the issue and assist the customer.`,
    original_description: rawText.trim(),
  };
}
/**
 * Classifies a raw issue description using Gemini 3.5 Flash or Fallback.
 */
async function classifyIssue(rawDescription) {
  if (!rawDescription || !rawDescription.trim()) {
    throw new Error("Issue description cannot be empty.");
  }
  if (!aiClient) {
    return fallbackClassifier(rawDescription);
  }
  const prompt = `
You are an expert IT Helpdesk triage assistant.
Analyze the following customer problem report and return a strictly valid JSON object:
- "subject": A concise title summarizing the problem (max 60 characters).
- "category": Must be one of ["Technical", "Billing", "Account", "General"].
- "priority": Must be one of ["Low", "Medium", "High"]. Use "High" ONLY if there is critical business disruption or complete blocker.
- "description": A clear, professional support description preserving all customer details and technical context.
Customer Problem:
"""${rawDescription.trim()}"""
`;
  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 500,
      },
    });
    const parsed = JSON.parse(response.text.trim());
    return {
      subject: (parsed.subject || rawDescription.slice(0, 50)).trim(),
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "Technical",
      priority: VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : "Medium",
      description: (parsed.description || rawDescription).trim(),
      original_description: rawDescription.trim(),
    };
  } catch (error) {
    console.warn("Gemini Classification failed, using deterministic fallback:", error.message);
    return fallbackClassifier(rawDescription);
  }
}


/**
 * Answers customer FAQ and general IT questions using Gemini.
 */
async function answerFaqConversation(userQuery, knowledgeContext) {
  if (!aiClient) {
    throw new GeminiServiceError("GEMINI_API_KEY is not configured.");
  }

  const systemInstruction = `You are an intelligent IT Helpdesk AI Assistant.
Your goal is to provide accurate, helpful IT support to customers.

Instructions:
1. Reference FAQ Priority: If the customer's question relates to topics in the Company FAQ Knowledge Base (e.g. company Wi-Fi, login/password, booking appointments, billing, or ticket lifecycle), prioritize and follow those official guidelines.
2. General IT Troubleshooting: If the question is NOT in the Reference FAQ (e.g. general operating system issues, software glitches, browser problems, hardware, or network troubleshooting), use your broader IT knowledge to provide practical, step-by-step guidance.
3. Style: Keep your answer direct, professional, and formatted in clear, easy-to-follow bullet points.
4. Support Ticket Recommendation: If the issue requires internal administrative rights, personal account access, or cannot be resolved with troubleshooting, politely advise the customer to raise a support ticket.
5. Boundaries: Never invent company-specific internal policies or financial commitments outside the knowledge base.`;

  const contents = `Customer Question:\n${userQuery}\n\nCompany FAQ Knowledge Base (use if relevant):\n${knowledgeContext}`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 500,
        temperature: 0.3,
      },
    });

    const answer = response.text?.trim();
    if (!answer) {
      throw new Error("Empty response received from Gemini.");
    }
    return answer;
  } catch (error) {
    console.error("Gemini FAQ Chat failed:", error.message || error);
    throw new GeminiServiceError("AI Assistant is currently unavailable.", error);
  }
}

module.exports = {
    classifyIssue,
  answerFaqConversation,
};
