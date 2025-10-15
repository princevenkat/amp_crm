





import { GoogleGenAI, Type } from "@google/genai";
import type { Client, Task, LedgerEntry } from '../types';
import { TaskStatus } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. GenAI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeClient = async (client: Client): Promise<string> => {
  if (!process.env.API_KEY) return "GenAI is not configured. Please set the API_KEY environment variable.";
  try {
    const prompt = `
      Summarize the following client profile into a few key bullet points.
      Focus on their property details, product status, and any key financial details.

      Client Name: ${client.name}
      ${client.applicationType === 'Joint' ? `Second Applicant: ${client.applicants[1].firstName} ${client.applicants[1].surname}`: ''}
      Status: ${client.status}
      Last Contacted: ${client.lastContacted}
      Property Type: ${client.property.propertyType}
      Property Value: $${client.property.propertyValue.toLocaleString()}
      Case Reference: ${client.caseReference}
      Primary Advisor: ${client.primaryAdvisor}
      ${client.productDetails?.businessWritten ? `Business Written: ${client.productDetails.businessWritten}` : ''}
      ${client.productDetails?.mortgage ? `Mortgage Amount: $${client.productDetails.mortgage.mortgageLoanAmount.toLocaleString()} with ${client.productDetails.mortgage.lender}` : ''}
      ${client.productDetails?.protection ? `Protection Premium: $${client.productDetails.protection.premium.toLocaleString()} with ${client.productDetails.protection.provider}` : ''}

      Generate a concise summary.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing client:", error);
    return "Error generating summary. Please check the console for details.";
  }
};

export const suggestTasks = async (client: Client): Promise<Task[]> => {
    if (!process.env.API_KEY) return [];
    try {
      const prompt = `
        Based on this client profile, suggest 3 relevant follow-up tasks with a short description for each.
        Client Name: ${client.name}
        Last Contacted: ${client.lastContacted}
        Primary Case Advisor: ${client.primaryAdvisor}
        The task should be assigned to the Primary Case Advisor.
      `;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The task title." },
                description: { type: Type.STRING, description: "A short, helpful description of the task." },
                dueDate: { type: Type.STRING, description: "Suggested due date (YYYY-MM-DD)." }
              },
              required: ["title", "description", "dueDate"],
            },
          },
        },
      });
      
      const suggestedTasks = JSON.parse(response.text);
      
      return suggestedTasks.map((task: any, index: number) => ({
          ...task,
          id: `ai-${client.id}-${index}-${Date.now()}`,
          // FIX: Replaced `TaskStatus.Active` with `TaskStatus.Enquiry` as 'Active' is not a valid status in the `TaskStatus` enum.
          status: TaskStatus.Enquiry,
          assignedTo: client.primaryAdvisor,
          assignedBy: 'AI Assistant',
          clientId: client.id,
      }));

    } catch (error) {
      console.error("Error suggesting tasks:", error);
      return [];
    }
};

export const draftEmail = async (instruction: string): Promise<string> => {
    if (!process.env.API_KEY) return "GenAI is not configured.";
    try {
        const prompt = `
            Draft a professional email based on the following instruction.
            Make it friendly but clear. Include a subject line.
            
            Instruction: "${instruction}"

            Format the output with "Subject: [Your Subject]" on the first line, followed by the email body.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Error drafting email:", error);
        return "Error drafting email.";
    }
};

export const getLedgerInsights = async (entries: LedgerEntry[]): Promise<string> => {
    if (!process.env.API_KEY) return "GenAI is not configured.";
    try {
        const prompt = `
            Analyze the following business ledger entries and provide 3 key insights.
            Focus on revenue trends, top clients, and expense patterns.
            
            Entries:
            ${JSON.stringify(entries.slice(0, 20), null, 2)} 
            
            Provide a concise summary of insights.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Error getting ledger insights:", error);
        return "Error analyzing ledger.";
    }
};