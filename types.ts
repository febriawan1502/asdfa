
export type InboundSource = 'Kontrak UID' | 'Kontrak UP3' | 'STO' | 'Lain-Lain';
export type VehicleType = 'Pickup' | 'Minibus' | 'Truck' | 'Motor' | 'Lainnya';

export interface Material {
  id: string;
  material_number: string;
  material_name: string;
  unit: string;
  current_stock: number;
}

export interface InboundTransaction {
  id: string;
  date: string;
  contract_number: string;
  source: InboundSource;
  material_id: string;
  volume_in: number;
}

export interface OutboundTransaction {
  id: string;
  date: string;
  request_number: string;
  tug9_number?: string;
  k7_number: string;
  purpose: string;
  recipient_name: string;
  reservation_number: string;
  material_id: string;
  volume_out: number;
  driver_name?: string;
  vehicle_type?: VehicleType;
  license_plate?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'staff';
}

export interface TransactionHistoryItem {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  reference: string; 
  info: string; 
  volume: number;
}
