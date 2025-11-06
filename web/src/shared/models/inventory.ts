export type InventoryItem = {
    id?: string;
    item: string;
    quantity: number;
    quality: string;
    lastUpdated?: string;
}

export type InventoryLoss = {
    id?: string;
    item: string;
    quality: string;
    quantity: number;
    timestamp: string;
};

export interface NewInventoryItem {
    item: string;
    quantity: number;
    quality: string;
}