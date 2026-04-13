import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTN } from '../../context/TNHoldingContext';
import { MoreHorizontal, Plus, X, Phone, Briefcase, FileText } from 'lucide-react';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ';

const COLUMNS = [
  { id: 'Tiếp cận', name: 'Tiếp Cận', color: 'bg-stone-100 text-stone-700 border-b-stone-300' },
  { id: 'Báo giá', name: 'Báo Giá', color: 'bg-blue-100 text-blue-700 border-b-blue-300' },
  { id: 'Đàm phán', name: 'Đàm Phán', color: 'bg-amber-100 text-amber-700 border-b-amber-300' },
  { id: 'Chốt Deal', name: 'Chốt Deal', color: 'bg-emerald-100 text-emerald-700 border-b-emerald-300' },
  { id: 'Chăm sóc', name: 'Chăm Sóc', color: 'bg-purple-100 text-purple-700 border-b-purple-300' },
];

const SERVICES_LIST = [
  'Vận hành shop',
  'Booking KOC',
  'Bán Tick xanh',
  'Bán tài khoản hoàn tín',
  'Video/Livestream',
  'Chạy Ads',
  'Khác'
];

const TNCRM = () => {
  const { customers, apiAddCustomer, apiUpdateCustomerBatch, currentUser, users } = useTN();
  
  const isAdmin = currentUser.role === 'admin';
  const saleUsers = users.filter(u => u.role !== 'admin');
  
  const [selectedUserId, setSelectedUserId] = useState(isAdmin ? saleUsers[0].id : currentUser.id);

  const userCustomers = customers.filter(c => c.userId === selectedUserId);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mName, setMName] = useState('');
  const [mIndustry, setMIndustry] = useState('');
  const [mService, setMService] = useState(SERVICES_LIST[0]);
  const [mLeadStatus, setMLeadStatus] = useState('pending');
  const [mPhone, setMPhone] = useState('');
  const [mNote, setMNote] = useState('');

  const resetModal = () => {
     setMName(''); setMIndustry(''); setMService(SERVICES_LIST[0]); 
     setMLeadStatus('pending'); setMPhone(''); setMNote('');
     setIsModalOpen(false);
  };

  const submitCustomer = (e) => {
     e.preventDefault();
     if (!mName) return alert("Vui lòng nhập Tên Khách Hàng");

     const newCust = {
        id: `c${Date.now()}`,
        name: mName,
        industry: mIndustry,
        service: mService,
        lead_status: mLeadStatus,
        phone: mPhone,
        note: mNote,
        value: 10000000, // Giá trị ảo mặc định
        status: 'Tiếp cận',
        userId: selectedUserId 
     };
     
     apiAddCustomer(newCust);
     resetModal();
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const draggedCustomer = customers.find(c => c.id === result.draggableId);
    if (!draggedCustomer) return;

    const newCustomers = customers.map(c => {
       if (c.id === draggedCustomer.id) return { ...c, status: destination.droppableId };
       return c;
    });
    apiUpdateCustomerBatch(newCustomers);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 pb-10 relative">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">Phễu CRM</h1>
           <p className="text-slate-500 mt-1">Board kéo thả khách hàng. {isAdmin ? 'Giám đốc đang xem Pipeline của Staff.' : 'Chỉ bảo mật tệp khách của chính bạn.'}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md">
          <Plus size={18} /> Thêm Khách Hàng
        </button>
      </header>

      {/* THANH TOP TABS CHO ADMIN */}
      {isAdmin && (
         <div className="flex overflow-x-auto gap-3 mb-6 bg-slate-100/50 p-3 rounded-2xl border border-slate-200">
            {saleUsers.map(u => (
               <button 
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`px-5 py-3 rounded-xl text-sm font-bold flex flex-col items-start whitespace-nowrap transition-all duration-300 ${
                     selectedUserId === u.id 
                     ? 'bg-white shadow-sm border border-slate-200 text-blue-600 scale-[1.02]' 
                     : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent hover:border-slate-200 border cursor-pointer'
                  }`}
               >
                  <span>{u.name}</span>
                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded mt-1 w-max tracking-wide ${selectedUserId === u.id ? 'bg-blue-100' : 'bg-slate-200'}`}>{u.role}</span>
               </button>
            ))}
         </div>
      )}

      {/* LƯỚI KANBAN PHỄU */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max items-start">
             {COLUMNS.map(col => {
                const columnCustomers = userCustomers.filter(c => c.status === col.id);
                const colTotal = columnCustomers.reduce((acc, c) => acc + c.value, 0);

                return (
                  <div key={col.id} className="w-[320px] shrink-0 bg-slate-50 rounded-2xl flex flex-col max-h-full border border-slate-200 overflow-hidden shadow-sm">
                     <div className={`p-4 bg-white flex flex-col gap-2 border-b-2 ${col.color.split(' ')[2]}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-xs uppercase font-black px-2 py-1 rounded w-max ${col.color}`}>
                               {col.name} ({columnCustomers.length})
                            </h3>
                            <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal size={16} /></button>
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex justify-between px-1 mt-1">
                           <span>TỔNG KHÁCH (CHỐT DEAL):</span>
                           <span className="text-slate-800">{formatMoney(colTotal)}</span>
                        </div>
                     </div>

                     <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                           <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}>
                              {columnCustomers.map((customer, index) => {
                                 
                                 // Render Lead Status Badge
                                 let lsBadge = '';
                                 if(customer.lead_status === 'done') lsBadge = <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest border border-emerald-200">Done</span>;
                                 else if(customer.lead_status === 'fail') lsBadge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest border border-red-200">Fail</span>;
                                 else lsBadge = <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-widest border border-amber-200">Pending</span>;

                                 return (
                                 <Draggable key={customer.id} draggableId={customer.id} index={index}>
                                    {(provided, snapshot) => (
                                       <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`bg-white p-4 rounded-xl shadow-sm border ${snapshot.isDragging ? 'border-blue-400 shadow-xl rotate-3 scale-105 z-50' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'} transition-all cursor-grab active:cursor-grabbing`}
                                       >
                                          <div className="flex justify-between items-start mb-2">
                                             <h4 className="font-bold text-slate-800 text-[15px] leading-tight">{customer.name}</h4>
                                             {lsBadge}
                                          </div>
                                          
                                          <div className="flex flex-wrap gap-1 mb-3">
                                             <div className="text-[10px] font-bold text-blue-600 bg-blue-50 w-max px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                                                <Briefcase size={12}/> {customer.service}
                                             </div>
                                             {customer.industry && (
                                                <div className="text-[10px] font-bold text-slate-600 bg-slate-100 w-max px-2 py-1 rounded border border-slate-200">
                                                   {customer.industry}
                                                </div>
                                             )}
                                          </div>

                                          <div className="text-xs text-slate-500 font-medium flex flex-col gap-1 border-t border-slate-100 pt-2 mt-1">
                                             {customer.phone && <div className="flex items-center gap-1.5"><Phone size={12}/> {customer.phone}</div>}
                                             {customer.note && <div className="flex items-start gap-1.5 line-clamp-2" title={customer.note}><FileText size={12} className="mt-0.5 shrink-0"/> <span className="italic">{customer.note}</span></div>}
                                          </div>
                                       </div>
                                    )}
                                 </Draggable>
                              )})}
                              {provided.placeholder}
                           </div>
                        )}
                     </Droppable>
                  </div>
                )
             })}
          </div>
        </DragDropContext>
      </div>

      {/* POP-UP MODAL GIAO DIỆN THÊM KHÁCH HÀNG */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <Plus size={20} className="text-blue-600"/> Thêm Khách Hàng (Tạo Lead)
                  </h2>
                  <button onClick={resetModal} className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full border border-slate-200 shadow-sm transition-colors">
                     <X size={20}/>
                  </button>
               </div>
               
               <form onSubmit={submitCustomer} className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Tên khách hàng / Shop <span className="text-red-500">*</span></label>
                        <input type="text" value={mName} onChange={e=>setMName(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Nhập tên khách hàng..." />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Ngành hàng</label>
                        <input type="text" value={mIndustry} onChange={e=>setMIndustry(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Thời trang, F&B..." />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Số điện thoại</label>
                        <input type="tel" value={mPhone} onChange={e=>setMPhone(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0988..." />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Dịch vụ quan tâm</label>
                        <select value={mService} onChange={e=>setMService(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                           {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Tình trạng Chốt (Lead Status)</label>
                        <select value={mLeadStatus} onChange={e=>setMLeadStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                           <option value="pending">Chờ xử lý (Pending)</option>
                           <option value="done">Thành công (Done)</option>
                           <option value="fail">Thất bại (Fail)</option>
                        </select>
                     </div>

                     <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Ghi chú thêm</label>
                        <textarea value={mNote} onChange={e=>setMNote(e.target.value)} rows="3" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Nhập tóm tắt trao đổi với khách..."></textarea>
                     </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                     <button type="button" onClick={resetModal} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy</button>
                     <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors">Lưu Khách Hàng</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
export default TNCRM;
