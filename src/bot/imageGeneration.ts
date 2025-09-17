export function isImageGenerationRequest(text: string): { isImageRequest: boolean, prompt?: string, caption?: string } {
    try {
        // First try to parse as direct JSON
        const parsed = JSON.parse(text);
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
                const parsed = JSON.parse(jsonMatch[1].trim());
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
                const parsed = JSON.parse(jsonPrefixMatch[1].trim());
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

export function isReactionRequest(text: string): { isReactionRequest: boolean, emoji?: string, message?: string } {
    try {
        // First try to parse as direct JSON
        const parsed = JSON.parse(text);

        if (parsed.action === "react_to_message" && parsed.emoji) {
            return {
                isReactionRequest: true,
                emoji: parsed.emoji,
                message: parsed.message
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || text.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1].trim());
                if (parsed.action === "react_to_message" && parsed.emoji) {
                    return {
                        isReactionRequest: true,
                        emoji: parsed.emoji,
                        message: parsed.message
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
                const parsed = JSON.parse(jsonPrefixMatch[1].trim());
                if (parsed.action === "react_to_message" && parsed.emoji) {
                    return {
                        isReactionRequest: true,
                        emoji: parsed.emoji,
                        message: parsed.message
                    };
                }
            } catch (innerError) {
                // JSON after "json" prefix is invalid
            }
        }
    }
    
    return { isReactionRequest: false };
}