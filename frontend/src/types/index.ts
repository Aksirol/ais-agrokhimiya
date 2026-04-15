export interface Chemical {
  id: number;
  name: string;
}

export interface OrderItem {
  id: number;
  chemical_id: number;
  quantity: string; // Decimal приходить як рядок
  price_per_unit: string;
  chemical: Chemical;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface PurchaseOrder {
  id: number;
  order_date: string;
  total_amount: string;
  status: string;
  supplier: Supplier;
  orderItems: OrderItem[];
}

export interface Warehouse {
  id: number;
  name: string;
  zone: string | null;
}

export interface Inventory {
  id: number;
  chemical_id: number;
  warehouse_id: number;
  quantity: string;
  min_threshold: string;
  last_updated: string;
  chemical: Chemical;
  warehouse: Warehouse;
}