import React, { useState } from 'react';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './LoginView.css';

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Giao tiếp với Supabase
    const { data, error: dbError } = await supabase
       .from('employees')
       .select('*')
       .eq('username', username)
       .eq('password', password)
       .single();

    setIsLoading(false);

    if (data) {
      setError('');
      onLogin(data); // data chứa đầy đủ id, role, name, avatar...
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
             <div className="logo-icon-lg">HR</div>
          </div>
          <h1>Đăng nhập hệ thống</h1>
          <p>Phiên bản Cloud Supabase Backend</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Ví dụ: admin hoặc nhanvien"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <>Vào Hệ Thống <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="login-footer">
          Hệ thống đã kết nối cơ sở dữ liệu thời gian thực.
        </div>
      </div>
    </div>
  );
};

export default LoginView;
