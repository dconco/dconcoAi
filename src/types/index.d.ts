// WhatsApp API Types
export interface WhatsAppMessage {
	from: string;
	id: string;
	timestamp: string;
	type: 'text' | 'interactive' | 'image' | 'document' | 'audio' | 'video';
	text?: {
		body: string;
	};
	interactive?: InteractiveMessage;
}

export interface InteractiveMessage {
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

export interface WhatsAppContact {
	profile: {
		name: string;
	};
	wa_id: string;
}

export interface WhatsAppWebhook {
	object: string;
	entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
	id: string;
	changes: WhatsAppChange[];
}

export interface WhatsAppChange {
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
export interface Button {
	id: string;
	title: string;
}

export interface ListRow {
	id: string;
	title: string;
	description?: string;
}

export interface ListSection {
	title: string;
	rows: ListRow[];
}

// API Response Types
export interface WhatsAppApiResponse {
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
export interface SendMessageRequest {
	to: string;
	message: string;
}
