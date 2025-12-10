// Evolution API Configuration
// Uses environment variables from .env file

export const evolutionConfig = {
    // Evolution API server URL
    baseUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'https://apievowhats.maikones.com',

    // API Key from Evolution API
    apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '5afeb70ef0dd23870785487c1406f900',

    // Instance will be created dynamically when user scans QR Code
    defaultInstance: import.meta.env.VITE_EVOLUTION_INSTANCE || 'fitpro-main',
};

// Webhook URL for receiving messages (n8n or your backend)
export const webhookConfig = {
    // Where Evolution API will send incoming messages
    messageWebhook: import.meta.env.VITE_WEBHOOK_URL || '',
};
