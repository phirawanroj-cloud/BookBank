import { BankRecord, BookRecord, ReconciliationResult, MatchStatus } from '../types';

export const reconcileData = (bookData: BookRecord[], bankData: BankRecord[]): ReconciliationResult[] => {
  const results: ReconciliationResult[] = [];
  const matchedBankIds = new Set<string>();
  const matchedBookIds = new Set<string>();

  // Helper to check date similarity (Exact string match for now, could be enhanced to Date object comparison)
  const isDateMatch = (d1: string, d2: string) => d1 === d2;

  // 1. Primary Pass: Match by Invoice Number (Description vs Invoice Number)
  bookData.forEach(book => {
    // Find bank records with matching invoice number
    const potentialBankMatches = bankData.filter(bank => 
      !matchedBankIds.has(bank.id) && 
      bank.invoice_number === book.description
    );

    if (potentialBankMatches.length > 0) {
      // Prioritize exact amount match
      let bestMatch = potentialBankMatches.find(b => Math.abs(b.total_amount - book.amount) < 0.01);
      
      // If no exact amount match, take the first one (assume amount mismatch)
      if (!bestMatch) {
        bestMatch = potentialBankMatches[0];
      }

      if (bestMatch) {
        matchedBookIds.add(book.id);
        matchedBankIds.add(bestMatch.id);

        let status = MatchStatus.MATCHED;
        const notes: string[] = [];
        let score = 100;

        const amountDiff = Math.abs(book.amount - bestMatch.total_amount);
        if (amountDiff > 0.01) {
          status = MatchStatus.AMOUNT_MISMATCH;
          notes.push(`ผลต่างจำนวนเงิน: ${amountDiff.toFixed(2)}`);
          score -= 40;
        }

        if (!isDateMatch(book.posting_date, bestMatch.transaction_date)) {
           // If unmatched status is currently matched, downgrade it. If it's amount mismatch, keep it.
           if (status === MatchStatus.MATCHED) status = MatchStatus.DATE_MISMATCH;
           notes.push(`วันที่ไม่ตรงกัน: ${book.posting_date} vs ${bestMatch.transaction_date}`);
           score -= 10;
        }

        results.push({
          id: `match-${book.id}-${bestMatch.id}`,
          status,
          bookRecord: book,
          bankRecord: bestMatch,
          score,
          notes
        });
      }
    }
  });

  // 2. Secondary Pass: Orphaned Records
  // Add remaining Book records
  bookData.forEach(book => {
    if (!matchedBookIds.has(book.id)) {
      results.push({
        id: `unmatched-book-${book.id}`,
        status: MatchStatus.UNMATCHED_BOOK,
        bookRecord: book,
        score: 0,
        notes: ['ไม่พบข้อมูลในรายการเดินบัญชี (Bank)']
      });
    }
  });

  // Add remaining Bank records
  bankData.forEach(bank => {
    if (!matchedBankIds.has(bank.id)) {
      results.push({
        id: `unmatched-bank-${bank.id}`,
        status: MatchStatus.UNMATCHED_BANK,
        bankRecord: bank,
        score: 0,
        notes: ['ไม่พบข้อมูลในระบบบัญชี (Book/GL)']
      });
    }
  });

  return results;
};

export const calculateStats = (results: ReconciliationResult[]): any => {
    const total = results.length;
    const matched = results.filter(r => r.status === MatchStatus.MATCHED).length;
    const exceptions = results.filter(r => r.status !== MatchStatus.MATCHED).length;
    const variance = results.reduce((acc, r) => {
        if (r.bookRecord && r.bankRecord) {
            return acc + (r.bookRecord.amount - r.bankRecord.total_amount);
        }
        return acc;
    }, 0);

    return { total, matched, exceptions, variance };
}