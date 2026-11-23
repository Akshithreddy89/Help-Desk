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

module.exports = {
  classifyIssue,
  fallbackClassifier,
};

