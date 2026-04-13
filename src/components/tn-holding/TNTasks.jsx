import React, { useState } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { CheckSquare, AlertTriangle, Plus, Trash2, Pencil, X, Save, User, Users } from 'lucide-react';

const TNTasks = () => {
  const { tasks, customers, currentUser, users, apiAddTask, apiAddTaskBatch, apiUpdateTask, apiDeleteTask, apiEditTask } = useTN();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignMode, setAssignMode] = useState('single'); // 'single' | 'all'
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const isAdmin = currentUser.role === 'admin';
  let displayTasks = isAdmin ? tasks : tasks.filter(t => t.userId === currentUser.id);
  if (isAdmin && selectedUserId !== 'all') {
      displayTasks = displayTasks.filter(t => t.userId === selectedUserId);
  }
  
  const getDaysDiff = (dateStr) => {
      if (!dateStr) return 999;
      const today = new Date();
      today.setHours(0,0,0,0);
      const d = new Date(dateStr);
      d.setHours(0,0,0,0);
      return Math.ceil((d - today) / (1000 * 60 * 60 * 24)); 
  };

  const isUrgentTask = (t) => t.status !== 'Đã xong' && getDaysDiff(t.deadline) <= 1;

  if (isAdmin && showUrgentOnly) {
      displayTasks = displayTasks.filter(isUrgentTask);
  }

  const urgentTasksCount = isAdmin ? tasks.filter(isUrgentTask).length : 0;

  const getTaskStatus = (dLine) => {
     const today = new Date().toISOString().split('T')[0];
     if (dLine < today) return 'Quá hạn';
     if (dLine === today) return 'Hôm nay';
     return 'Sắp tới';
  };

  // Kiểm tra quyền: admin được tất cả, nhân viên chỉ sửa/xóa task mình tạo
  const canModify = (task) => {
    if (isAdmin) return true;
    return task.createdById === currentUser.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    const taskTemplate = {
       title, description, customerId: null, deadline, note,
       status: getTaskStatus(deadline),
       createdById: currentUser.id
    };

    if (isAdmin) {
      if (assignMode === 'all') {
        if (nonAdminUsers.length === 0) return alert('Không có nhân viên nào!');
        await apiAddTaskBatch(taskTemplate, nonAdminUsers);
      } else {
        if (!assigneeId) return alert('Vui lòng chọn nhân sự để giao việc!');
        await apiAddTask({ ...taskTemplate, userId: assigneeId });
      }
    } else {
      await apiAddTask({ ...taskTemplate, userId: currentUser.id });
    }
    
    setTitle('');
    setDescription('');
    setDeadline(new Date().toISOString().split('T')[0]);
    setNote('');
    if (isAdmin) { setAssigneeId(''); setAssignMode('single'); }
  };

  const toggleStatus = (id) => {
     const task = tasks.find(t => t.id === id);
     if (task) {
         apiUpdateTask(id, task.status === 'Đã xong' ? 'Hôm nay' : 'Đã xong');
     }
  };

  const handleDelete = (task) => {
    if (!canModify(task)) {
      alert('⛔ Bạn không có quyền xóa task do Admin giao!');
      return;
    }
    if (window.confirm(`Xóa task "${task.title}"?`)) {
      apiDeleteTask(task.id);
    }
  };

  const startEdit = (task) => {
    if (!canModify(task)) {
      alert('⛔ Bạn không có quyền chỉnh sửa task do Admin giao!');
      return;
    }
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline || '',
      note: task.note || '',
    });
  };

  const handleSaveEdit = (taskId) => {
    apiEditTask(taskId, editForm);
    setEditingTaskId(null);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-500">
       <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             <CheckSquare className="text-blue-600" size={32}/> Quản Lý Công Việc
          </h1>
          <p className="text-slate-500 mt-1">{isAdmin ? 'Giám đốc theo dõi toàn bộ công việc của nhân viên.' : 'To-do list cá nhân.'}</p>
       </header>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
             <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 p-6 bg-slate-50">
                <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                   <Plus size={16}/> Lên Task Mới
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                      <input 
                        type="text" 
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                        placeholder="Tên công việc (Bắt buộc)..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                   </div>
                   
                   <div>
                      <textarea 
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Mô tả công việc chi tiết..."
                        rows="2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                   </div>
                   
                   {isAdmin && (
                       <div className="space-y-2">
                         {/* Toggle mode */}
                         <div className="flex gap-1.5 p-1 bg-slate-200 rounded-lg">
                           <button
                             type="button"
                             onClick={() => setAssignMode('single')}
                             className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                               assignMode === 'single'
                                 ? 'bg-white text-blue-700 shadow-sm'
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                           >
                             <User size={13}/> Một nhân viên
                           </button>
                           <button
                             type="button"
                             onClick={() => setAssignMode('all')}
                             className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                               assignMode === 'all'
                                 ? 'bg-white text-purple-700 shadow-sm'
                                 : 'text-slate-500 hover:text-slate-700'
                             }`}
                           >
                             <Users size={13}/> Tất cả
                           </button>
                         </div>

                         {/* Conditional content */}
                         {assignMode === 'single' ? (
                           <select
                             className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-purple-50 text-purple-900 font-semibold"
                             value={assigneeId}
                             onChange={(e) => setAssigneeId(e.target.value)}
                             required
                           >
                             <option value="">-- Chọn nhân viên --</option>
                             {users.filter(u => u.role !== 'admin').map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                             ))}
                           </select>
                         ) : (
                           <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800 font-semibold">
                             <Users size={14} className="text-purple-500 flex-shrink-0"/>
                             Giao cho <strong className="mx-1">{users.filter(u => u.role !== 'admin').length} nhân viên</strong> cùng lúc
                           </div>
                         )}
                       </div>
                   )}

                   <div>
                      <h3 className="text-xs font-semibold text-slate-500 mb-1">Hạn Giao (Deadline)</h3>
                      <input 
                        type="date"
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />
                   </div>
                   
                   <div>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-yellow-50 resize-none placeholder:text-yellow-600/50"
                        placeholder="Ghi chú thêm (Note)..."
                        rows="2"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                   </div>

                   <div className="pt-2">
                      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                         {isAdmin && assignMode === 'all'
                           ? <><Users size={15}/> Giao cho {users.filter(u => u.role !== 'admin').length} nhân viên</>
                           : 'Thêm Task'
                         }
                      </button>
                   </div>
                 </form>
             </div>

          <div className="p-6 w-full md:w-2/3">
             <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Danh sách cần làm</h2>
             
             {isAdmin && urgentTasksCount > 0 && (
                 <div 
                    onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                    className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm cursor-pointer transition-colors ${showUrgentOnly ? 'bg-red-600 text-white border-red-700' : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'} animate-pulse`}
                 >
                    <AlertTriangle className={showUrgentOnly ? 'text-white' : 'text-rose-600'} size={20}/>
                    <span className="text-sm font-semibold">
                        Sếp lùa quân khẩn trương! Có {urgentTasksCount} task còn từ 1 ngày trở xuống là đến deadline! 
                        <span className="ml-1 text-xs font-normal italic">
                            ({showUrgentOnly ? 'Click để bỏ lọc' : 'Click để xem tất cả'})
                        </span>
                    </span>
                 </div>
             )}

             {isAdmin && (
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2" style={{ scrollbarWidth: 'none' }}>
                    <button 
                        onClick={() => setSelectedUserId('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${selectedUserId === 'all' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                        Tất Cả Sales
                    </button>
                    {users.filter(u => u.role !== 'admin').map(u => (
                        <button 
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border relative ${selectedUserId === u.id ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            {u.name}
                        </button>
                    ))}
                </div>
             )}
             
             {displayTasks.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                   <p className="text-slate-500 text-sm">Chưa có công việc nào!</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                   {displayTasks.map(task => {
                      const u = users.find(x => x.id === task.userId);
                      const isEditing = editingTaskId === task.id;
                      const canEdit = canModify(task);
                      
                      let badge = '';
                      if (task.status === 'Quá hạn') badge = 'bg-red-100 text-red-700 border-red-200';
                      else if (task.status === 'Hôm nay') badge = 'bg-amber-100 text-amber-700 border-amber-200';
                      else if (task.status === 'Sắp tới') badge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      else if (task.status === 'Đã xong') badge = 'bg-slate-100 text-slate-400 border-slate-200';

                      return (
                         <div key={task.id} className={`flex flex-col gap-3 p-4 rounded-xl border transition-all
                            ${task.status === 'Đã xong' ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:shadow-sm hover:border-blue-300'}`}>
                            
                            {isEditing ? (
                              /* ---- CHẾ ĐỘ EDIT ---- */
                              <div className="flex flex-col gap-2">
                                <input
                                  className="w-full border border-blue-400 rounded-lg p-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={editForm.title}
                                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                />
                                <textarea
                                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-600 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                  rows={2}
                                  placeholder="Mô tả..."
                                  value={editForm.description}
                                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                />
                                <input
                                  type="date"
                                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                  value={editForm.deadline}
                                  onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                                />
                                <textarea
                                  className="w-full border border-yellow-300 bg-yellow-50 rounded-lg p-2 text-xs resize-none focus:ring-2 focus:ring-yellow-400 outline-none"
                                  rows={2}
                                  placeholder="Note..."
                                  value={editForm.note}
                                  onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                                />
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() => handleSaveEdit(task.id)}
                                    className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                                  >
                                    <Save size={13}/> Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-1"
                                  >
                                    <X size={13}/> Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ---- CHẾ ĐỘ XEM ---- */
                              <>
                                <div className="flex items-start gap-3">
                                   <button 
                                      onClick={() => { if(!isAdmin) toggleStatus(task.id) }}
                                      disabled={isAdmin}
                                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors
                                         ${task.status === 'Đã xong' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                                   >
                                      ✓
                                   </button>
                                   
                                   <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                         <h3 className={`font-bold text-sm truncate ${task.status === 'Đã xong' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                            {task.title}
                                         </h3>
                                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${badge}`}>
                                            {task.status}
                                         </span>
                                      </div>
                                      
                                      {task.description && (
                                          <div className="text-xs text-slate-600 mb-2 mt-1 line-clamp-2">
                                              {task.description}
                                          </div>
                                      )}
                                      
                                      <div className="flex items-center gap-2 flex-wrap mb-2">
                                         {task.deadline && (
                                             <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                                                ⏳ {task.deadline}
                                             </span>
                                         )}
                                         {isAdmin && u && (
                                            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1 border border-purple-100">
                                               Sale: {u.name}
                                            </span>
                                         )}
                                         {/* Badge "Admin giao" cho nhân viên */}
                                         {!isAdmin && task.createdById !== currentUser.id && (
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                               Admin giao
                                            </span>
                                         )}
                                      </div>
                                      
                                      {task.note && (
                                          <div className="text-[11px] bg-yellow-50/50 text-yellow-800 p-2 rounded border border-yellow-200/50 mt-2">
                                              <span className="font-bold">Note:</span> {task.note}
                                          </div>
                                      )}
                                   </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 justify-end border-t border-slate-100 pt-2 mt-1">
                                  <button
                                    onClick={() => startEdit(task)}
                                    title={canEdit ? 'Sửa task' : 'Không có quyền sửa task Admin giao'}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                                      ${canEdit 
                                        ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100' 
                                        : 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                  >
                                    <Pencil size={12}/> Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDelete(task)}
                                    title={canEdit ? 'Xóa task' : 'Không có quyền xóa task Admin giao'}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                                      ${canEdit 
                                        ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' 
                                        : 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                  >
                                    <Trash2 size={12}/> Xóa
                                  </button>
                                </div>
                              </>
                            )}
                         </div>
                      )
                   })}
                </div>
             )}
          </div>

       </div>
    </div>
  );
};

export default TNTasks;
