import React, { ChangeEvent } from 'react';
import { Upload, FileText, Check } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onUpload: (content: string) => void;
  fileName?: string;
  color: 'violet' | 'sky';
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onUpload, fileName, color }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onUpload(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const themeClasses = color === 'violet' 
    ? 'border-violet-300 hover:bg-violet-50 text-violet-600 ring-violet-200' 
    : 'border-sky-300 hover:bg-sky-50 text-sky-600 ring-sky-200';

  const iconColor = color === 'violet' ? 'text-violet-500' : 'text-sky-500';
  const bgActive = color === 'violet' ? 'bg-violet-50' : 'bg-sky-50';

  return (
    <div className="w-full group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">{label}</label>
      <div className={`
        relative border-2 border-dashed rounded-2xl p-8 
        flex flex-col items-center justify-center transition-all duration-200 cursor-pointer 
        hover:border-solid hover:shadow-md hover:ring-4 ${themeClasses}
        ${fileName ? `${bgActive} border-solid` : 'bg-white'}
      `}>
        <input 
          type="file" 
          accept=".csv" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
        />
        {fileName ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className={`w-12 h-12 rounded-full ${color === 'violet' ? 'bg-violet-200 text-violet-700' : 'bg-sky-200 text-sky-700'} flex items-center justify-center mb-3`}>
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-semibold text-gray-900 text-center break-all">{fileName}</span>
            <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3 text-green-500" /> พร้อมใช้งาน
            </span>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <div className={`w-12 h-12 rounded-full ${color === 'violet' ? 'bg-violet-50' : 'bg-sky-50'} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <Upload className={`w-6 h-6 ${iconColor}`} />
            </div>
            <p className="text-base font-semibold">คลิกเพื่ออัปโหลด CSV</p>
            <p className="text-xs opacity-60 mt-1">หรือลากไฟล์มาวางที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;