import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';
import './AddTaskModal.css';

const AddTargetModal = ({ onClose, onSave, editingTarget = null }) => {
  const [title, setTitle] = useState(editingTarget ? editingTarget.title : '');
  const [targetValue, setTargetValue] = useState(editingTarget ? new Intl.NumberFormat('vi-VN').format(editingTarget.target_value) : '');
  const [actualValue, setActualValue] = useState(editingTarget ? new Intl.NumberFormat('vi-VN').format(editingTarget.actual_value) : '');
  const [assignmentType, setAssignmentType] = useState(editingTarget ? editingTarget.assignment_type : 'department');
  
  // Nhan Vien
  const [employees, setEmployees] = useState([]);
  const [assigneeId, setAssigneeId] = useState(editingTarget ? editingTarget.assignee_id : '');
  
  // Phong ban
  const [departmentName, setDepartmentName] = useState(editingTarget ? editingTarget.department_name : 'Khối Sale VN');
  
  // Set default month to current month/year if not editing
  const currentMonthStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
  const [month, setMonth] = useState(editingTarget ? editingTarget.month : currentMonthStr);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
     const fetchEmployees = async () => {
         const { data } = await supabase.from('employees').select('id, name, role');
         if (data && data.length > 0) {
            setEmployees(data);
            if(!editingTarget && assignmentType === 'employee') {
               setAssigneeId(data[0].id);
            }
         }
     };
     fetchEmployees();
  }, [editingTarget, assignmentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
       title,
       target_value: parseFloat(targetValue.replace(/\./g, '')),
       actual_value: actualValue ? parseFloat(actualValue.replace(/\./g, '')) : 0,
       assignment_type: assignmentType,
       assignee_id: assignmentType === 'employee' ? assigneeId : null,
       department_name: assignmentType === 'department' ? departmentName : null,
       month
    };

    let resultData = null;

    if (editingTarget) {
       const { data, error } = await supabase
           .from('business_targets')
           .update(payload)
           .eq('id', editingTarget.id)
           .select('*, assignee:employees(name, avatar)')
           .single();
       if(data) resultData = data;
    } else {
       const { data, error } = await supabase
           .from('business_targets')
           .insert([payload])
           .select('*, assignee:employees(name, avatar)')
           .single();
       if(data) resultData = data;
    }

    setIsLoading(false);
    if(resultData) {
       onSave(resultData);
    } else {
       alert("Lỗi lưu dữ liệu. Đảm bảo chạy SQL tạo Bảng!");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingTarget ? '✏ Cập nhật Kế hoạch' : '✨ Khởi tạo Chỉ tiêu'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên hạng mục dịch vụ / Chỉ tiêu</label>
            <input 
              type="text" 
              placeholder="Ví dụ: Doanh số Vận hành Shop..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Kế hoạch mục tiêu (VNĐ)</label>
              <input 
                type="text" 
                placeholder="Ví dụ: 50.000.000" 
                value={targetValue}
                onChange={(e) => {
                   const val = e.target.value.replace(/[^0-9]/g, '');
                   setTargetValue(val ? new Intl.NumberFormat('vi-VN').format(val) : '');
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>Đã đạt hiện tại (VNĐ)</label>
              <input 
                type="text" 
                placeholder="Có thể bỏ trống" 
                value={actualValue}
                onChange={(e) => {
                   const val = e.target.value.replace(/[^0-9]/g, '');
                   setActualValue(val ? new Intl.NumberFormat('vi-VN').format(val) : '');
                }}
              />
            </div>
          </div>

          <div className="form-row">
             <div className="form-group">
               <label>Loại Phân Bổ</label>
               <select value={assignmentType} onChange={(e) => {
                   setAssignmentType(e.target.value);
                   if(e.target.value === 'employee' && employees.length > 0 && !assigneeId) {
                      setAssigneeId(employees[0].id);
                   }
               }}>
                 <option value="department">Giao cho Tập thể Phòng Ban</option>
                 <option value="employee">Giao khoán cho Cá Nhân</option>
               </select>
             </div>
             
             <div className="form-group">
                {assignmentType === 'department' ? (
                   <>
                     <label>Tên khối / Phòng ban</label>
                     <select value={departmentName} onChange={e => setDepartmentName(e.target.value)}>
                        <option value="Khối Sale VN">Khối Sale VN</option>
                        <option value="Khối Sale Global">Khối Sale Global</option>
                        <option value="Khối KOC Booking">Khối KOC Booking</option>
                        <option value="Khối Vận hành">Khối Vận hành</option>
                     </select>
                   </>
                ) : (
                   <>
                     <label>Chọn Nhân Sự Sale / KOC</label>
                     <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required>
                        {employees.map(emp => (
                           <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                     </select>
                   </>
                )}
             </div>
          </div>

          <div className="form-group">
             <label>Áp dụng cho kỳ (Tháng)</label>
             <input type="text" value={month} onChange={e => setMonth(e.target.value)} placeholder="04/2026" required/>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Hủy</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
               {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Lưu chỉ tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTargetModal;
