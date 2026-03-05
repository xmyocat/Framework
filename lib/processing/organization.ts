import Anthropic from '@anthropic-ai/sdk';

export interface OrganizationResult {
    subject: string;
    tags: string[];
    connections: string[];
}

export async function organizeArtifact(content: string, type: string = 'text'): Promise<OrganizationResult> {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    try {
        const prompt = `
    Analyze the following learning artifact content and extract structured metadata.
    Content Type: ${type}
    Content: "${content.substring(0, 5000)}"

    Please provide:
    1. A short, concise subject (max 3 words).
    2. A list of 3-5 relevant tags.
    3. A list of 1-3 potential conceptual connections to other fields or topics.

    Respond ONLY with a valid JSON object in this format:
    {
      "subject": "Topic Name",
      "tags": ["tag1", "tag2"],
      "connections": ["connection1", "connection2"]
    }
    `;

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [
                { role: "user", content: prompt }
            ]
        });

        const textResponse = message.content[0].type === 'text' ? message.content[0].text : '';

        // Attempt to extract JSON if there's extra text (though prompt says ONLY JSON)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : textResponse;

        return JSON.parse(jsonString) as OrganizationResult;
    } catch (error) {
        console.error('Error in organization:', error);
        // Fallback
        return {
            subject: 'Uncategorized',
            tags: [],
            connections: []
        };
    }
}
