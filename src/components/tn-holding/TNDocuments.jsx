import React from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { FolderGit2, FileText, Download, Calendar } from 'lucide-react';

const TNDocuments = () => {
  const { documents, users } = useTN();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <FolderGit2 className="text-blue-600" size={32}/> Kho Tài Liệu
          </h1>
          <p className="text-slate-500 mt-1">Lưu trữ Hợp đồng scan, Chính sách nội bộ và Biểu mẫu Agency</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents.map(doc => {
             const user = users.find(u => u.id === doc.uploadedBy);
             
             return (
               <div key={doc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col items-center text-center">
                  
                  {/* Extension badge */}
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">
                     PDF
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                     <FileText size={32} />
                  </div>
                  
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 w-full mb-2">
                     {doc.name}
                  </h3>
                  
                  <div className="text-xs text-slate-500 font-medium mb-1">
                     Thư mục: <span className="text-blue-600">{doc.customer}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-auto pt-4 w-full justify-center">
                     <Calendar size={12}/> {doc.date} | Bởi: {user?.name || 'Vô danh'}
                  </div>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button className="bg-white text-slate-900 h-10 px-4 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Download size={16}/> Tải xuống
                     </button>
                  </div>
               </div>
             )
          })}
          
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors min-h-[220px]">
             <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-3">
                +
             </div>
             <p className="text-slate-500 font-semibold text-sm">Tải lên tệp mới</p>
          </div>
       </div>
    </div>
  );
};

export default TNDocuments;
