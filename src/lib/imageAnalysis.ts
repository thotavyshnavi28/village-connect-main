import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export interface ImageAnalysisResult {
    description: string;
    objects: Array<{ name: string; confidence: number }>;
    labels: string[];
    overall_confidence: number;
}

/**
 * Downloads an image from a URL and converts it to base64.
 */
const downloadImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Image download failed:", error);
        throw error;
    }
};

/**
 * Analyzes an image using Google Gemini Vision API.
 * Downloads the image, processes it, saves result to Firestore, and returns JSON.
 */
export const analyzeImage = async (imageUrl: string): Promise<ImageAnalysisResult> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }

    try {
        // 1. Download Image
        const base64Image = await downloadImageAsBase64(imageUrl);

        // 2. Call Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Analyze this image for a civic issue reporting platform.
            Identify objects, potential issues, and provide a description.
            Return a JSON object with this exact schema:
            {
              "description": "Short natural language description",
              "objects": [ { "name": "object name", "confidence": 0.0 to 1.0 } ],
              "labels": ["tag1", "tag2"],
              "overall_confidence": 0.0 to 1.0
            }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        const responseText = result.response.text();
        const analysisData = JSON.parse(responseText) as ImageAnalysisResult;

        // 3. Save to Firestore
        await addDoc(collection(db, 'imageAnalysis'), {
            imageUrl,
            analysis: analysisData,
            createdAt: serverTimestamp()
        });

        return analysisData;

    } catch (error) {
        console.error("Image Analysis Error:", error);
        throw error;
    }
};
