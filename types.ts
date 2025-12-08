export enum StockType {
  CERAMIC = 'Ceramic',
  PORCELAIN = 'Porcelain',
  MARBLE = 'Marble',
  GRANITE = 'Granite',
  MOSAIC = 'Mosaic',
  WOOD_LOOK = 'Wood Look'
}

export interface Tile {
  id: string;
  name: string;
  type: StockType;
  size: string; // e.g., "60x60cm"
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  assignedTo?: string; // ID of the employee managing this customer
  meetingDate?: string; // YYYY-MM-DD
  meetingInfo?: string; // Agenda or purpose of the meeting
  purchasedVolume?: number; // Quantity of tiles purchased (e.g. sqm)
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  username?: string;
  password?: string;
}

export type ViewState = 'DASHBOARD' | 'INVENTORY' | 'CUSTOMERS' | 'EMPLOYEES';