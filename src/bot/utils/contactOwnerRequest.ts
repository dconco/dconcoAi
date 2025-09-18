type ContactOwnerRequest = {
   message_owner?: string;
};

export type ContactOwnerRequestResponse = { isContactOwnerRequest: boolean, message_owner?: string };

export function isContactOwnerRequest(text: string): ContactOwnerRequestResponse {
    console.log(text);
    try {
        // First try to parse as direct JSON
        const parsed: ContactOwnerRequest  = JSON.parse(text);

        if (parsed?.message_owner && parsed.message_owner.trim().length > 0) {
            return {
               isContactOwnerRequest: true,
               message_owner: parsed.message_owner
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || text.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
        if (jsonMatch) {
            try {
                const parsed: ContactOwnerRequest = JSON.parse(jsonMatch[1].trim());
                
                if (parsed?.message_owner && parsed.message_owner.trim().length > 0) {
                    return {
                        isContactOwnerRequest: true,
                        message_owner: parsed.message_owner
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
                const parsed: ContactOwnerRequest = JSON.parse(jsonPrefixMatch[1].trim());
                
                if (parsed?.message_owner && parsed.message_owner.trim().length > 0) {
                    return {
                        isContactOwnerRequest: true,
                        message_owner: parsed.message_owner
                    };
                }
            } catch (innerError) {
                // JSON after "json" prefix is invalid
            }
        }
    }

    return { isContactOwnerRequest: false };
}