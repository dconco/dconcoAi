export interface JsonParseResult<T> {
    parsed?: T;
    textBeforeJson?: string;
    found: boolean;
}

export function parseJsonFromText<T>(text: string, expectedAction: string): JsonParseResult<T> {
    try {
        // First try to parse as direct JSON
        const parsed: T = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'action' in parsed && (parsed as any).action === expectedAction) {
            return {
                parsed,
                found: true
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try other methods
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || text.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
    if (jsonMatch) {
        try {
            const parsed: T = JSON.parse(jsonMatch[1].trim());
            if (parsed && typeof parsed === 'object' && 'action' in parsed && (parsed as any).action === expectedAction) {
                return {
                    parsed,
                    found: true
                };
            }
        } catch (innerError) {
            // JSON in code block is invalid
        }
    }
    
    // Try to match if text starts with "json" followed by JSON
    const jsonPrefixMatch = text.match(/^json\s*\n?([\s\S]*)/i);
    if (jsonPrefixMatch) {
        try {
            const parsed: T = JSON.parse(jsonPrefixMatch[1].trim());
            if (parsed && typeof parsed === 'object' && 'action' in parsed && (parsed as any).action === expectedAction) {
                return {
                    parsed,
                    found: true
                };
            }
        } catch (innerError) {
            // JSON after "json" prefix is invalid
        }
    }

    // Try to find JSON anywhere in the text (for cases where AI sends text before JSON)
    const jsonPattern = new RegExp(`\\{(?:[^{}]|"[^"]*")*"action"\\s*:\\s*"${expectedAction}"(?:[^{}]|"[^"]*")*\\}`, 'g');
    const matches = text.match(jsonPattern);
    
    if (matches) {
        for (const match of matches) {
            try {
                const parsed: T = JSON.parse(match);
                if (parsed && typeof parsed === 'object' && 'action' in parsed && (parsed as any).action === expectedAction) {
                    // Extract text before the JSON
                    const jsonIndex = text.indexOf(match);
                    const textBeforeJson = text.substring(0, jsonIndex).trim();
                    
                    return {
                        parsed,
                        textBeforeJson: textBeforeJson || undefined,
                        found: true
                    };
                }
            } catch (innerError) {
                // This match wasn't valid JSON, try next one
                continue;
            }
        }
    }

    return { found: false };
}

// For parsing JSON with message_owner field (doesn't need action field)
export function parseJsonWithMessageOwner<T>(text: string): JsonParseResult<T> {
    try {
        // First try to parse as direct JSON
        const parsed: T = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'message_owner' in parsed && (parsed as any).message_owner?.trim()?.length > 0) {
            return {
                parsed,
                found: true
            };
        }
    } catch (error) {
        // If direct JSON parsing fails, try other methods
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/i) || text.match(/```\s*\n?([\s\S]*?)\n?\s*```/i);
    if (jsonMatch) {
        try {
            const parsed: T = JSON.parse(jsonMatch[1].trim());
            if (parsed && typeof parsed === 'object' && 'message_owner' in parsed && (parsed as any).message_owner?.trim()?.length > 0) {
                return {
                    parsed,
                    found: true
                };
            }
        } catch (innerError) {
            // JSON in code block is invalid
        }
    }
    
    // Try to match if text starts with "json" followed by JSON
    const jsonPrefixMatch = text.match(/^json\s*\n?([\s\S]*)/i);
    if (jsonPrefixMatch) {
        try {
            const parsed: T = JSON.parse(jsonPrefixMatch[1].trim());
            if (parsed && typeof parsed === 'object' && 'message_owner' in parsed && (parsed as any).message_owner?.trim()?.length > 0) {
                return {
                    parsed,
                    found: true
                };
            }
        } catch (innerError) {
            // JSON after "json" prefix is invalid
        }
    }

    return { found: false };
}