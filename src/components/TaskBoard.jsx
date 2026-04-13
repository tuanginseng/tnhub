import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, DatabaseBackup, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import KanbanColumn from './KanbanColumn';
import AddTaskModal from './AddTaskModal';
import TaskDetailModal from './TaskDetailModal';
import Scoreboard from './Scoreboard';
import './TaskBoard.css';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // View state
  const [activeTab, setActiveTab] = useState('kanban'); 
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState('Tháng 4');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Lấy dữ liệu từ Supabase
  const fetchTasks = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
         .from('tasks')
         .select('*, assignee:employees(id, name, avatar)');
         
      if (data) {
          const mappedTasks = data.map(t => ({
             id: t.id.toString(),
             title: t.title,
             priority: t.priority,
             points: t.points,
             category: t.category,
             dueDate: t.due_date,
             status: t.status,
             assignee: t.assignee || { name: 'Chưa phân công', avatar: '?' }
          }));
          setTasks(mappedTasks);
      }
      setIsLoading(false);
  };

  useEffect(() => {
     fetchTasks();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Use full tasks state
    const sourceTasks = tasks.filter(t => t.status === source.droppableId);
    const destTasks = source.droppableId === destination.droppableId 
                        ? sourceTasks 
                        : tasks.filter(t => t.status === destination.droppableId);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    // Cập nhật State nội bộ ngay lập tức để giữ độ mượt
    if (source.droppableId !== destination.droppableId) {
      movedTask.status = destination.droppableId;
      destTasks.splice(destination.index, 0, movedTask);
    } else {
      sourceTasks.splice(destination.index, 0, movedTask);
    }

    const otherTasks = tasks.filter(t => t.status !== source.droppableId && t.status !== destination.droppableId);
    setTasks([...otherTasks, ...sourceTasks, ...(source.droppableId !== destination.droppableId ? destTasks : [])]);

    // Gọi lệnh Update xuống cơ sở dữ liệu Supabase
    if (source.droppableId !== destination.droppableId) {
        await supabase
           .from('tasks')
           .update({ status: destination.droppableId })
           .eq('id', movedTask.id);
    }
  };

  const handleSaveTask = async (taskData) => {
    if (taskData.assignMode === 'all') {
      // Tạo task cho tất cả nhân viên
      const payloads = taskData.employees.map(emp => ({
        title: taskData.title,
        priority: taskData.priority,
        points: taskData.points,
        category: taskData.category,
        due_date: taskData.dueDate,
        status: 'todo',
        assignee_id: emp.id,
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(payloads)
        .select('*, assignee:employees(id, name, avatar)');

      if (data) {
        const mapped = data.map(t => ({
          id: t.id.toString(),
          title: t.title,
          priority: t.priority,
          points: t.points,
          category: t.category,
          dueDate: t.due_date,
          status: t.status,
          assignee: t.assignee || { name: 'Chưa phân công', avatar: '?' },
        }));
        setTasks(prev => [...prev, ...mapped]);
      }
    } else {
      // Tạo task cho 1 nhân viên
      const dbPayload = {
        title: taskData.title,
        priority: taskData.priority,
        points: taskData.points,
        category: taskData.category,
        due_date: taskData.dueDate,
        status: 'todo',
        assignee_id: taskData.assignee.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([dbPayload])
        .select('*, assignee:employees(id, name, avatar)')
        .single();

      if (data) {
        const mappedNewTask = {
          id: data.id.toString(),
          title: data.title,
          priority: data.priority,
          points: data.points,
          category: data.category,
          dueDate: data.due_date,
          status: data.status,
          assignee: data.assignee,
        };
        setTasks(prev => [...prev, mappedNewTask]);
      }
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteTask = async (taskId) => {
    // Xoá DB
    await supabase.from('tasks').delete().eq('id', taskId);
    // Xoá State
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  // FILTER LOGIC
  const displayedTasks = tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const todoTasks = displayedTasks.filter(t => t.status === 'todo');
  const inProgressTasks = displayedTasks.filter(t => t.status === 'in-progress');
  const doneTasks = displayedTasks.filter(t => t.status === 'done');

  return (
    <div className="task-board-container">
      <header className="board-header">
        <div className="board-breadcrumbs">Nhân sự / Giao việc</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="board-title">Giao việc</h1>
            {isLoading ? <Loader2 className="animate-spin" size={16} color="#64748b"/> : <DatabaseBackup size={16} color="#10b981" title="Đã đồng bộ Cloud" />}
        </div>
        
        <div className="board-controls">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              Kanban board
            </button>
            <button 
              className={`tab ${activeTab === 'scoreboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('scoreboard')}
            >
              Bảng điểm
            </button>
          </div>
          
          {activeTab === 'kanban' && (
            <div className="filters">
              <select className="filter-dropdown" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="Tháng 4">Tháng 4</option>
                <option value="Tháng 5">Tháng 5</option>
              </select>
              
              <select className="filter-dropdown" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="all">Tất cả ưu tiên</option>
                <option value="Cao">Ưu tiên Cao</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>

              <select className="filter-dropdown" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="all">Tất cả danh mục</option>
                <option value="monthly">Vận hành Shop</option>
                <option value="booking">Booking KOC</option>
                <option value="project">Dự án Tích xanh</option>
                <option value="sales">TKQC Hoàn tín</option>
                <option value="content">Video/Livestream</option>
                <option value="ads">Chạy Ads</option>
                <option value="reporting">Báo cáo</option>
              </select>

              <button className="add-task-btn" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} /> Thêm
              </button>
              
              <div className="task-count">
                {displayedTasks.length} tasks
              </div>
            </div>
          )}
        </div>
      </header>

      {/* RENDER VIEWS */}
      {activeTab === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-area">
            <KanbanColumn id="todo" title="Chờ làm" count={todoTasks.length} tasks={todoTasks} onClickDetails={setSelectedTask} />
            <KanbanColumn id="in-progress" title="Đang làm" count={inProgressTasks.length} tasks={inProgressTasks} onClickDetails={setSelectedTask} />
            <KanbanColumn id="done" title="Hoàn thành" count={doneTasks.length} tasks={doneTasks} onClickDetails={setSelectedTask} />
          </div>
        </DragDropContext>
      ) : (
        <Scoreboard tasks={tasks} />
      )}

      {/* MODALS */}
      {isAddModalOpen && (
        <AddTaskModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleSaveTask} 
        />
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
        />
      )}

    </div>
  );
};

export default TaskBoard;
