// WhatsApp API Types
export declare interface WhatsAppMessage {
	from: string;
	id: string;
	timestamp: string;
	type: 'text' | 'interactive' | 'image' | 'document' | 'audio' | 'video';
	text?: {
		body: string;
	};
	interactive?: InteractiveMessage;
}

export declare interface InteractiveMessage {
	type: 'button_reply' | 'list_reply';
	button_reply?: {
		id: string;
		title: string;
	};
	list_reply?: {
		id: string;
		title: string;
		description?: string;
	};
}

export declare interface WhatsAppContact {
	profile: {
		name: string;
	};
	wa_id: string;
}

export declare interface WhatsAppWebhook {
	object: string;
	entry: WhatsAppEntry[];
}

export declare interface WhatsAppEntry {
	id: string;
	changes: WhatsAppChange[];
}

export declare interface WhatsAppChange {
	value: {
		messaging_product: string;
		metadata: {
			display_phone_number: string;
			phone_number_id: string;
		};
		contacts?: WhatsAppContact[];
		messages?: WhatsAppMessage[];
	};
	field: string;
}

// Button and List Types
export declare interface Button {
	id: string;
	title: string;
}

export declare interface ListRow {
	id: string;
	title: string;
	description?: string;
}

export declare interface ListSection {
	title: string;
	rows: ListRow[];
}

// API Response Types
export declare interface WhatsAppApiResponse {
	messaging_product: string;
	contacts: Array<{
		input: string;
		wa_id: string;
	}>;
	messages: Array<{
		id: string;
	}>;
}

// Request Types
export declare interface SendMessageRequest {
	to: string;
	name?: string;
	message: string;
	messageId?: string;
}
