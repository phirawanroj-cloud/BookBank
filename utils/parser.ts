import { BookRecord, BankRecord } from '../types';

// Helper to parse CSV line handling quotes
const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Clean amount string "2,080.00" -> 2080.00
const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;
  // Remove quotes and commas
  const clean = amountStr.replace(/["',]/g, '');
  return parseFloat(clean) || 0;
};

export const parseBookCSV = (csvContent: string): BookRecord[] => {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const records: BookRecord[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 4) continue;

    records.push({
      id: `book-${i}`,
      document_no: cols[0],
      posting_date: cols[1],
      description: cols[2], // This is the Invoice ID key
      amount: parseAmount(cols[3]),
      raw_amount: cols[3].replace(/"/g, ''),
      raw_date: cols[1]
    });
  }
  return records;
};

export const parseBankCSV = (csvContent: string): BankRecord[] => {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const records: BankRecord[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 10) continue;

    records.push({
      id: `bank-${i}`,
      account_no: cols[0],
      transaction_date: cols[2], // Using transaction_date
      time: cols[3],
      invoice_number: cols[4],
      product: cols[5],
      total_amount: parseAmount(cols[10]), // total_amount column
      raw_amount: cols[10].replace(/"/g, ''),
      raw_date: cols[2],
      merchant_id: cols[13],
      fuel_brand: cols[14]
    });
  }
  return records;
};