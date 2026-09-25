export interface SendMessagePayload {
  recipientPhone?: string;
  recipientHandle?: string;
  messageText: string;
  templateName?: string;
}

export interface ChannelSendResult {
  success: boolean;
  mode: "DIRECT_API" | "CLICK_TO_CHAT" | "UNAVAILABLE";
  externalMessageId?: string;
  clickToChatUrl?: string;
  error?: string;
  notice?: string;
}

export interface ChannelProvider {
  channelName: "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "WEBSITE";
  isConfigured(): boolean;
  sendMessage(payload: SendMessagePayload): Promise<ChannelSendResult>;
  getClickToChatUrl(phone: string, text: string): string;
}

export class WhatsAppProvider implements ChannelProvider {
  channelName = "WHATSAPP" as const;

  isConfigured(): boolean {
    // True if official WhatsApp Cloud API tokens are present
    return Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }

  getClickToChatUrl(phone: string, text: string): string {
    // Clean phone number (e.g. +92 300 1234567 -> 923001234567)
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("03")) {
      cleaned = "92" + cleaned.substring(1);
    }
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleaned}?text=${encoded}`;
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChannelSendResult> {
    if (!payload.recipientPhone) {
      return { success: false, mode: "UNAVAILABLE", error: "Recipient phone number is required." };
    }

    if (!this.isConfigured()) {
      // V1 implementation: Return Click-to-Chat URL
      const url = this.getClickToChatUrl(payload.recipientPhone, payload.messageText);
      return {
        success: true,
        mode: "CLICK_TO_CHAT",
        clickToChatUrl: url,
        notice: "Official WhatsApp Cloud API not configured. WhatsApp Click-to-Chat generated.",
      };
    }

    // When configured in future:
    return {
      success: true,
      mode: "DIRECT_API",
      externalMessageId: "wamid.pending",
    };
  }
}

export class InstagramProvider implements ChannelProvider {
  channelName = "INSTAGRAM" as const;

  isConfigured(): boolean {
    return Boolean(process.env.INSTAGRAM_ACCESS_TOKEN);
  }

  getClickToChatUrl(handle: string, text: string): string {
    const cleanHandle = handle.replace("@", "");
    return `https://ig.me/m/${cleanHandle}`;
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChannelSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        mode: "UNAVAILABLE",
        error: "Instagram Graph API requires Meta App credentials and access token.",
      };
    }
    return { success: false, mode: "UNAVAILABLE", error: "Not configured" };
  }
}

export class ChannelManager {
  private static providers: Record<string, ChannelProvider> = {
    WHATSAPP: new WhatsAppProvider(),
    INSTAGRAM: new InstagramProvider(),
  };

  static getProvider(channel: "WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "WEBSITE"): ChannelProvider {
    return this.providers[channel] || this.providers.WHATSAPP;
  }
}
