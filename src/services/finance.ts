import { api } from './api';

export interface FeeInvoice {
  id: string;
  student_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  category_name?: string;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount_paid: number;
  payment_method: string;
  transaction_reference: string;
  status: string;
}

export async function getStudentInvoices(studentId: string): Promise<FeeInvoice[]> {
  return api.get<FeeInvoice[]>(`/finance/student/${studentId}/invoices`);
}

export async function simulatePayment(invoiceId: string, amount: number): Promise<PaymentRecord> {
  return api.post<PaymentRecord>('/finance/pay/simulate', {
    invoice_id: invoiceId,
    amount,
  });
}
