import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Users, User } from 'lucide-react';
import './AddTaskModal.css';

const AddTaskModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Trung bình');
  const [points, setPoints] = useState('100 pts');
  const [category, setCategory] = useState('monthly');
  const [dueDate, setDueDate] = useState('');
  
  // Dữ liệu Nhân viên từ CSDL
  const [employees, setEmployees] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignMode, setAssignMode] = useState('single'); // 'single' | 'all'

  // Fetch employees
  useEffect(() => {
     const fetchEmployees = async () => {
         const { data, error } = await supabase.from('employees').select('id, name, avatar');
         if (data && data.length > 0) {
            setEmployees(data);
            setAssigneeId(data[0].id); // Mặc định chọn người đầu tiên
         }
     };
     fetchEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (assignMode === 'single') {
      if (!assigneeId) return alert('Chưa tải được danh sách nhân viên, vui lòng chờ!');
      const selectedEmp = employees.find(emp => emp.id === assigneeId);
      onSave({ title, priority, points, category, dueDate, assignMode: 'single', assignee: selectedEmp });
    } else {
      if (employees.length === 0) return alert('Chưa tải được danh sách nhân viên, vui lòng chờ!');
      onSave({ title, priority, points, category, dueDate, assignMode: 'all', employees });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thêm Công Việc Mới</h2>
          <button className="close-btn" onClick={onClose}><X size={20}/></button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên công việc</label>
            <input 
              type="text" 
              placeholder="Nhập tiêu đề công việc..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Mức độ ưu tiên</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Cao">Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>
            <div className="form-group">
              <label>Điểm số (Pts)</label>
              <input 
                type="text" 
                placeholder="VD: 50 pts" 
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="monthly">Vận hành Shop</option>
              <option value="booking">Booking KOC</option>
              <option value="project">Dự án Tích xanh</option>
              <option value="sales">TKQC Hoàn tín</option>
              <option value="content">Video/Livestream</option>
              <option value="ads">Chạy Ads</option>
              <option value="reporting">Báo cáo</option>
            </select>
          </div>

          {/* Assign Mode Toggle */}
          <div className="form-group">
            <label>Phân công cho</label>
            <div className="assign-mode-toggle">
              <button
                type="button"
                className={`assign-mode-btn ${assignMode === 'single' ? 'active' : ''}`}
                onClick={() => setAssignMode('single')}
              >
                <User size={15} />
                Một nhân viên
              </button>
              <button
                type="button"
                className={`assign-mode-btn ${assignMode === 'all' ? 'active' : ''}`}
                onClick={() => setAssignMode('all')}
              >
                <Users size={15} />
                Tất cả nhân viên
              </button>
            </div>
          </div>

          {assignMode === 'single' ? (
            <div className="form-row">
              <div className="form-group">
                <label>Chọn nhân viên</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                   {employees.length === 0 && <option value="">Đang tải DB...</option>}
                   {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                   ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày đến hạn</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <div className="assign-all-info">
                  <Users size={16} color="#3b82f6" />
                  <span>Sẽ tạo task cho <strong>{employees.length} nhân viên</strong> cùng lúc</span>
                </div>
              </div>
              <div className="form-group">
                <label>Ngày đến hạn</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-save">
              {assignMode === 'all' ? `Tạo cho ${employees.length} nhân viên` : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
