export interface BookRecord {
  id: string; // generated unique id
  document_no: string;
  posting_date: string;
  description: string; // Maps to Invoice
  amount: number;
  raw_amount: string;
  raw_date: string;
}

export interface BankRecord {
  id: string; // generated unique id
  account_no: string;
  transaction_date: string;
  time: string;
  invoice_number: string;
  product: string;
  total_amount: number;
  raw_amount: string;
  raw_date: string;
  merchant_id: string;
  fuel_brand: string;
}

export enum MatchStatus {
  MATCHED = 'MATCHED',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  DATE_MISMATCH = 'DATE_MISMATCH',
  UNMATCHED_BOOK = 'UNMATCHED_BOOK',
  UNMATCHED_BANK = 'UNMATCHED_BANK',
}

export interface ReconciliationResult {
  id: string;
  status: MatchStatus;
  bookRecord?: BookRecord;
  bankRecord?: BankRecord;
  score: number; // Confidence score 0-100
  notes: string[];
}

export interface Stats {
  total: number;
  matched: number;
  exceptions: number;
  variance: number;
}