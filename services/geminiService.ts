
import { GoogleGenAI, Type } from "@google/genai";
import { JobPosting, ScrapedJob } from "../types";

export const scrapeJobDetails = async (jobs: JobPosting[]): Promise<ScrapedJob[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Use the Google Search tool to visit the following job URLs and extract their full text details.
    
    URLs to scrape:
    ${jobs.map((job, index) => `Job ${index + 1} (ID: ${job.id}): ${job.url}`).join('\n')}

    For each job, extract:
    1. Official Job Title
    2. Company Name
    3. Full Job Description (including requirements, responsibilities, and benefits)

    IMPORTANT: Return the result as a JSON object with a "scrapedJobs" array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scrapedJobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  url: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "url", "title", "company", "description"]
              }
            }
          },
          required: ["scrapedJobs"]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("The AI scraper returned an empty response. This can happen if the URLs are blocked or require a login.");
    }

    const text = response.text.trim();
    const data = JSON.parse(text);
    
    if (!data.scrapedJobs || !Array.isArray(data.scrapedJobs)) {
       throw new Error("The scraper returned an invalid data format.");
    }
    
    return data.scrapedJobs;
  } catch (error: any) {
    console.error("Gemini Scraping Error:", error);
    throw new Error(error.message || "Failed to scrape job details. Please check your internet connection and try again.");
  }
};
