import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface ModelConfig {
    name: string;
    version: string;
    dailyLimit: number;
    isActive: boolean;
}

interface ModelFallbackData {
    currentModel: string;
    models: {
        [modelName: string]: {
            dailyUsage: number;
            lastReset: string; // Date string
            isBlocked: boolean;
        };
    };
}

// Model configurations in fallback order
export const MODEL_CONFIGS: ModelConfig[] = [
    {
        name: "gemini-2.5-pro",
        version: "2.5-pro",
        dailyLimit: 50, // Conservative limit for pro model
        isActive: true
    },
    {
        name: "gemini-2.5-flash",
        version: "2.5-flash",
        dailyLimit: 200,
        isActive: true
    },
    {
        name: "gemini-2.5-flash-lite",
        version: "2.5-flash-lite",
        dailyLimit: 500,
        isActive: true
    },
    {
        name: "gemini-2.0-flash",
        version: "2.0-flash",
        dailyLimit: 200,
        isActive: true
    },
    {
        name: "gemini-2.0-flash-exp",
        version: "2.0-flash",
        dailyLimit: 200,
        isActive: true
    },
    {
        name: "gemini-2.0-flash-lite",
        version: "2.0-flash-lite",
        dailyLimit: 300,
        isActive: true
    },
    {
        name: "gemini-1.5-flash",
        version: "1.5-flash",
        dailyLimit: 1500,
        isActive: true
    },
    {
        name: "gemma-2b-it",
        version: "gemma-2b",
        dailyLimit: 999999, // Unlimited model
        isActive: true
    }
];

const modelFallbackFilePath = join(__dirname, '../cache/db/modelFallback.json');

function loadModelFallbackData(): ModelFallbackData {
    try {
        if (!require('fs').existsSync(modelFallbackFilePath)) {
            return {
                currentModel: MODEL_CONFIGS[0].name,
                models: {}
            };
        }
        return JSON.parse(readFileSync(modelFallbackFilePath, 'utf8'));
    } catch (error) {
        console.error('Error loading model fallback data:', error);
        return {
            currentModel: MODEL_CONFIGS[0].name,
            models: {}
        };
    }
}

function saveModelFallbackData(data: ModelFallbackData): void {
    try {
        writeFileSync(modelFallbackFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving model fallback data:', error);
    }
}

function isNewDay(lastReset: string): boolean {
    const today = new Date().toDateString();
    const lastResetDate = new Date(lastReset).toDateString();
    return today !== lastResetDate;
}

function resetDailyUsageIfNeeded(data: ModelFallbackData): ModelFallbackData {
    const today = new Date().toISOString();
    
    for (const modelName in data.models) {
        const modelData = data.models[modelName];
        if (isNewDay(modelData.lastReset)) {
            modelData.dailyUsage = 0;
            modelData.lastReset = today;
            modelData.isBlocked = false;
        }
    }
    
    return data;
}

export function getCurrentModel(): string {
    const data = loadModelFallbackData();
    const updatedData = resetDailyUsageIfNeeded(data);
    
    // Check if current model is still available
    const currentModelConfig = MODEL_CONFIGS.find(m => m.name === updatedData.currentModel);
    if (currentModelConfig) {
        const currentModelData = updatedData.models[updatedData.currentModel];
        if (!currentModelData || currentModelData.dailyUsage < currentModelConfig.dailyLimit) {
            saveModelFallbackData(updatedData);
            return updatedData.currentModel;
        }
    }
    
    // Current model exhausted, find next available model
    for (const config of MODEL_CONFIGS) {
        const modelData = updatedData.models[config.name];
        if (!modelData || modelData.dailyUsage < config.dailyLimit) {
            updatedData.currentModel = config.name;
            saveModelFallbackData(updatedData);
            console.log(`🔄 Switched to model: ${config.name} (v${config.version})`);
            return config.name;
        }
    }
    
    // Fallback to Gemma (unlimited) - this should always work
    const gemmaModel = MODEL_CONFIGS.find(m => m.name.includes('gemma'));
    if (gemmaModel) {
        updatedData.currentModel = gemmaModel.name;
        saveModelFallbackData(updatedData);
        console.log(`🚀 Falling back to unlimited model: ${gemmaModel.name}`);
        return gemmaModel.name;
    }
    
    // This should never happen
    return MODEL_CONFIGS[MODEL_CONFIGS.length - 1].name;
}

export function recordModelUsage(modelName: string): void {
    const data = loadModelFallbackData();
    const updatedData = resetDailyUsageIfNeeded(data);
    
    if (!updatedData.models[modelName]) {
        updatedData.models[modelName] = {
            dailyUsage: 0,
            lastReset: new Date().toISOString(),
            isBlocked: false
        };
    }
    
    updatedData.models[modelName].dailyUsage++;
    
    // Check if model limit is reached (but don't block unlimited models like Gemma)
    const modelConfig = MODEL_CONFIGS.find(m => m.name === modelName);
    if (modelConfig && 
        modelConfig.dailyLimit < 999999 && // Don't block unlimited models
        updatedData.models[modelName].dailyUsage >= modelConfig.dailyLimit) {
        updatedData.models[modelName].isBlocked = true;
        console.log(`🚫 Model ${modelName} has reached daily limit (${modelConfig.dailyLimit})`);
    }
    
    saveModelFallbackData(updatedData);
}

export function handleQuotaExhausted(currentModel: string): string {
    console.log(`💥 Quota exhausted for ${currentModel}, switching to fallback model`);
    
    const data = loadModelFallbackData();
    const updatedData = resetDailyUsageIfNeeded(data);
    
    // Mark current model as blocked
    if (!updatedData.models[currentModel]) {
        updatedData.models[currentModel] = {
            dailyUsage: 0,
            lastReset: new Date().toISOString(),
            isBlocked: false
        };
    }
    updatedData.models[currentModel].isBlocked = true;
    
    // Find next available model
    const currentModelIndex = MODEL_CONFIGS.findIndex(m => m.name === currentModel);
    for (let i = currentModelIndex + 1; i < MODEL_CONFIGS.length; i++) {
        const config = MODEL_CONFIGS[i];
        const modelData = updatedData.models[config.name];
        if (!modelData || (!modelData.isBlocked && modelData.dailyUsage < config.dailyLimit)) {
            updatedData.currentModel = config.name;
            saveModelFallbackData(updatedData);
            console.log(`✅ Switched to fallback model: ${config.name} (v${config.version})`);
            return config.name;
        }
    }
    
    // If no fallback available, try from the beginning
    for (const config of MODEL_CONFIGS) {
        const modelData = updatedData.models[config.name];
        if (!modelData || (!modelData.isBlocked && modelData.dailyUsage < config.dailyLimit)) {
            updatedData.currentModel = config.name;
            saveModelFallbackData(updatedData);
            console.log(`🔄 Cycled back to model: ${config.name} (v${config.version})`);
            return config.name;
        }
    }
    
    // Fallback to Gemma (unlimited) - this should always work
    const gemmaModel = MODEL_CONFIGS.find(m => m.name.includes('gemma'));
    if (gemmaModel) {
        updatedData.currentModel = gemmaModel.name;
        saveModelFallbackData(updatedData);
        console.log(`🚀 Falling back to unlimited model: ${gemmaModel.name} (v${gemmaModel.version})`);
        return gemmaModel.name;
    }
    
    // This should never happen since Gemma is unlimited
    console.error('⚠️ Critical error: No models available');
    return MODEL_CONFIGS[MODEL_CONFIGS.length - 1].name;
}

export function getModelStatus(): { currentModel: string, usage: any[], nextReset: string } {
    const data = loadModelFallbackData();
    const updatedData = resetDailyUsageIfNeeded(data);
    
    const usage = MODEL_CONFIGS.map(config => {
        const modelData = updatedData.models[config.name];
        return {
            name: config.name,
            version: config.version,
            dailyUsage: modelData?.dailyUsage || 0,
            dailyLimit: config.dailyLimit,
            isBlocked: modelData?.isBlocked || false,
            usagePercentage: Math.round(((modelData?.dailyUsage || 0) / config.dailyLimit) * 100)
        };
    });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
        currentModel: updatedData.currentModel,
        usage,
        nextReset: tomorrow.toISOString()
    };
}