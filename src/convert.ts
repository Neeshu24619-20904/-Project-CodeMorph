import fetch from "node-fetch";

// Map file extensions to languages
const languageMap: { [key: string]: string } = {
  "py": "Python",
  "java": "Java",
  "js": "JavaScript",
  "ts": "TypeScript",
  "cpp": "C++",
  "c": "C",
  "cs": "C#",
  "go": "Go",
  "rb": "Ruby",
  "php": "PHP",
  "rs": "Rust",
  "kt": "Kotlin",
  "swift": "Swift",
  "html": "HTML",
  "css": "CSS"
};

// Get language name from file extension
function getLanguage(extension: string): string {
  return languageMap[extension.toLowerCase()] || extension;
}

// Main conversion function
export async function convertCodeWithAI(
  userCode: string,
  oldExtension: string,
  newExtension: string
): Promise<string> {

  const sourceLanguage = getLanguage(oldExtension);
  const targetLanguage = getLanguage(newExtension);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key missing! Set OPENAI_API_KEY in environment variables.");
  }

  const prompt = `
You are an expert software engineer.

Convert the following code from ${sourceLanguage} to ${targetLanguage}.

Rules:
- Preserve the original logic
- Follow best practices for ${targetLanguage}
- Keep comments if possible
- If something is not possible, provide the closest equivalent
- Return ONLY the converted code (no explanations)

CODE:
<<<
${userCode}
>>>
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",   // or gpt-4o / gpt-3.5-turbo
        messages: [
          { role: "system", content: "You are a professional code translator." },
          { role: "user", content: prompt }
        ],
        temperature: 0.25
      })
    });

    const data: any = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid AI response");
    }

    const convertedCode = data.choices[0].message.content.trim();

    return convertedCode;

  } catch (error: any) {
    console.error("AI Conversion Error: ", error.message);
    return `// ERROR: Unable to convert from ${sourceLanguage} to ${targetLanguage}\n\n${userCode}`;
  }
}
