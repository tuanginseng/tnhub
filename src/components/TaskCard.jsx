import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, ChevronRight } from 'lucide-react';
import './TaskCard.css';

const TaskCard = ({ task, index, onClickDetails }) => {
  const { id, title, assignee, priority, points, category, dueDate } = task;

  const priorityClass = priority === 'Cao' ? 'high' : 'medium';
  
  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(provided, snapshot) => (
        <div 
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          onClick={() => onClickDetails(task)}
        >
          <h4 className="task-title">{title}</h4>
          
          <div className="task-assignee">
            <div 
              className="assignee-avatar" 
              style={{ backgroundColor: assignee.color || '#3b82f6' }}
            >
              {assignee.avatar}
            </div>
            <span className="assignee-name">{assignee.name}</span>
          </div>

          <div className="task-badges">
            <span className={`badge priority ${priorityClass}`}>{priority}</span>
            <span className="badge points">{points}</span>
            <span className="badge category">{category}</span>
          </div>

          <div className="task-footer">
            <div className="footer-left">
              <Calendar size={14} className="calendar-icon" />
              <span className="due-date">{dueDate}</span>
            </div>
            <div className="footer-right">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
