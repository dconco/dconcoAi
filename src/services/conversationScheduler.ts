import { conversationTracker } from '@/services/conversationTracker';

export class ConversationScheduler {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly CHECK_INTERVAL_MINUTES: number;
    private isRunning = false;

    constructor() {
        // Configuration from environment variables with default
        this.CHECK_INTERVAL_MINUTES = Number(process.env.FOLLOWUP_CHECK_INTERVAL_MINUTES) || 10;
    }

    /**
     * Start the conversation follow-up scheduler
     */
    start(): void {
        if (this.isRunning) {
            console.log('⚠️ Conversation scheduler is already running');
            return;
        }

        console.log(`🚀 Starting conversation scheduler (checking every ${this.CHECK_INTERVAL_MINUTES} minutes)`);
        
        this.isRunning = true;
        
        // Run immediately on start
        this.checkAndProcessFollowUps();
        
        // Then run on interval
        this.intervalId = setInterval(() => {
            this.checkAndProcessFollowUps();
        }, this.CHECK_INTERVAL_MINUTES * 60 * 1000);
    }

    /**
     * Stop the conversation follow-up scheduler
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🛑 Conversation scheduler stopped');
    }

    /**
     * Check for conversations needing follow-up and process them
     */
    private async checkAndProcessFollowUps(): Promise<void> {
        try {
            console.log('🔄 Checking for conversations needing follow-up...');
            await conversationTracker.processFollowUps();
        } catch (error) {
            console.error('❌ Error in conversation follow-up check:', error);
        }
    }

    /**
     * Get scheduler status
     */
    getStatus(): { isRunning: boolean; checkInterval: number } {
        return {
            isRunning: this.isRunning,
            checkInterval: this.CHECK_INTERVAL_MINUTES
        };
    }

    /**
     * Manually trigger a follow-up check (useful for testing)
     */
    async triggerCheck(): Promise<void> {
        console.log('🔧 Manually triggering follow-up check...');
        await this.checkAndProcessFollowUps();
    }
}

export const conversationScheduler = new ConversationScheduler();