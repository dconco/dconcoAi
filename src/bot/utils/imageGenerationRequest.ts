type ImageGenerationRequest = {
   action: "generate_image";
   prompt: string;
   caption?: string;
};

export type ImageGenerationRequestResponse = { isImageRequest: boolean, prompt?: string, caption?: string };

export function isImageGenerationRequest(text: string): ImageGenerationRequestResponse {
    try {
        // First try to parse as direct JSON
        const parsed: ImageGenerationRequest = JSON.parse(text);
        if (parsed.action === "generate_image" && parsed.prompt) {
            return {
                isImageRequest: true,
                prompt: parsed.prompt,
                caption: parsed.caption
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || text.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
        if (jsonMatch) {
            try {
                const parsed: ImageGenerationRequest = JSON.parse(jsonMatch[1].trim());
                if (parsed.action === "generate_image" && parsed.prompt) {
                    return {
                        isImageRequest: true,
                        prompt: parsed.prompt,
                        caption: parsed.caption
                    };
                }
            } catch (innerError) {
                // JSON in code block is invalid
            }
        }
        
        // Also try to match if text starts with "json" followed by JSON
        const jsonPrefixMatch = text.match(/^json\s*\n?([\s\S]*)/i);
        if (jsonPrefixMatch) {
            try {
                const parsed: ImageGenerationRequest = JSON.parse(jsonPrefixMatch[1].trim());
                if (parsed.action === "generate_image" && parsed.prompt) {
                    return {
                        isImageRequest: true,
                        prompt: parsed.prompt,
                        caption: parsed.caption
                    };
                }
            } catch (innerError) {
                // JSON after "json" prefix is invalid
            }
        }
    }
    
    return { isImageRequest: false };
}