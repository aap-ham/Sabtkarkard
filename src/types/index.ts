export interface Employer {
  id: string;
  name: string;
  color: string;
  wage?: number;
  createdAt: Date;
}

export interface WorkDay {
  id: string;
  employerId: string;
  date: string;
  hours: number;
  amount: number;
  overtime?: number;
  description?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  employerId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  description?: string;
  createdAt: Date;
}

export interface ContractWork {
  id: string;
  employerId: string;
  title: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  description?: string;
  status: 'in-progress' | 'completed';
  createdAt: Date;
}
