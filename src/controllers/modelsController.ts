import { Request, Response } from "express";
import { getCurrentModel, getModelStatus } from "@/utils/modelFallback";

export const currentModel = (_: Request, res: Response) => {
	try {
		const currentModel = getCurrentModel();
		const modelStatus = getModelStatus();
		
		// Find the current model details
		const currentModelData = modelStatus.usage.find(m => m.name === currentModel);
		
		res.json({
			success: true,
			data: {
				currentModel: currentModel,
				version: currentModelData?.version || 'unknown',
				dailyUsage: currentModelData?.dailyUsage || 0,
				dailyLimit: currentModelData?.dailyLimit || 0,
				usagePercentage: currentModelData?.usagePercentage || 0,
				isBlocked: currentModelData?.isBlocked || false,
				isUnlimited: currentModelData?.dailyLimit >= 999999,
				timestamp: new Date().toISOString()
			}
		});
	} catch (error) {
		res.status(500).json({ 
			success: false, 
			error: (error as Error).message 
		});
	}
}

export const getModels = (_: Request, res: Response) => {
	try {
		const modelStatus = getModelStatus();

		res.json({
			success: true,
			data: modelStatus
		});
	} catch (error) {
		res.status(500).json({ 
			success: false, 
			error: (error as Error).message 
		});
	}
}