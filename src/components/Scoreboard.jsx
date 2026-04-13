import React from 'react';
import { Trophy, Star, Medal } from 'lucide-react';
import './Scoreboard.css';

const Scoreboard = ({ tasks }) => {
  // Aggregate points
  const pointsMap = {};
  
  tasks.forEach(t => {
    if (!t.assignee || !t.assignee.name) return;
    
    // Parse points as number
    const ptsMatch = t.points ? t.points.match(/\d+/) : null;
    const pts = ptsMatch ? parseInt(ptsMatch[0], 10) : 0;
    
    if (!pointsMap[t.assignee.name]) {
      pointsMap[t.assignee.name] = { 
        ...t.assignee, 
        score: 0, 
        completedTasks: 0,
        inProgressTasks: 0
      };
    }
    
    if (t.status === 'done') {
      pointsMap[t.assignee.name].score += pts;
      pointsMap[t.assignee.name].completedTasks += 1;
    } else if (t.status === 'in-progress') {
      pointsMap[t.assignee.name].score += Math.floor(pts * 0.5); // 50% points for in-progress
      pointsMap[t.assignee.name].inProgressTasks += 1;
    }
  });

  // Sort descending by score
  const ranking = Object.values(pointsMap).sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard-container">
      <div className="scoreboard-header">
        <Trophy size={24} className="trophy-icon" />
        <h2>Bảng Xếp Hạng Năng Suất (KPIs)</h2>
      </div>
      
      <div className="scoreboard-content">
        {ranking.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu tính điểm. Đưa task sang cột "Đang làm" hoặc "Hoàn thành" để xem điểm.</div>
        ) : (
          <table className="score-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Nhân viên</th>
                <th>Công việc CĐ</th>
                <th>Đã Hoàn Thành</th>
                <th>Tổng Điểm (Pts)</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((user, index) => {
                let rankIcon = null;
                let rankClass = '';
                if (index === 0) {
                  rankIcon = <Trophy size={18} color="#eab308" />;
                  rankClass = 'rank-1';
                } else if (index === 1) {
                  rankIcon = <Medal size={18} color="#94a3b8" />;
                  rankClass = 'rank-2';
                } else if (index === 2) {
                  rankIcon = <Medal size={18} color="#b45309" />;
                  rankClass = 'rank-3';
                } else {
                  rankIcon = <span className="rank-number">{index + 1}</span>;
                }

                return (
                  <tr key={user.name} className={`score-row ${rankClass}`}>
                    <td className="rank-cell">{rankIcon}</td>
                    <td className="user-cell">
                      <div className="user-avatar" style={{ backgroundColor: user.color || '#3b82f6' }}>
                        {user.avatar}
                      </div>
                      <span className="user-name">{user.name}</span>
                    </td>
                    <td>{user.inProgressTasks} task</td>
                    <td>{user.completedTasks} task</td>
                    <td className="score-cell">
                      {user.score}
                      <Star size={14} className="star-icon" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
