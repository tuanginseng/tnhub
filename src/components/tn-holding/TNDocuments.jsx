import React, { useState, useRef } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import {
  FolderGit2, FileText, Link2, Upload, Plus, Trash2,
  ExternalLink, Download, X, File, Image, FileSpreadsheet, Loader2
} from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleDateString('vi-VN');
};

const getFileIcon = (name = '', type) => {
  if (type === 'link') return <Link2 size={28} className="text-blue-500" />;
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return <Image size={28} className="text-emerald-500" />;
  if (['xlsx', 'xls', 'csv'].includes(ext))
    return <FileSpreadsheet size={28} className="text-green-600" />;
  if (['pdf'].includes(ext))
    return <FileText size={28} className="text-red-500" />;
  return <File size={28} className="text-slate-500" />;
};

const getExtBadge = (name = '', type) => {
  if (type === 'link') return { label: 'LINK', color: 'bg-blue-500' };
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
  const colors = {
    PDF: 'bg-red-500', PNG: 'bg-emerald-500', JPG: 'bg-emerald-500',
    JPEG: 'bg-emerald-500', XLSX: 'bg-green-600', XLS: 'bg-green-600',
    CSV: 'bg-teal-500', DOCX: 'bg-blue-600', DOC: 'bg-blue-600',
    ZIP: 'bg-amber-500', RAR: 'bg-amber-500',
  };
  return { label: ext, color: colors[ext] || 'bg-slate-500' };
};

const TNDocuments = () => {
  const { documents, currentUser, users, apiAddDocLink, apiUploadDocFile, apiDeleteDoc } = useTN();

  // Mode: 'file' | 'link'
  const [addMode, setAddMode] = useState(null); // null = đóng panel
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'file' | 'link'
  const fileInputRef = useRef();

  const isAdmin = currentUser.role === 'admin';

  const displayDocs = filter === 'all' ? documents : documents.filter(d => d.type === filter);

  const [submitStatus, setSubmitStatus] = useState(''); // '' | 'loading' | 'ok' | error msg

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    let url = linkUrl.trim();
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;
    setSubmitStatus('loading');
    const result = await apiAddDocLink({ name: linkName || url, description: linkDesc, url, uploadedBy: currentUser.id });
    if (result?.error) {
      setSubmitStatus(result.error.message || 'Lỗi không xác định');
      return;
    }
    setSubmitStatus('ok');
    setLinkName(''); setLinkUrl(''); setLinkDesc('');
    setTimeout(() => { setAddMode(null); setSubmitStatus(''); }, 800);
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Đang tải ${files[i].name} (${i + 1}/${files.length})...`);
      const result = await apiUploadDocFile(files[i], currentUser.id);
      if (result?.error) {
        alert(`Lỗi khi tải ${files[i].name}: ${result.error.message}`);
      }
    }
    setUploading(false);
    setUploadProgress('');
    setAddMode(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (doc) => {
    if (!isAdmin && doc.uploadedBy !== currentUser.id) {
      return alert('⛔ Bạn không có quyền xóa tài liệu này!');
    }
    if (window.confirm(`Xóa "${doc.name}"?`)) {
      apiDeleteDoc(doc);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <FolderGit2 className="text-blue-600" size={32} /> Kho Tài Liệu
          </h1>
          <p className="text-slate-500 mt-1">Lưu trữ tệp và liên kết tài liệu nội bộ của agency</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddMode(addMode === 'file' ? null : 'file')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${addMode === 'file' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}
          >
            <Upload size={16} /> Tải tệp lên
          </button>
          <button
            onClick={() => setAddMode(addMode === 'link' ? null : 'link')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${addMode === 'link' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:text-purple-600'}`}
          >
            <Link2 size={16} /> Thêm Link
          </button>
        </div>
      </div>

      {/* Add File Panel */}
      {addMode === 'file' && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-blue-600" /> Tải tệp lên kho</h3>
            <button onClick={() => setAddMode(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-semibold text-slate-600">{uploadProgress}</p>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Upload className="mx-auto text-slate-400 mb-3" size={36} />
              <p className="text-sm font-semibold text-slate-600">Kéo thả tệp vào đây hoặc <span className="text-blue-600 underline">chọn tệp</span></p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ mọi định dạng: PDF, DOCX, XLSX, PNG, JPG, ZIP...</p>
            </div>
          )}
        </div>
      )}

      {/* Add Link Panel */}
      {addMode === 'link' && (
        <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Link2 size={18} className="text-purple-600" /> Thêm liên kết tài liệu</h3>
            <button onClick={() => setAddMode(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleAddLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Đường link URL <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="https://docs.google.com/..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên hiển thị</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ví dụ: Hợp đồng mẫu Agency 2024..."
                value={linkName}
                onChange={e => setLinkName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Mô tả (tuỳ chọn)</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                placeholder="Mô tả ngắn về nội dung tài liệu..."
                rows={2}
                value={linkDesc}
                onChange={e => setLinkDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {/* Error message */}
              {submitStatus && submitStatus !== 'loading' && submitStatus !== 'ok' && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-semibold">
                  ⛔ Lỗi: {submitStatus}
                  {submitStatus.includes('does not exist') && (
                    <span className="block mt-1 font-normal text-red-500">📋 Bảng tn_documents chưa được tạo. Vui lòng chạy SQL trong Supabase!</span>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setAddMode(null); setSubmitStatus(''); }} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Hủy</button>
                <button
                  type="submit"
                  disabled={submitStatus === 'loading' || submitStatus === 'ok'}
                  className={`px-5 py-2 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${submitStatus === 'ok' ? 'bg-emerald-500' : 'bg-purple-600 hover:bg-purple-700'} disabled:opacity-70`}
                >
                  {submitStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
                  {submitStatus === 'ok' && '✅'}
                  {!submitStatus && <Plus size={15} />}
                  {submitStatus === 'loading' ? 'Đang lưu...' : submitStatus === 'ok' ? 'Đã thêm!' : 'Thêm Link'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {[
          { key: 'all', label: `Tất cả (${documents.length})` },
          { key: 'file', label: `📄 Tệp (${documents.filter(d => d.type === 'file').length})` },
          { key: 'link', label: `🔗 Link (${documents.filter(d => d.type === 'link').length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 -mb-[1px] ${filter === tab.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {displayDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderGit2 className="text-slate-300 mb-4" size={48} />
          <p className="text-slate-400 font-semibold">Chưa có tài liệu nào</p>
          <p className="text-slate-400 text-sm mt-1">Nhấn "Tải tệp lên" hoặc "Thêm Link" để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayDocs.map(doc => {
            const uploader = users.find(u => u.id === doc.uploadedBy);
            const badge = getExtBadge(doc.name, doc.type);
            const canDelete = isAdmin || doc.uploadedBy === currentUser.id;

            return (
              <div
                key={doc.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
              >
                {/* Top section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.name, doc.type)}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded text-white uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug mb-1">
                    {doc.name}
                  </h3>

                  {doc.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{doc.description}</p>
                  )}

                  <div className="mt-auto pt-3 flex flex-col gap-1 text-[11px] text-slate-400">
                    {doc.fileSize && <span>{formatBytes(doc.fileSize)}</span>}
                    <span>{formatDate(doc.createdAt)} • {uploader?.name || 'Ẩn danh'}</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2 bg-slate-50/60">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-lg transition-colors"
                  >
                    {doc.type === 'link' ? <><ExternalLink size={12} /> Mở Link</> : <><Download size={12} /> Tải xuống</>}
                  </a>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TNDocuments;
