import { parseJsonFromText } from './jsonParser';

type ReactionRequest = {
    action: "react_to_message";
    emoji: string;
    message?: string;
};

export type ReactionRequestResponse = { isReactionRequest: boolean, emoji?: string, message?: string };

export function isReactionRequest(text: string): ReactionRequestResponse {
    const result = parseJsonFromText<ReactionRequest>(text, "react_to_message");
    
    if (result.found && result.parsed?.emoji) {
        // Combine text before JSON with the message field
        let combinedMessage = "";
        if (result.textBeforeJson && result.parsed.message) {
            combinedMessage = `${result.textBeforeJson}\n\n${result.parsed.message}`;
        } else if (result.textBeforeJson) {
            combinedMessage = result.textBeforeJson;
        } else if (result.parsed.message) {
            combinedMessage = result.parsed.message;
        }
        
        return {
            isReactionRequest: true,
            emoji: result.parsed.emoji,
            message: combinedMessage || undefined
        };
    }
    
    return { isReactionRequest: false };
}