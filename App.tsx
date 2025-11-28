import React, { useState, useMemo } from 'react';
import { BookRecord, BankRecord, ReconciliationResult, Stats, MatchStatus } from './types';
import { parseBookCSV, parseBankCSV } from './utils/parser';
import { reconcileData, calculateStats } from './utils/matcher';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { LayoutDashboard, FileSpreadsheet, ArrowRightLeft, PieChart, RefreshCw, AlertTriangle, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';
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
    { name: 'Matched', value: stats.matched, color: '#10b981' }, // Emerald-500
    { name: 'Exceptions', value: stats.exceptions, color: '#f43f5e' }, // Rose-500
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800">
      {/* Navbar with Gradient */}
      <nav className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm text-white shadow-inner">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ReconMaster AI</h1>
                <p className="text-xs text-blue-100 opacity-90">ระบบกระทบยอดข้อมูลทางการเงินอัจฉริยะ</p>
              </div>
            </div>
            {step === 2 && (
              <div className="flex items-center">
                <button 
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-violet-700 bg-white hover:bg-violet-50 focus:outline-none transition-all duration-200 hover:shadow-md"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  เริ่มใหม่
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {step === 1 ? (
          /* STEP 1: UPLOAD */
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 pb-1">
                เริ่มกระทบยอดข้อมูล
              </h2>
              <p className="text-lg text-slate-600">
                อัปโหลดไฟล์ CSV จากระบบบัญชี (Book) และ รายการเดินบัญชี (Bank) เพื่อตรวจสอบความถูกต้อง
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                 <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <ArrowRightLeft size={20} />
                 </div>
              </div>

              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-violet-100 hover:shadow-md transition-shadow relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shadow-sm ring-4 ring-white">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Book / GL</h3>
                    <p className="text-xs text-gray-500">ข้อมูลจากระบบบัญชีภายใน</p>
                  </div>
                </div>
                <FileUpload 
                  label="อัปโหลดไฟล์ CSV (Book)" 
                  onUpload={handleBookUpload} 
                  fileName={bookData.length > 0 ? `Loaded ${bookData.length} records` : undefined}
                  color="violet"
                />
                {bookData.length > 0 && (
                   <div className="bg-violet-50 text-violet-700 px-4 py-3 rounded-xl text-sm border border-violet-100 flex items-center gap-2 animate-pulse-once">
                      <CheckCircle2 className="w-4 h-4" /> พบข้อมูล {bookData.length} รายการ
                   </div>
                )}
              </div>

              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-sky-100 hover:shadow-md transition-shadow relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold shadow-sm ring-4 ring-white">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Bank Statement</h3>
                    <p className="text-xs text-gray-500">ข้อมูลจากธนาคาร</p>
                  </div>
                </div>
                <FileUpload 
                  label="อัปโหลดไฟล์ CSV (Bank)" 
                  onUpload={handleBankUpload} 
                  fileName={bankData.length > 0 ? `Loaded ${bankData.length} records` : undefined}
                  color="sky"
                />
                 {bankData.length > 0 && (
                   <div className="bg-sky-50 text-sky-700 px-4 py-3 rounded-xl text-sm border border-sky-100 flex items-center gap-2 animate-pulse-once">
                      <CheckCircle2 className="w-4 h-4" /> พบข้อมูล {bankData.length} รายการ
                   </div>
                )}
              </div>
            </div>

            <div className="pt-10 flex justify-center">
              <button
                onClick={handleProcess}
                disabled={bookData.length === 0 || bankData.length === 0}
                className={`w-full md:w-auto px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl active:scale-95 flex items-center gap-3 ${
                  bookData.length > 0 && bankData.length > 0
                    ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white ring-4 ring-violet-50'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ArrowRightLeft className={`${bookData.length > 0 && bankData.length > 0 ? 'animate-pulse' : ''}`} />
                ประมวลผลการกระทบยอด
              </button>
            </div>
            
            {/* Guide Section */}
            <div className="mt-16 bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white shadow-lg">
               <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <FileSpreadsheet className="text-indigo-500" />
                 รูปแบบไฟล์ที่รองรับ
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600">
                  <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                    <strong className="block text-violet-700 mb-2 font-bold text-base">Book Format (GL)</strong>
                    <code className="bg-white px-2 py-1 rounded text-violet-600 block mb-1 font-mono">document_no</code>
                    <code className="bg-white px-2 py-1 rounded text-violet-600 block mb-1 font-mono">posting_date</code>
                    <code className="bg-white px-2 py-1 rounded text-violet-600 block mb-1 font-mono">description (Invoice ID)</code>
                    <code className="bg-white px-2 py-1 rounded text-violet-600 block font-mono">amount</code>
                  </div>
                   <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
                    <strong className="block text-sky-700 mb-2 font-bold text-base">Bank Statement Format</strong>
                    <code className="bg-white px-2 py-1 rounded text-sky-600 block mb-1 font-mono">transaction_date</code>
                    <code className="bg-white px-2 py-1 rounded text-sky-600 block mb-1 font-mono">invoice_number</code>
                    <code className="bg-white px-2 py-1 rounded text-sky-600 block font-mono">total_amount</code>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* STEP 2: DASHBOARD & RESULTS */
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">ความสำเร็จ</p>
                    <p className="text-3xl font-extrabold text-violet-700 mt-1">{((stats.matched / stats.total) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-violet-100 p-3 rounded-2xl text-violet-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${(stats.matched / stats.total) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">จับคู่สมบูรณ์</p>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.matched}</p>
                    <p className="text-xs text-emerald-600/70 font-medium">รายการ</p>
                  </div>
                   <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-rose-100 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">ต้องตรวจสอบ</p>
                    <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.exceptions}</p>
                    <p className="text-xs text-rose-600/70 font-medium">รายการผิดปกติ</p>
                  </div>
                  <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">ผลต่าง (Variance)</p>
                    <p className={`text-3xl font-extrabold mt-1 ${Math.abs(stats.variance) > 0.01 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {stats.variance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Book - Bank</p>
                  </div>
                   <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                    <DollarSign className="w-6 h-6" />
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1 flex flex-col justify-center">
                   <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">สัดส่วนผลการกระทบยอด</h3>
                   <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                      </RePieChart>
                    </ResponsiveContainer>
                   </div>
                   <div className="text-center mt-4">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        จากทั้งหมด {stats.total} รายการ
                      </span>
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