import { parseJsonWithMessageOwner } from './jsonParser';

type ContactOwnerRequest = {
   message_owner?: string;
};

export type ContactOwnerRequestResponse = { isContactOwnerRequest: boolean, message_owner?: string };

export function isContactOwnerRequest(text: string): ContactOwnerRequestResponse {
    console.log(JSON.stringify(text));
    
    const result = parseJsonWithMessageOwner<ContactOwnerRequest>(text);
    
    if (result.found && result.parsed?.message_owner) {
        return {
            isContactOwnerRequest: true,
            message_owner: result.parsed.message_owner
        };
    }

    return { isContactOwnerRequest: false };
}