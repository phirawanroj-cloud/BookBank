import React, { useState, useMemo } from 'react';
import { BookRecord, BankRecord, ReconciliationResult, Stats, MatchStatus } from './types';
import { parseBookCSV, parseBankCSV } from './utils/parser';
import { reconcileData, calculateStats } from './utils/matcher';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { LayoutDashboard, FileSpreadsheet, ArrowRightLeft, PieChart, RefreshCw, AlertTriangle } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const App: React.FC = () => {
  const [bookData, setBookData] = useState<BookRecord[]>([]);
  const [bankData, setBankData] = useState<BankRecord[]>([]);
  const [results, setResults] = useState<ReconciliationResult[]>([]);
  const [step, setStep] = useState<1 | 2>(1); // 1: Upload, 2: Results

  const handleBookUpload = (content: string) => {
    const data = parseBookCSV(content);
    setBookData(data);
  };

  const handleBankUpload = (content: string) => {
    const data = parseBankCSV(content);
    setBankData(data);
  };

  const handleProcess = () => {
    if (bookData.length > 0 && bankData.length > 0) {
      const reconResults = reconcileData(bookData, bankData);
      setResults(reconResults);
      setStep(2);
    }
  };

  const handleReset = () => {
    setBookData([]);
    setBankData([]);
    setResults([]);
    setStep(1);
  };

  const stats: Stats = useMemo(() => calculateStats(results), [results]);

  const chartData = [
    { name: 'Matched', value: stats.matched, color: '#16a34a' },
    { name: 'Exceptions', value: stats.exceptions, color: '#dc2626' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">ReconMaster AI</h1>
                <p className="text-xs text-gray-500">ระบบกระทบยอดข้อมูลทางการเงินอัจฉริยะ</p>
              </div>
            </div>
            {step === 2 && (
              <div className="flex items-center">
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  เริ่มใหม่
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 ? (
          /* STEP 1: UPLOAD */
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900">อัปโหลดไฟล์เพื่อเริ่มกระทบยอด</h2>
              <p className="text-lg text-gray-500">รองรับไฟล์ CSV จากระบบบัญชี (Book) และรายการเดินบัญชี (Bank Statement)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">1</div>
                  <h3 className="text-lg font-semibold text-gray-900">ข้อมูลระบบบัญชี (Book/GL)</h3>
                </div>
                <FileUpload 
                  label="อัปโหลดไฟล์ CSV (Book)" 
                  onUpload={handleBookUpload} 
                  fileName={bookData.length > 0 ? `Loaded ${bookData.length} records` : undefined}
                  color="indigo"
                />
                {bookData.length > 0 && (
                   <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-md text-sm">
                      ✅ พบข้อมูล {bookData.length} รายการ
                   </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                  <h3 className="text-lg font-semibold text-gray-900">ข้อมูลธนาคาร (Bank)</h3>
                </div>
                <FileUpload 
                  label="อัปโหลดไฟล์ CSV (Bank)" 
                  onUpload={handleBankUpload} 
                  fileName={bankData.length > 0 ? `Loaded ${bankData.length} records` : undefined}
                  color="blue"
                />
                 {bankData.length > 0 && (
                   <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-md text-sm">
                      ✅ พบข้อมูล {bankData.length} รายการ
                   </div>
                )}
              </div>
            </div>

            <div className="pt-8 flex justify-center">
              <button
                onClick={handleProcess}
                disabled={bookData.length === 0 || bankData.length === 0}
                className={`w-full md:w-auto px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all transform hover:scale-105 ${
                  bookData.length > 0 && bankData.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                ประมวลผลการกระทบยอด (Reconcile)
              </button>
            </div>
            
            {/* Guide Section */}
            <div className="mt-12 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
               <h4 className="font-semibold text-gray-800 mb-4">วิธีการเตรียมไฟล์ CSV</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div>
                    <strong className="block text-indigo-600 mb-1">Book / GL Format:</strong>
                    <p>document_no, posting_date, description(Invoice ID), amount</p>
                  </div>
                   <div>
                    <strong className="block text-blue-600 mb-1">Bank Statement Format:</strong>
                    <p>..., transaction_date, ..., invoice_number, ..., total_amount, ...</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* STEP 2: DASHBOARD & RESULTS */
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ความสำเร็จ</p>
                    <p className="text-2xl font-bold text-gray-900">{((stats.matched / stats.total) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <PieChart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(stats.matched / stats.total) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">จับคู่สมบูรณ์</p>
                    <p className="text-2xl font-bold text-green-600">{stats.matched}</p>
                    <p className="text-xs text-gray-400">รายการ</p>
                  </div>
                   <div className="bg-green-50 p-2 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ต้องตรวจสอบ</p>
                    <p className="text-2xl font-bold text-red-600">{stats.exceptions}</p>
                    <p className="text-xs text-gray-400">รายการที่ข้อมูลไม่ตรงกัน</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ผลต่างยอดเงิน (Variance)</p>
                    <p className={`text-2xl font-bold ${stats.variance === 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {stats.variance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Book Amount - Bank Amount</p>
                  </div>
                   <div className="bg-gray-50 p-2 rounded-lg">
                    <ArrowRightLeft className="w-6 h-6 text-gray-600" />
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
                   <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนผลการกระทบยอด</h3>
                   <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </RePieChart>
                    </ResponsiveContainer>
                   </div>
                   <div className="text-center text-sm text-gray-500 mt-2">
                      จากทั้งหมด {stats.total} รายการ
                   </div>
                </div>

                {/* Main Table Section */}
                <div className="lg:col-span-2">
                    <ResultsTable data={results} />
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;