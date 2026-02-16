export type InventoryItem = {
  id?: string;
  item: string;
  quantity: number;
  quality: string;
  unitPrice?: number;
  lastUpdated?: string;
};

export type InventoryLoss = {
  id?: string;
  inventoryId?: string;
  item: string;
  quality: string;
  quantity: number;
  reason?: string;
  notes?: string;
  timestamp: string;
};

export interface NewInventoryItem {
  item: string;
  quantity: number;
  quality: string;
  unitPrice: number;
}
