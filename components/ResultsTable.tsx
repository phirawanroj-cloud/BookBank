import React, { useState } from 'react';
import { ReconciliationResult, MatchStatus } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

interface ResultsTableProps {
  data: ReconciliationResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [filter, setFilter] = useState<'ALL' | 'MATCHED' | 'EXCEPTIONS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'MATCHED' ? item.status === MatchStatus.MATCHED :
      item.status !== MatchStatus.MATCHED;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.bookRecord?.description.toLowerCase().includes(searchLower) ||
      item.bankRecord?.invoice_number.toLowerCase().includes(searchLower) ||
      item.bookRecord?.amount.toString().includes(searchLower) ||
      item.bankRecord?.total_amount.toString().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.MATCHED:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"><CheckCircle className="w-3 h-3 mr-1.5"/> สมบูรณ์</span>;
      case MatchStatus.AMOUNT_MISMATCH:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200 shadow-sm"><AlertTriangle className="w-3 h-3 mr-1.5"/> ยอดเงินไม่ตรง</span>;
      case MatchStatus.DATE_MISMATCH:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm"><AlertTriangle className="w-3 h-3 mr-1.5"/> วันที่ไม่ตรง</span>;
      case MatchStatus.UNMATCHED_BOOK:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"><XCircle className="w-3 h-3 mr-1.5"/> ไม่พบใน Bank</span>;
      case MatchStatus.UNMATCHED_BANK:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"><XCircle className="w-3 h-3 mr-1.5"/> ไม่พบใน Book</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-100/80 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${filter === 'ALL' ? 'bg-white text-violet-700' : 'bg-transparent text-gray-500 hover:text-gray-700 shadow-none'}`}
          >
            ทั้งหมด
          </button>
          <button 
            onClick={() => setFilter('MATCHED')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${filter === 'MATCHED' ? 'bg-white text-emerald-600' : 'bg-transparent text-gray-500 hover:text-gray-700 shadow-none'}`}
          >
            สมบูรณ์ ({data.filter(i => i.status === MatchStatus.MATCHED).length})
          </button>
          <button 
            onClick={() => setFilter('EXCEPTIONS')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${filter === 'EXCEPTIONS' ? 'bg-white text-rose-600' : 'bg-transparent text-gray-500 hover:text-gray-700 shadow-none'}`}
          >
            ตรวจสอบ ({data.filter(i => i.status !== MatchStatus.MATCHED).length})
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหา Invoice หรือ ยอดเงิน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36 bg-gray-50/50">สถานะ</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-violet-600 uppercase tracking-wider text-center bg-violet-50/40 border-l border-r border-violet-100">
                Book / GL (ระบบบัญชี)
              </th>
               <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-sky-600 uppercase tracking-wider text-center bg-sky-50/40 border-r border-sky-100">
                Bank (รายการเดินบัญชี)
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">หมายเหตุ</th>
            </tr>
            <tr className="border-b border-gray-200 shadow-sm">
               <th className="px-6 py-2 bg-gray-50/30"></th>
               <th className="px-6 py-2 text-[10px] text-violet-400 font-semibold uppercase bg-violet-50/20 border-l border-r border-violet-100">
                 <div className="grid grid-cols-3 gap-4">
                   <span>Date</span>
                   <span>Invoice / Description</span>
                   <span className="text-right">Amount</span>
                 </div>
               </th>
               <th className="px-6 py-2 text-[10px] text-sky-400 font-semibold uppercase bg-sky-50/20 border-r border-sky-100">
                 <div className="grid grid-cols-3 gap-4">
                   <span>Date</span>
                   <span>Ref / Invoice No.</span>
                   <span className="text-right">Amount</span>
                 </div>
               </th>
               <th className="px-6 py-2 bg-gray-50/30"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(row.status)}
                </td>
                
                {/* Book Column */}
                <td className={`px-6 py-4 border-l border-r border-violet-50 ${row.status === MatchStatus.UNMATCHED_BANK ? 'bg-orange-50/30' : ''}`}>
                  {row.bookRecord ? (
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{row.bookRecord.raw_date}</span>
                      <span className="font-semibold text-gray-800 truncate text-xs sm:text-sm" title={row.bookRecord.description}>{row.bookRecord.description}</span>
                      <span className="text-right font-mono font-bold text-gray-700">{row.bookRecord.raw_amount}</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-300 text-xs py-2 italic">- ไม่มีข้อมูลใน Book -</div>
                  )}
                </td>

                {/* Bank Column */}
                <td className={`px-6 py-4 border-r border-sky-50 ${row.status === MatchStatus.UNMATCHED_BOOK ? 'bg-gray-50/50' : ''}`}>
                  {row.bankRecord ? (
                     <div className="grid grid-cols-3 gap-4 items-center">
                      <span className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{row.bankRecord.raw_date}</span>
                      <span className="font-semibold text-gray-800 truncate text-xs sm:text-sm" title={row.bankRecord.invoice_number}>{row.bankRecord.invoice_number}</span>
                      <span className={`text-right font-mono font-bold ${row.status === MatchStatus.AMOUNT_MISMATCH ? 'text-rose-600 bg-rose-50 px-1 rounded' : 'text-gray-700'}`}>
                        {row.bankRecord.raw_amount}
                      </span>
                    </div>
                  ) : (
                     <div className="text-center text-gray-300 text-xs py-2 italic">- ไม่มีข้อมูลใน Bank -</div>
                  )}
                </td>

                <td className="px-6 py-4 text-xs">
                  {row.notes.length > 0 ? (
                    <div className="space-y-1">
                      {row.notes.map((note, idx) => (
                        <div key={idx} className="text-rose-600 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      <CheckCircle className="w-3 h-3"/> ข้อมูลตรงกัน
                    </span>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-semibold">ไม่พบข้อมูล</h3>
                    <p className="text-gray-500 text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;