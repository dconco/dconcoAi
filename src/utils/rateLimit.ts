import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface RateLimitData {
    [contact: string]: {
        requests: number;
        windowStart: number;
        warningsSent: number;
        silenceUntil?: number; // Timestamp when silence period ends
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
    const windowDuration = 30 * 1000; // 30 seconds
    const maxRequests = 4;
    const spamPenalty = 5 * 1000; // +5 seconds for each spam message
    
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
    
    // Check if user is in silence period
    if (userLimit.silenceUntil && now < userLimit.silenceUntil) {
        // User is still in silence period, add +5 seconds for continued spamming
        rateLimitData[contact].silenceUntil = userLimit.silenceUntil + spamPenalty;
        saveRateLimit(rateLimitData);
        return false;
    }
    
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
    
    // Always increment request count when user sends message
    rateLimitData[contact].requests++;
    
    if (userLimit.requests >= maxRequests) {
        // Rate limit exceeded - start 30 second silence period
        rateLimitData[contact].silenceUntil = now + windowDuration;
        saveRateLimit(rateLimitData);
        return false;
    }
    
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

export function getRemainingRequests(contact: string): { remaining: number, resetIn: number, silenceTimeLeft?: number } {
    const now = Date.now();
    const windowDuration = 30 * 1000;
    const maxRequests = 4;
    
    const rateLimitData = loadRateLimit();
    
    if (!rateLimitData[contact]) {
        return { remaining: maxRequests, resetIn: 0 };
    }
    
    const userLimit = rateLimitData[contact];
    
    // Check if user is in silence period
    if (userLimit.silenceUntil && now < userLimit.silenceUntil) {
        const silenceTimeLeft = userLimit.silenceUntil - now;
        return { 
            remaining: 0, 
            resetIn: silenceTimeLeft,
            silenceTimeLeft: Math.ceil(silenceTimeLeft / 1000) // in seconds
        };
    }
    
    const timeSinceWindowStart = now - userLimit.windowStart;
    
    if (timeSinceWindowStart >= windowDuration) {
        return { remaining: maxRequests, resetIn: 0 };
    }
    
    const remaining = Math.max(0, maxRequests - userLimit.requests);
    const resetIn = Math.max(0, windowDuration - timeSinceWindowStart);
    
    return { remaining, resetIn };
}