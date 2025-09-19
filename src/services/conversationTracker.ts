import Message from '@/models/Message';
import WhatsAppService from '@/utils/whatsappService';

export interface ConversationState {
    contact: string;
    lastMessageTime: Date;
    conversationStartTime: Date;
    needsFollowUp: boolean;
    followUpCount: number;
}

export class ConversationTracker {
    private whatsappService: WhatsAppService;
    private readonly CONVERSATION_WINDOW_HOURS: number;
    private readonly FOLLOWUP_DELAY_MINUTES: number;
    private readonly MAX_FOLLOWUPS: number;
    private readonly ENABLED: boolean;

    constructor() {
        this.whatsappService = new WhatsAppService();
        
        // Configuration from environment variables with defaults
        this.CONVERSATION_WINDOW_HOURS = Number(process.env.FOLLOWUP_WINDOW_HOURS) || 24;
        this.FOLLOWUP_DELAY_MINUTES = Number(process.env.FOLLOWUP_DELAY_MINUTES) || 30;
        this.MAX_FOLLOWUPS = Number(process.env.MAX_FOLLOWUPS) || 3;
        this.ENABLED = process.env.FOLLOWUP_ENABLED !== 'false'; // Default to true unless explicitly disabled
        
        console.log(`📋 Conversation Tracker Config:
        - Window: ${this.CONVERSATION_WINDOW_HOURS}h
        - Delay: ${this.FOLLOWUP_DELAY_MINUTES}min
        - Max followups: ${this.MAX_FOLLOWUPS}
        - Enabled: ${this.ENABLED}`);
    }

    /**
     * Get conversations that need follow-up messages
     */
    async getConversationsNeedingFollowUp(): Promise<ConversationState[]> {
        const now = new Date();
        const windowStart = new Date(now.getTime() - (this.CONVERSATION_WINDOW_HOURS * 60 * 60 * 1000));
        const followUpThreshold = new Date(now.getTime() - (this.FOLLOWUP_DELAY_MINUTES * 60 * 1000));

        // Get users who have had conversations within the last 24 hours
        const recentConversations = await Message.aggregate([
            {
                $match: {
                    timestamp: { $gte: windowStart }
                }
            },
            {
                $group: {
                    _id: '$contact',
                    lastMessageTime: { $max: '$timestamp' },
                    conversationStartTime: { $min: '$timestamp' },
                    messageCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    // Last message was more than 30 minutes ago but conversation started within 24 hours
                    lastMessageTime: { $lte: followUpThreshold },
                    messageCount: { $gte: 1 } // Has at least one message
                }
            }
        ]);

        const conversationStates: ConversationState[] = [];

        for (const conv of recentConversations) {
            // Check if we've already sent follow-ups recently
            const followUpCount = await this.getRecentFollowUpCount(conv._id);
            
            if (followUpCount < this.MAX_FOLLOWUPS) {
                conversationStates.push({
                    contact: conv._id,
                    lastMessageTime: conv.lastMessageTime,
                    conversationStartTime: conv.conversationStartTime,
                    needsFollowUp: true,
                    followUpCount
                });
            }
        }

        return conversationStates;
    }

    /**
     * Count how many follow-up messages we've sent to this contact recently
     */
    private async getRecentFollowUpCount(contact: string): Promise<number> {
        const last2Hours = new Date(Date.now() - (2 * 60 * 60 * 1000));
        
        return await Message.countDocuments({
            contact,
            timestamp: { $gte: last2Hours },
            text: { $regex: /follow.*up|check.*in|still.*there|wondering/i } // Pattern to identify follow-up messages
        });
    }

    /**
     * Generate contextual follow-up message based on conversation state
     */
    generateFollowUpMessage(state: ConversationState): string {
        const timeSinceLastMessage = Date.now() - state.lastMessageTime.getTime();
        const hours = Math.floor(timeSinceLastMessage / (1000 * 60 * 60));
        const minutes = Math.floor((timeSinceLastMessage % (1000 * 60 * 60)) / (1000 * 60));

        const messages = [
            "Hey! Just checking in - still thinking about our conversation? 🤔",
            "Hi there! Did you have any other questions about what we were discussing? 💭",
            "Hello! Just wondering if you needed any more info on our chat topic? 😊",
            "Hey! Still around? I'm here if you want to continue our conversation! 👋",
            "Hi! Just following up - anything else I can help you with? 🙂",
            "Hello! Our conversation was interesting - did you want to dive deeper into anything? 🔍",
            "Hey! Just wanted to make sure you got what you needed from our chat! ✅"
        ];

        // Add time-sensitive context
        if (hours >= 1) {
            const timeContextMessages = [
                `Hi! It's been about ${hours} hour${hours > 1 ? 's' : ''} since we last chatted. Still interested in continuing? 🕐`,
                `Hey! Noticed it's been ${hours} hour${hours > 1 ? 's' : ''} - did you want to pick up where we left off? ⏰`,
            ];
            messages.push(...timeContextMessages);
        }

        // Randomize to feel natural
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Send follow-up message to a contact
     */
    async sendFollowUpMessage(contact: string): Promise<boolean> {
        try {
            const conversationStates = await this.getConversationsNeedingFollowUp();
            const targetConversation = conversationStates.find(c => c.contact === contact);

            if (!targetConversation) {
                console.log(`No follow-up needed for ${contact}`);
                return false;
            }

            const message = this.generateFollowUpMessage(targetConversation);
            
            await this.whatsappService.sendTextMessage(contact, message, null);
            
            // Log this as a follow-up message
            console.log(`📤 Sent follow-up to ${contact}: ${message}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to send follow-up to ${contact}:`, error);
            return false;
        }
    }

    /**
     * Process all conversations that need follow-ups
     */
    async processFollowUps(): Promise<void> {
        if (!this.ENABLED) {
            console.log('⏸️ Conversation follow-ups are disabled');
            return;
        }

        const conversationsNeedingFollowUp = await this.getConversationsNeedingFollowUp();
        
        console.log(`🔍 Found ${conversationsNeedingFollowUp.length} conversations needing follow-up`);

        for (const conversation of conversationsNeedingFollowUp) {
            await this.sendFollowUpMessage(conversation.contact);
            
            // Add small delay between messages to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    /**
     * Check if a contact should receive a follow-up
     */
    async shouldSendFollowUp(contact: string): Promise<boolean> {
        const conversations = await this.getConversationsNeedingFollowUp();
        return conversations.some(c => c.contact === contact);
    }
}

export const conversationTracker = new ConversationTracker();