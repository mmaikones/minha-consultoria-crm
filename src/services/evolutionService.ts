// Evolution API Service
// Handles all WhatsApp operations via Evolution API v2.3.4
// Documentation: https://doc.evolution-api.com/v2/api-reference

import { evolutionConfig } from '../config/evolution';

// --- Interfaces ---

export interface EvolutionInstance {
    instanceName: string;
    instanceId?: string;
    status: 'open' | 'close' | 'connecting';
    owner?: string;
    profileName?: string;
    profilePictureUrl?: string;
    integration?: string;
    serverUrl?: string;
    apikey?: string;
}

export interface ConnectionState {
    state: 'open' | 'close' | 'connecting';
    statusReason?: number;
}

export interface QRCodeResponse {
    pairingCode?: string;
    code?: string;
    base64?: string;
    count?: number;
}

export interface SendMessagePayload {
    number: string;
    text: string;
}

export interface SendMediaPayload {
    number: string;
    mediatype: 'image' | 'video' | 'audio' | 'document';
    mimetype: string;
    caption?: string;
    media: string; // base64 or URL
    fileName?: string;
}

export interface Contact {
    id: string; // remoteJid
    pushName: string;
    profilePictureUrl?: string;
    number?: string;
}

export interface Chat {
    id: string; // remoteJid
    name: string;
    lastMessage?: string;
    unreadCount?: number;
    timestamp?: number;
    profilePictureUrl?: string;
}

export interface Message {
    id: string; // key.id
    key?: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    }
    fromMe: boolean;
    message: string;
    timestamp: number;
    type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'other';
    participant?: string; // for groups
    pushName?: string; // sender name
}

// --- Error Class ---

export class EvolutionError extends Error {
    constructor(public message: string, public status?: number, public code?: string) {
        super(message);
        this.name = 'EvolutionError';
    }
}

class EvolutionService {
    public baseUrl: string;
    public apiKey: string;
    private instanceName: string;

    constructor() {
        this.baseUrl = evolutionConfig.baseUrl;
        this.apiKey = evolutionConfig.apiKey;
        this.instanceName = evolutionConfig.defaultInstance;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        console.log(`[Evolution API] ${options.method || 'GET'} ${endpoint}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                    ...options.headers,
                },
            });

            // Handle no-content responses
            if (response.status === 204) {
                return {} as T;
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error(`[Evolution API] Error ${response.status}:`, data);

                if (response.status === 401) {
                    throw new EvolutionError('Erro de autenticação. Verifique a API Key.', 401);
                }
                if (response.status === 404) {
                    throw new EvolutionError('Instância não encontrada.', 404);
                }
                if (response.status === 409) {
                    throw new EvolutionError('Instância já existe.', 409);
                }
                if (response.status === 500) {
                    throw new EvolutionError('Erro interno no servidor Evolution.', 500);
                }

                throw new EvolutionError(data?.message || data?.error || `Erro HTTP ${response.status}`, response.status);
            }

            return data;
        } catch (error: any) {
            if (error instanceof EvolutionError) {
                throw error;
            }
            console.error('[Evolution API] Network error:', error);
            throw new EvolutionError(error.message || 'Falha na conexão com Evolution API', 0);
        }
    }

    // ==========================================
    // INSTANCE MANAGEMENT - Evolution API v2.3.4
    // ==========================================

    /**
     * Create a new WhatsApp instance
     * POST /instance/create
     * @see https://doc.evolution-api.com/v2/api-reference/create-instance
     */
    async createInstance(instanceName?: string, number?: string): Promise<EvolutionInstance> {
        const name = instanceName || this.instanceName;

        const payload: any = {
            instanceName: name,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
        };

        // If number is provided, use pairing code flow
        if (number) {
            payload.number = this.formatPhoneNumber(number);
        }

        console.log('[Evolution API] Creating instance:', name);
        const result = await this.request<EvolutionInstance>('/instance/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // CORREÇÃO CRÍTICA: Salva automaticamente no localStorage após criar
        this.setInstance(name);
        console.log('[Evolution API] Instance criada e salva como ativa:', name);

        return result;
    }

    /**
     * Connect instance and get QR Code
     * GET /instance/connect/{instanceName}
     * @see https://doc.evolution-api.com/v2/api-reference/connect-instance
     * 
     * This is the correct endpoint for Evolution API v2.3.4
     * Returns: { pairingCode, code, base64, count }
     */
    async connectInstance(instanceName?: string): Promise<QRCodeResponse> {
        const name = instanceName || this.instanceName;
        console.log('[Evolution API] Connecting instance:', name);
        return this.request<QRCodeResponse>(`/instance/connect/${name}`);
    }

    /**
     * Get QR Code for connecting (alias for connectInstance)
     * This maintains backward compatibility
     */
    async getQRCode(instanceName?: string): Promise<{ base64: string; code: string }> {
        const response = await this.connectInstance(instanceName);
        return {
            base64: response.base64 || '',
            code: response.code || response.pairingCode || '',
        };
    }

    /**
     * Get connection state
     * GET /instance/connectionState/{instanceName}
     * @see https://doc.evolution-api.com/v2/api-reference/connection-state
     */
    async getConnectionState(instanceName?: string): Promise<ConnectionState> {
        const name = instanceName || this.instanceName;
        const response: any = await this.request(`/instance/connectionState/${name}`);

        // Evolution API v2.3.4 returns { instance: { instanceName, state } }
        const state = response?.instance?.state || response?.state || 'close';

        return {
            state: state as ConnectionState['state'],
            statusReason: response?.instance?.statusReason || response?.statusReason
        };
    }

    // --- CACHE HELPERS ---
    private saveCache(key: string, data: any) {
        try {
            localStorage.setItem(`ev_cache_${key}`, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (e) { console.error('Cache save failed', e); }
    }

    private getCache<T>(key: string): T | null {
        try {
            const raw = localStorage.getItem(`ev_cache_${key}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // Cache valid for 24h for instances/chats, but we always try to refresh
            return parsed.data;
        } catch (e) { return null; }
    }

    getCachedInstances(): EvolutionInstance[] {
        return this.getCache<EvolutionInstance[]>('instances') || [];
    }

    getCachedChats(instanceName: string): Chat[] {
        return this.getCache<Chat[]>(`chats_${instanceName}`) || [];
    }

    getCachedMessages(chatId: string): Message[] {
        return this.getCache<Message[]>(`msgs_${chatId}`) || [];
    }

    // --- INSTANCE MANAGEMENT ---

    /**
     * GET /instance/fetchInstances
     */
    async fetchAllInstances(): Promise<EvolutionInstance[]> {
        console.log('[Evolution API] Fetching all instances...');
        try {
            const response = await this.request<any>('/instance/fetchInstances', {
                method: 'GET'
            });

            // Normalização: API v2 pode retornar array direto ou objeto { instance: [], ... }
            let instances: any[] = [];
            if (Array.isArray(response)) {
                instances = response;
            } else if (response && Array.isArray(response.data)) {
                instances = response.data;
            }

            // Normaliza cada instância para o formato EvolutionInstance
            const normalized = instances.map((item: any) => ({
                instanceName: item.instance?.instanceName || item.instanceName || '',
                instanceId: item.instance?.instanceId || item.instanceId,
                status: item.instance?.status || item.status || item.instance?.state || item.state || 'close',
                owner: item.instance?.owner || item.owner,
                profileName: item.instance?.profileName || item.profileName,
                profilePictureUrl: item.instance?.profilePictureUrl || item.profilePictureUrl,
                integration: item.instance?.integration || item.integration,
            })).filter((i: EvolutionInstance) => i.instanceName); // Remove vazios

            this.saveCache('instances', normalized);
            return normalized;
        } catch (error) {
            console.error('[Evolution API] Error fetching instances:', error);
            // Return cache as fallback
            return this.getCache<EvolutionInstance[]>('instances') || [];
        }
    }

    /**
     * Logout instance (disconnect WhatsApp)
     * DELETE /instance/logout/{instanceName}
     * @see https://doc.evolution-api.com/v2/api-reference/logout-instance
     */
    async logoutInstance(instanceName?: string): Promise<void> {
        const name = instanceName || this.instanceName;
        console.log('[Evolution API] Logging out instance:', name);
        await this.request(`/instance/logout/${name}`, { method: 'DELETE' });
    }

    /**
     * Delete instance completely
     * DELETE /instance/delete/{instanceName}
     * @see https://doc.evolution-api.com/v2/api-reference/delete-instance
     */
    async deleteInstance(instanceName?: string): Promise<void> {
        const name = instanceName || this.instanceName;
        console.log('[Evolution API] Deleting instance:', name);
        await this.request(`/instance/delete/${name}`, { method: 'DELETE' });
    }

    /**
     * Restart instance
     * PUT /instance/restart/{instanceName}
     */
    async restartInstance(instanceName?: string): Promise<void> {
        const name = instanceName || this.instanceName;
        console.log('[Evolution API] Restarting instance:', name);
        await this.request(`/instance/restart/${name}`, { method: 'PUT' });
    }

    // ==========================================
    // CHATS & MESSAGES
    // ==========================================

    /**
     * Fetch all chats/conversations
     * POST /chat/findChats/{instanceName}
     */
    async fetchChats(instanceName?: string): Promise<Chat[]> {
        const name = instanceName || this.instanceName || localStorage.getItem('fitpro_active_instance');

        console.log(`[Evolution API] Fetching chats for instance: ${name}`);

        try {
            const response = await this.request<any>(`/chat/findChats/${name}`, {
                method: 'POST',
                body: JSON.stringify({
                    where: {}, // Bring all
                    limit: 50 // Safe limit
                })
            });

            // LOG DE DEBUG CRÍTICO
            console.log('[Evolution API] fetchChats RAW:', JSON.stringify(response).slice(0, 200) + '...');

            // Normalização: API v2 pode retornar array direto ou objeto { data: [] } ou { chats: [] }
            let chats: any[] = [];

            if (Array.isArray(response)) {
                chats = response;
            } else if (response && Array.isArray(response.data)) {
                chats = response.data;
            } else if (response && Array.isArray(response.chats)) {
                chats = response.chats;
            }

            console.log(`[Evolution API] Processed ${chats.length} chats`);

            const mappedChats = chats.map(c => ({
                id: c.remoteJid || c.id,
                name: c.name || c.pushName || c.contact?.name || c.contact?.pushName || c.id?.split('@')[0] || 'Desconhecido',
                lastMessage: this.extractMessageContent(c.lastMessage),
                unreadCount: c.unreadCount || 0,
                timestamp: c.conversationTimestamp || c.timestamp || Date.now() / 1000,
                profilePictureUrl: c.profilePictureUrl || c.contact?.profilePictureUrl || null
            }));

            if (mappedChats.length > 0) {
                this.saveCache(`chats_${name}`, mappedChats);
            }

            return mappedChats;

        } catch (error) {
            console.error('[Evolution API] Failed to fetch chats:', error);
            throw error; // Propagate error to UI so it doesn't wipe the list
        }
    }

    /**
     * Fetch messages from a specific chat
     * POST /chat/findMessages/{instanceName}
     */
    async fetchMessages(remoteJid: string, count: number = 50, instanceName?: string): Promise<Message[]> {
        const name = instanceName || this.instanceName || localStorage.getItem('fitpro_active_instance');

        if (!name) {
            console.error('[Evolution API] Sem instância selecionada para buscar mensagens');
            return [];
        }

        console.log(`[Evolution API] Buscando ${count} mensagens de ${remoteJid} na instância ${name}...`);

        try {
            const response = await this.request<any>(`/chat/findMessages/${name}`, {
                method: 'POST',
                body: JSON.stringify({
                    where: {
                        key: {
                            remoteJid: remoteJid
                        }
                    },
                    options: {
                        limit: count,
                        sort: "ASC"
                    }
                })
            });

            // Normalização: API pode retornar { messages: [] } ou direto [] ou { data: [] }
            let messages: any[] = [];
            const rawData = response?.messages || response?.data || response || [];

            if (Array.isArray(rawData)) {
                messages = rawData;
            }

            // Ordena manualmente por timestamp (ASC: antigas -> novas)
            messages.sort((a: any, b: any) => (a.messageTimestamp || a.timestamp) - (b.messageTimestamp || b.timestamp));

            console.log(`[Evolution API] fetchMessages for ${remoteJid}: Found ${messages.length}`);

            // Mapeia para ordem cronológica (antigas -> novas) - já ordenado pela API
            const mapped = messages.slice(0, count).map((m: any) => ({
                id: m.key?.id || m.id || `msg-${Date.now()}`,
                key: m.key,
                fromMe: m.key?.fromMe || m.fromMe || false,
                message: this.extractMessageContent(m),
                timestamp: m.messageTimestamp || m.timestamp || Date.now() / 1000,
                type: m.messageType || this.getMessageType(m.message),
                pushName: m.pushName || m.participant
            }));

            if (mapped.length > 0) {
                this.saveCache(`msgs_${remoteJid}`, mapped);
            }

            return mapped;

        } catch (error) {
            console.error('[Evolution API] Error fetching messages:', error);
            return [];
        }
    }

    // ==========================================
    // MESSAGING
    // ==========================================

    /**
     * Send text message
     * POST /message/sendText/{instanceName}
     */
    async sendText(number: string, text: string, instanceName?: string): Promise<any> {
        const name = instanceName || this.instanceName;
        const formatted = this.formatPhoneNumber(number);

        return this.request(`/message/sendText/${name}`, {
            method: 'POST',
            body: JSON.stringify({
                number: formatted,
                text,
                delay: 1200 // Natural typing delay
            })
        });
    }

    /**
     * Send media
     * POST /message/sendMedia/{instanceName}
     */
    async sendMedia(payload: SendMediaPayload, instanceName?: string): Promise<any> {
        const name = instanceName || this.instanceName;
        const formatted = this.formatPhoneNumber(payload.number);

        return this.request(`/message/sendMedia/${name}`, {
            method: 'POST',
            body: JSON.stringify({
                ...payload,
                number: formatted
            })
        });
    }

    /**
     * Send bulk text messages
     */
    async sendBulkText(numbers: string[], text: string, delay: number = 2000, instanceName?: string): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const number of numbers) {
            try {
                await this.sendText(number, text, instanceName);
                sent++;
                if (delay > 0) await new Promise(r => setTimeout(r, delay));
            } catch (error) {
                console.error(`[Evolution API] Failed to send to ${number}:`, error);
                failed++;
            }
        }

        return { sent, failed };
    }

    // ==========================================
    // UTILS & HELPERS
    // ==========================================

    /**
     * Format phone numbers (BR standard)
     * e.g. 11999998888 -> 5511999998888
     */
    public formatPhoneNumber(phone: string): string {
        if (!phone) return '';

        // Remove non-digits
        let clean = phone.replace(/\D/g, '');

        // Already has country code
        if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
            return clean;
        }

        // Add BR country code
        if (clean.length === 10 || clean.length === 11) {
            return `55${clean}`;
        }

        return clean;
    }

    /**
     * Format phone number to WhatsApp JID
     */
    public formatWhatsAppNumber(phone: string): string {
        const formatted = this.formatPhoneNumber(phone);
        if (!formatted) return '';
        return `${formatted}@s.whatsapp.net`;
    }

    private getMessageType(message: any): Message['type'] {
        if (!message) return 'text';
        if (message.imageMessage) return 'image';
        if (message.videoMessage) return 'video';
        if (message.audioMessage) return 'audio';
        if (message.documentMessage) return 'document';
        return 'text';
    }

    private extractMessageContent(msg: any): string {
        if (!msg) return '';

        // Handle when msg.message is the actual message object
        const m = msg.message || msg;

        // 1. Texto direto (conversation)
        if (m.conversation) return m.conversation;

        // 2. Texto estendido (com emoji, formatação, ou resposta)
        if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;

        // 3. Legendas de mídia
        if (m.imageMessage?.caption) return `📷 ${m.imageMessage.caption}`;
        if (m.videoMessage?.caption) return `🎥 ${m.videoMessage.caption}`;

        // 4. Tipos de mídia sem legenda
        if (m.imageMessage) return '📷 Imagem';
        if (m.videoMessage) return '🎥 Vídeo';
        if (m.audioMessage) return '🎵 Áudio';
        if (m.documentMessage) return `📎 ${m.documentMessage.fileName || 'Documento'}`;
        if (m.stickerMessage) return '🏷️ Sticker';
        if (m.contactMessage) return '👤 Contato';
        if (m.locationMessage) return '📍 Localização';

        // 5. Se é string direta (fallback)
        if (typeof m === 'string') return m;

        return '';
    }

    setInstance(name: string) {
        this.instanceName = name;
        localStorage.setItem('fitpro_active_instance', name);
        console.log('[Evolution API] Instância ativa definida:', name);
    }

    getInstance() {
        return this.instanceName;
    }

    getActiveInstance(): string | null {
        const saved = localStorage.getItem('fitpro_active_instance');
        if (saved) {
            this.instanceName = saved;
        }
        return saved;
    }
}

export const evolutionService = new EvolutionService();
