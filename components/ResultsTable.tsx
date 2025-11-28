import React, { useState } from 'react';
import { ReconciliationResult, MatchStatus } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Search, ArrowRight } from 'lucide-react';

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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> สมบูรณ์</span>;
      case MatchStatus.AMOUNT_MISMATCH:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1"/> ยอดเงินไม่ตรง</span>;
      case MatchStatus.DATE_MISMATCH:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1"/> วันที่ไม่ตรง</span>;
      case MatchStatus.UNMATCHED_BOOK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1"/> ไม่พบใน Bank</span>;
      case MatchStatus.UNMATCHED_BANK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><XCircle className="w-3 h-3 mr-1"/> ไม่พบใน Book</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
          >
            ทั้งหมด ({data.length})
          </button>
          <button 
            onClick={() => setFilter('MATCHED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'MATCHED' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
          >
            จับคู่แล้ว ({data.filter(i => i.status === MatchStatus.MATCHED).length})
          </button>
          <button 
            onClick={() => setFilter('EXCEPTIONS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'EXCEPTIONS' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
          >
            ต้องตรวจสอบ ({data.filter(i => i.status !== MatchStatus.MATCHED).length})
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหา Invoice หรือ ยอดเงิน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">สถานะ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-indigo-50 bg-opacity-50 border-l border-r border-indigo-100">
                Book / GL (ระบบบัญชี)
              </th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-blue-50 bg-opacity-50 border-r border-blue-100">
                Bank (รายการเดินบัญชี)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเหตุ</th>
            </tr>
            <tr className="bg-gray-50 border-b border-gray-200">
               <th className="px-6 py-2"></th>
               <th className="px-6 py-2 text-xs text-gray-400 font-normal bg-indigo-50 bg-opacity-30 border-l border-r border-indigo-100">
                 <div className="grid grid-cols-3 gap-2">
                   <span>Date</span>
                   <span>Invoice/Desc</span>
                   <span className="text-right">Amount</span>
                 </div>
               </th>
               <th className="px-6 py-2 text-xs text-gray-400 font-normal bg-blue-50 bg-opacity-30 border-r border-blue-100">
                 <div className="grid grid-cols-3 gap-2">
                   <span>Date</span>
                   <span>Invoice/No</span>
                   <span className="text-right">Amount</span>
                 </div>
               </th>
               <th className="px-6 py-2"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(row.status)}
                </td>
                
                {/* Book Column */}
                <td className={`px-6 py-4 border-l border-r border-indigo-50 ${row.status === MatchStatus.UNMATCHED_BANK ? 'bg-orange-50 bg-opacity-20' : ''}`}>
                  {row.bookRecord ? (
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-gray-600 text-xs">{row.bookRecord.raw_date}</span>
                      <span className="font-medium text-gray-900 truncate" title={row.bookRecord.description}>{row.bookRecord.description}</span>
                      <span className="text-right font-mono font-medium">{row.bookRecord.raw_amount}</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs">- ไม่มีข้อมูล -</div>
                  )}
                </td>

                {/* Bank Column */}
                <td className={`px-6 py-4 border-r border-blue-50 ${row.status === MatchStatus.UNMATCHED_BOOK ? 'bg-gray-50' : ''}`}>
                  {row.bankRecord ? (
                     <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-gray-600 text-xs">{row.bankRecord.raw_date}</span>
                      <span className="font-medium text-gray-900 truncate" title={row.bankRecord.invoice_number}>{row.bankRecord.invoice_number}</span>
                      <span className={`text-right font-mono font-medium ${row.status === MatchStatus.AMOUNT_MISMATCH ? 'text-red-600' : ''}`}>
                        {row.bankRecord.raw_amount}
                      </span>
                    </div>
                  ) : (
                     <div className="text-center text-gray-400 text-xs">- ไม่มีข้อมูล -</div>
                  )}
                </td>

                <td className="px-6 py-4 text-xs text-gray-500">
                  {row.notes.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {row.notes.map((note, idx) => (
                        <li key={idx} className="text-red-600">{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="w-3 h-3"/> ถูกต้อง
                    </span>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>ไม่พบข้อมูลตามเงื่อนไขที่กำหนด</p>
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