export interface EmbedContent {
    title?: string;
    description?: string;
    color?: number;
    url?: string;
    timestamp?: string;
    footer?: { text: string };
    fields?: { name: string; value: string; inline?: boolean }[];
}