export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  createdAt: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address: string;
}
