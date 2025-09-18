import { parseJsonFromText } from './jsonParser';

type ImageGenerationRequest = {
   action: "generate_image";
   prompt: string;
   caption?: string;
};

export type ImageGenerationRequestResponse = { isImageRequest: boolean, prompt?: string, caption?: string };

export function isImageGenerationRequest(text: string): ImageGenerationRequestResponse {
    const result = parseJsonFromText<ImageGenerationRequest>(text, "generate_image");
    
    if (result.found && result.parsed?.prompt) {
        // Combine text before JSON with the caption field
        let combinedCaption = "";
        if (result.textBeforeJson && result.parsed.caption) {
            combinedCaption = `${result.textBeforeJson}\n\n${result.parsed.caption}`;
        } else if (result.textBeforeJson) {
            combinedCaption = result.textBeforeJson;
        } else if (result.parsed.caption) {
            combinedCaption = result.parsed.caption;
        }
        
        return {
            isImageRequest: true,
            prompt: result.parsed.prompt,
            caption: combinedCaption || undefined
        };
    }
    
    return { isImageRequest: false };
}