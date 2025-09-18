type ImageGenerationRequest = {
   action: "generate_image";
   prompt: string;
   caption?: string;
    message_owner?: string;
};

export type ImageGenerationRequestResponse = { isImageRequest: boolean, prompt?: string, caption?: string, message_owner?: string };

export function isImageGenerationRequest(text: string): ImageGenerationRequestResponse {
    try {
        // First try to parse as direct JSON
        const parsed: ImageGenerationRequest = JSON.parse(text);
        if (parsed.action === "generate_image" && parsed.prompt) {
            return {
                isImageRequest: true,
                prompt: parsed.prompt,
                caption: parsed.caption,
                message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
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
                        caption: parsed.caption,
                        message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
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
                        caption: parsed.caption,
                        message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
                    };
                }
            } catch (innerError) {
                // JSON after "json" prefix is invalid
            }
        }

        // Try to find JSON anywhere in the text (for cases where AI sends text before JSON)
        // Use a more robust approach to find complete JSON objects
        const jsonPattern = /\{(?:[^{}]|"[^"]*")*"action"\s*:\s*"generate_image"(?:[^{}]|"[^"]*")*\}/g;
        const matches = text.match(jsonPattern);
        
        if (matches) {
            for (const match of matches) {
                try {
                    const parsed: ImageGenerationRequest = JSON.parse(match);
                    if (parsed.action === "generate_image" && parsed.prompt) {
                        // Extract text before the JSON to combine with the message
                        const jsonIndex = text.indexOf(match);
                        const textBeforeJson = text.substring(0, jsonIndex).trim();

                        // Combine text before JSON with the caption field
                        let combinedCaption = "";
                        if (textBeforeJson && parsed.caption) {
                            combinedCaption = `${textBeforeJson}\n\n${parsed.caption}`;
                        } else if (textBeforeJson) {
                            combinedCaption = textBeforeJson;
                        } else if (parsed.caption) {
                            combinedCaption = parsed.caption;
                        }
                        
                        return {
                            isImageRequest: true,
                            prompt: parsed.prompt,
                            caption: combinedCaption || undefined,
                            message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
                        };
                    }
                } catch (innerError) {
                    // This match wasn't valid JSON, try next one
                    continue;
                }
            }
        }
    }
    
    return { isImageRequest: false };
}