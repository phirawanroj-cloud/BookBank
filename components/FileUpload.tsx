import React, { ChangeEvent } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onUpload: (content: string) => void;
  fileName?: string;
  color: 'blue' | 'indigo';
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

  const colorClasses = color === 'blue' 
    ? 'border-blue-300 hover:bg-blue-50 text-blue-600' 
    : 'border-indigo-300 hover:bg-indigo-50 text-indigo-600';

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${colorClasses} ${fileName ? 'bg-opacity-50 bg-gray-50 border-solid' : ''}`}>
        <input 
          type="file" 
          accept=".csv" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        {fileName ? (
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8" />
            <span className="font-semibold">{fileName}</span>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">คลิกเพื่ออัปโหลด CSV</p>
            <p className="text-xs opacity-60 mt-1">รองรับไฟล์ .csv เท่านั้น</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;