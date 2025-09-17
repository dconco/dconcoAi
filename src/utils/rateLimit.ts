import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface RateLimitData {
    [contact: string]: {
        requests: number;
        windowStart: number;
        warningsSent: number;
        lastMessage?: string;
        lastMessageId?: string;
        userName?: string;
    };
}

const rateLimitFilePath = join(__dirname, '../cache/db/rateLimit.json');

function loadRateLimit(): RateLimitData {
    try {
        if (!require('fs').existsSync(rateLimitFilePath)) {
            return {};
        }
        return JSON.parse(readFileSync(rateLimitFilePath, 'utf8'));
    } catch (error) {
        console.error('Error loading rate limit data:', error);
        return {};
    }
}

export function checkRateLimit(contact: string): boolean {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 60 seconds
    const maxRequests = 4; // 4 requests per window
    const spamPenalty = 5 * 1000; // +5 seconds for spamming
    
    const rateLimitData = loadRateLimit();
    
    if (!rateLimitData[contact]) {
        // First request from this user
        rateLimitData[contact] = {
            requests: 1,
            windowStart: now,
            warningsSent: 0
        };
        saveRateLimit(rateLimitData);
        return true;
    }
    
    const userLimit = rateLimitData[contact];
    const timeSinceWindowStart = now - userLimit.windowStart;
    
    if (timeSinceWindowStart >= windowDuration) {
        // Reset window
        rateLimitData[contact] = {
            requests: 1,
            windowStart: now,
            warningsSent: 0
        };
        saveRateLimit(rateLimitData);
        return true;
    }
    
    if (userLimit.requests >= maxRequests) {
        // Rate limit exceeded - add spam penalty (extend window)
        rateLimitData[contact].windowStart -= spamPenalty;
        saveRateLimit(rateLimitData);
        return false;
    }
    
    // Increment request count
    rateLimitData[contact].requests++;
    saveRateLimit(rateLimitData);
    return true;
}

function saveRateLimit(data: RateLimitData): void {
    try {
        writeFileSync(rateLimitFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving rate limit data:', error);
    }
}

export function shouldSendWarning(contact: string): boolean {
    const rateLimitData = loadRateLimit();
    
    if (!rateLimitData[contact]) {
        return false;
    }
    
    const userLimit = rateLimitData[contact];
    
    if (userLimit.warningsSent >= 2) {
        // Already sent 2 warnings, don't send more
        return false;
    }
    
    // Increment warning count
    rateLimitData[contact].warningsSent++;
    saveRateLimit(rateLimitData);
    
    return true;
}

export function getRemainingRequests(contact: string): { remaining: number, resetIn: number } {
    const now = Date.now();
    const windowDuration = 60 * 1000; // Back to 60 seconds
    const maxRequests = 4; // Back to 4 requests
    
    const rateLimitData = loadRateLimit();
    
    if (!rateLimitData[contact]) {
        return { remaining: maxRequests, resetIn: 0 };
    }
    
    const userLimit = rateLimitData[contact];
    const timeSinceWindowStart = now - userLimit.windowStart;
    
    if (timeSinceWindowStart >= windowDuration) {
        return { remaining: maxRequests, resetIn: 0 };
    }
    
    const remaining = Math.max(0, maxRequests - userLimit.requests);
    const resetIn = Math.max(0, windowDuration - timeSinceWindowStart);
    
    return { remaining, resetIn };
}

// Store last message when rate limited
export function storeLastMessage(contact: string, message: string, messageId: string, userName?: string): void {
    const rateLimitData = loadRateLimit();
    
    if (rateLimitData[contact]) {
        rateLimitData[contact].lastMessage = message;
        rateLimitData[contact].lastMessageId = messageId;
        rateLimitData[contact].userName = userName;
        saveRateLimit(rateLimitData);
    }
}

// Check if user has a pending message and clear it
export function getPendingMessage(contact: string): { hasMessage: boolean, message?: string, messageId?: string, userName?: string } {
    const rateLimitData = loadRateLimit();
    
    if (!rateLimitData[contact] || !rateLimitData[contact].lastMessage) {
        return { hasMessage: false };
    }
    
    const pendingMessage = {
        hasMessage: true,
        message: rateLimitData[contact].lastMessage,
        messageId: rateLimitData[contact].lastMessageId,
        userName: rateLimitData[contact].userName
    };
    
    // Clear the stored message
    delete rateLimitData[contact].lastMessage;
    delete rateLimitData[contact].lastMessageId;
    delete rateLimitData[contact].userName;
    saveRateLimit(rateLimitData);
    
    return pendingMessage;
}