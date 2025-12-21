
import OpenAI from "openai";
import { UserPreferences, ScrapedJob, EvaluationResult } from "../types";

export const evaluateJobsWithOpenAI = async (
  preferences: UserPreferences,
  scrapedJobs: ScrapedJob[],
  resume: string
): Promise<EvaluationResult> => {
  const apiKey = preferences.openaiKey;
  
  if (!apiKey) {
    throw new Error("Missing OpenAI API Key.");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  
  const prompt = `
    Role: Senior Executive Career Consultant.
    Task: Precisely match the following job opportunities against the Candidate's Resume and Specific Weighted Preferences.
    
    Candidate's Resume:
    """
    ${resume}
    """

    User Scoring Weights (0-10):
    - Salary Level: ${preferences.salaryWeight}
    - Remote Flexibility: ${preferences.remoteWeight}
    - Culture Fit: ${preferences.cultureWeight}
    - Professional Growth: ${preferences.growthWeight}
    - Tech Stack Alignment: ${preferences.techStackWeight}

    CRITICAL CUSTOM PREFERENCES & DEALBREAKERS:
    """
    ${preferences.customNotes || "No specific custom notes provided."}
    """
    INSTRUCTION: If custom notes are provided, they are just as important as the sliders. For example, if a user says "No web3", any crypto-related job should be scored significantly lower regardless of other factors.

    Job Opportunities Data:
    ${JSON.stringify(scrapedJobs, null, 2)}

    EXPECTED JSON OUTPUT RULES:
    1. "worthApplyingScore" (0-100): Calculate a final weighted average. Use the custom notes as a "multiplier" or "veto" if they contain dealbreakers.
    2. "metrics" Array: For each job, provide a breakdown including "Custom Fit" as a metric if custom notes were used.
    3. "status": Use 'Highly Recommended', 'Worth Applying', 'Maybe', or 'Skip It'.
    4. "coverLetter": Write a 3-paragraph compelling letter tailored to BOTH the resume and the job requirements.
    5. "tailoredResume": Provide a refined "Professional Summary" and "Key Skills" block specifically optimized for the job's keywords.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert career coach. You must return a valid JSON object matching the EvaluationResult interface. Ensure metrics, pros, and cons are always arrays." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("OpenAI returned no content.");
    let parsed = JSON.parse(content);
    // 兼容 OpenAI 返回字段名 EVALUATION 或 evaluations
    if (parsed.EVALUATION && !parsed.evaluations) {
          // 兼容 EVALUATIONRESULTS 字段
          if (parsed.EVALUATIONRESULTS && !parsed.evaluations) {
                // 兼容 JOBEVALUATIONS 字段
                if (parsed.JOBEVALUATIONS && !parsed.evaluations) {
                  parsed.evaluations = parsed.JOBEVALUATIONS;
                  delete parsed.JOBEVALUATIONS;
                }
            parsed.evaluations = parsed.EVALUATIONRESULTS;
            delete parsed.EVALUATIONRESULTS;
          }
      parsed.evaluations = parsed.EVALUATION;
      delete parsed.EVALUATION;
    }
    // 兼容单个 evaluation 对象
    if (parsed.evaluation && !parsed.evaluations) {
      parsed.evaluations = [parsed.evaluation];
      delete parsed.evaluation;
    }
    // Sanity check: Ensure nested properties are arrays
    if (parsed.evaluations) {
      parsed.evaluations = parsed.evaluations.map(job => ({
        ...job,
        metrics: Array.isArray(job.metrics) ? job.metrics : [],
        pros: Array.isArray(job.pros) ? job.pros : [],
        cons: Array.isArray(job.cons) ? job.cons : []
      }));
    }
    return parsed;
  } catch (error: any) {
    console.error("OpenAI Analysis Error:", error);
    throw new Error(error.message || "OpenAI failed to analyze the jobs. Check your API key and connection.");
  }
};
