import { GoogleGenerativeAI } from "@google/generative-ai";
import { Priority } from "@/types";

// Initialize the API with the key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Analyzes the priority of a grievance based on its title, description, and optional images using Google Gemini.
 * @param title The title of the grievance
 * @param description The detailed description of the grievance
 * @param images Optional array of base64 encoded image strings (without data:image/... prefix)
 * @returns A Promise resolving to a Priority ('low' | 'medium' | 'high' | 'urgent')
 */
export const analyzePriority = async (title: string, description: string, images: string[] = []): Promise<Priority> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an AI assistant for a village grievance reporting system.
      Your task is to analyze a grievance based on its title, description, and attached images (if any) and assign a priority level.
      
      The available priority levels are:
      - low: Minor cosmetic issues, non-urgent maintenance (e.g., peeling paint, overgrown grass in park).
      - medium: Standard issues that need attention but aren't immediate hazards (e.g., street light out, garbage collection missed).
      - high: Significant issues affecting quality of life or potential safety risks (e.g., large pothole, broken water pipe).
      - urgent: Immediate changes to life, safety, or critical infrastructure (e.g., live wire exposed, major flooding, gas leak, fire).
      
      Consider visual evidence from images if provided. For example, a "pothole" that looks like a small crack is low/medium, but a massive crater is high/urgent.

      Analyze the following grievance:
      Title: "${title}"
      Description: "${description}"

      Return ONLY the priority level as a single lowercase word: "low", "medium", "high", or "urgent". Do not include any other text or punctuation.
    `;

        const imageParts = images.map(img => ({
            inlineData: {
                data: img,
                mimeType: "image/jpeg"
            }
        }));

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text().trim().toLowerCase();

        // specific validation to ensure we return a valid Priority
        const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

        if (validPriorities.includes(text as Priority)) {
            return text as Priority;
        } else {
            // Fallback if the model returns something unexpected
            console.warn("AI returned unexpected priority:", text);
            return 'medium';
        }
    } catch (error) {
        console.error("Error analyzing priority with Gemini:", error);
        throw error;
    }
};
