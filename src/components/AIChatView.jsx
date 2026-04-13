import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import './AIChatView.css';

const AIChatView = () => {
  const [messages, setMessages] = useState([
     { sender: 'AI', text: 'Xin chào, Admin! Tôi là Trợ lý AI chuyên trách bộ phận Sale. Tôi có thể tổng hợp báo cáo lợi nhuận, cung cấp insight chiến dịch Tiktok, hoặc gợi ý chiến lược ngân sách cho bạn.' },
     { sender: 'User', text: 'Hãy tóm tắt nhanh hiệu suất chi phí Marketing tuần qua cho tôi.' },
     { sender: 'AI', text: 'Tuần qua (04/04 - 11/04), tổng chi phí Marketing là 145 triệu VNĐ, mang về 1,200 leads. CPA đạt 120,800đ/lead. \n\nSo với tuần trước, lượng Lead tăng 12% trong khi chi phí chỉ tăng 2%. Nguồn leads chính đến từ Kênh Tiktok KOC (chiếm 60%). Bạn làm rất tốt!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages([...messages, { sender: 'User', text: input }]);
    setInput('');
    setTimeout(() => {
       setMessages(prev => [...prev, { sender: 'AI', text: 'Xin lỗi, hiện tại tôi đang trong chế độ demo (phiên bản thử nghiệm giao diện). Vui lòng tích hợp API thực tế (như OpenAI) để tôi có thể suy nghĩ và trả lời!' }]);
    }, 1000);
  };

  return (
    <div className="chat-container">
       <div className="chat-header">
          <div className="header-icon-box">
             <Bot size={24} color="#3b82f6" />
          </div>
          <div>
            <h2 className="chat-title">HR System AI Copilot <Sparkles size={16} color="#eab308" style={{marginLeft: 8}}/></h2>
            <p className="chat-subtitle">Trợ lý phân tích kinh doanh thời gian thực</p>
          </div>
       </div>

       <div className="chat-messages">
          {messages.map((m, i) => (
             <div key={i} className={`message ${m.sender === 'AI' ? 'ai' : 'user'}`}>
                <div className="msg-avatar">
                   {m.sender === 'AI' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="msg-bubble">
                   {m.text}
                </div>
             </div>
          ))}
       </div>

       <div className="chat-input-area">
          <div className="chat-input-wrapper">
             <input 
               type="text" 
               placeholder="Hỏi AI bất cứ điều gì về kết quả kinh doanh..." 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button className="send-btn" onClick={handleSend}><Send size={18} /></button>
          </div>
          <div className="disclaimer">
             AI có thể cung cấp thông tin không chính xác. Hãy xác minh thông tin quan trọng.
          </div>
       </div>
    </div>
  );
};

export default AIChatView;
