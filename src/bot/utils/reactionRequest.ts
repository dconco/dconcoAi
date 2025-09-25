type ReactionRequest = {
    action: "react_to_message";
    emoji: string;
    message?: string;
    message_owner?: string;
};

export type ReactionRequestResponse = { isReactionRequest: boolean, emoji?: string, message?: string, message_owner?: string };

import { normalizeForJsonish } from "@/utils/textNormalization";

export function isReactionRequest(text: string): ReactionRequestResponse {
    // Normalize text to convert styled unicode (e.g., mathematical script) to ASCII
    const normalized = normalizeForJsonish(text);
    try {
        // First try to parse as direct JSON
        const parsed: ReactionRequest = JSON.parse(normalized);

        if (parsed.action === "react_to_message" && parsed.emoji) {
            return {
                isReactionRequest: true,
                emoji: parsed.emoji,
                message: parsed.message,
                message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = normalized.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || normalized.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
        if (jsonMatch) {
            try {
                const parsed: ReactionRequest = JSON.parse(jsonMatch[1].trim());
                if (parsed.action === "react_to_message" && parsed.emoji) {
                    return {
                        isReactionRequest: true,
                        emoji: parsed.emoji,
                        message: parsed.message,
                        message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
                    };
                }
            } catch (innerError) {
                // JSON in code block is invalid
            }
        }
        
        // Also try to match if text starts with "json" followed by JSON
    const jsonPrefixMatch = normalized.match(/^json\s*\n?([\s\S]*)/i);
        if (jsonPrefixMatch) {
            try {
                const parsed: ReactionRequest = JSON.parse(jsonPrefixMatch[1].trim());
                if (parsed.action === "react_to_message" && parsed.emoji) {
                    return {
                        isReactionRequest: true,
                        emoji: parsed.emoji,
                        message: parsed.message,
                        message_owner: parsed?.message_owner && parsed.message_owner.trim().length > 0 ? parsed.message_owner : undefined
                    };
                }
            } catch (innerError) {
                // JSON after "json" prefix is invalid
            }
        }

        // Try to find JSON anywhere in the text (for cases where AI sends text before JSON)
        // Use a more robust approach to find complete JSON objects
        const jsonPattern = /\{(?:[^{}]|"[^"]*")*"action"\s*:\s*"react_to_message"(?:[^{}]|"[^"]*")*\}/g;
        const matches = normalized.match(jsonPattern);
        
        if (matches) {
            for (const match of matches) {
                try {
                    const parsed: ReactionRequest = JSON.parse(match);
                    if (parsed.action === "react_to_message" && parsed.emoji) {
                        // Extract text before the JSON to combine with the message
                        const jsonIndex = normalized.indexOf(match);
                        const textBeforeJson = normalized.substring(0, jsonIndex).trim();
                        
                        // Combine text before JSON with the message field
                        let combinedMessage = "";
                        if (textBeforeJson && parsed.message) {
                            combinedMessage = `${textBeforeJson}\n\n${parsed.message}`;
                        } else if (textBeforeJson) {
                            combinedMessage = textBeforeJson;
                        } else if (parsed.message) {
                            combinedMessage = parsed.message;
                        }
                        
                        return {
                            isReactionRequest: true,
                            emoji: parsed.emoji,
                            message: combinedMessage || undefined,
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
    
    return { isReactionRequest: false };
}