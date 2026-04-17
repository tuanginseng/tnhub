import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Helpers Mappers
const mapDocToUI = (d) => ({
  id: d.id, name: d.name, description: d.description || '',
  type: d.type, // 'file' | 'link'
  url: d.url, fileSize: d.file_size,
  uploadedBy: d.uploaded_by, createdAt: d.created_at
});

const mapCustToUI = (c) => ({
  id: c.id, name: c.name, service: c.service, value: Number(c.expected_value),
  status: c.status, userId: c.user_id, industry: c.industry,
  phone: c.phone, note: c.note, lead_status: c.lead_status
});
const mapCustToDB = (c) => ({
  name: c.name, service: c.service, expected_value: c.value,
  status: c.status, user_id: c.userId, industry: c.industry,
  phone: c.phone, note: c.note, lead_status: c.lead_status
});

const mapDealToUI = (d) => ({
  id: d.id, userId: d.user_id, customerId: d.customer_id,
  amount: Number(d.amount), date: d.deal_date, isFixFee: d.is_fix_fee,
  service: d.service_type, status: d.status, createdAt: d.created_at,
  approvedDate: d.approved_date
});
const mapDealToDB = (d) => ({
  user_id: d.userId, customer_id: d.customerId, amount: d.amount,
  deal_date: d.date, is_fix_fee: d.isFixFee, service_type: d.service, status: d.status,
  approved_date: d.approvedDate
});

const mapTaskToUI = (t) => ({
  id: t.id, title: t.title, customerId: t.customer_id,
  userId: t.user_id, status: t.status, createdAt: t.created_at,
  description: t.description, deadline: t.deadline, note: t.note,
  createdById: t.created_by_id  // người tạo task
});
const mapTaskToDB = (t) => ({
  title: t.title, customer_id: t.customerId, user_id: t.userId, status: t.status,
  description: t.description, deadline: t.deadline, note: t.note,
  created_by_id: t.createdById
});

const mapEventToUI = (e) => ({
  id: e.id, title: e.title, date: e.date,
  startTime: e.start_time || '', endTime: e.end_time || '',
  color: e.color || 'blue', note: e.note || '',
  userId: e.user_id, createdAt: e.created_at
});
const mapEventToDB = (e) => ({
  title: e.title, date: e.date,
  start_time: e.startTime || null, end_time: e.endTime || null,
  color: e.color || 'blue', note: e.note || '',
  user_id: e.userId
});

const TNContext = createContext();

export const TNProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  // Khôi phục session từ localStorage nếu có
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const saved = localStorage.getItem('tn_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Wrapper để lưu vào localStorage khi đăng nhập/xuất
  const setCurrentUser = (user) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('tn_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tn_current_user');
    }
  };

  const [targetKPI, setTargetKPI] = useState(120000000);
  const [salaryConfig, setSalaryConfig] = useState({
    attendance: 300000,
    tiers: [],
    superBonus: []
  });

  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadDatabase();

    // Lắng nghe thay đổi real-time trên bảng tn_tasks
    const channel = supabase
      .channel('tn_tasks_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tn_tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Task mới được tạo (admin giao việc)
            setTasks(prev => {
              // Tránh duplicate nếu chính mình vừa tạo
              if (prev.find(t => t.id === payload.new.id)) return prev;
              return [mapTaskToUI(payload.new), ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(t => t.id === payload.new.id ? { ...t, ...mapTaskToUI(payload.new) } : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const loadDatabase = async () => {
    console.log("Fetching from Supabase...");
    try {
      const [uRes, cRes, dRes, taskRes, sysRes, tierRes, bonusRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('tn_customers').select('*').order('created_at', { ascending: false }),
        supabase.from('tn_deals').select('*').order('deal_date', { ascending: false }),
        supabase.from('tn_tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('tn_system_settings').select('*'),
        supabase.from('tn_salary_tiers').select('*').order('limit_amount', { ascending: true }),
        supabase.from('tn_super_bonus').select('*')
      ]);

      if (uRes.error) console.error("Error users", uRes.error);

      if (uRes.data && uRes.data.length > 0) {
        const loadedUsers = uRes.data.map(u => ({
          id: u.id, name: u.name, role: u.role || 'NVCT', title: u.title || 'Sale',
          username: u.username || '', password: u.password || '123456'
        }));
        setUsers(loadedUsers);
        // Khôi phục currentUser từ localStorage nếu tài khoản vẫn còn tồn tại trong DB
        const savedUser = localStorage.getItem('tn_current_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            const stillExists = loadedUsers.find(u => u.id === parsed.id);
            if (stillExists) {
              setCurrentUserState(stillExists); // dùng data mới nhất từ DB
            } else {
              localStorage.removeItem('tn_current_user'); // tài khoản bị xóa
            }
          } catch {
            localStorage.removeItem('tn_current_user');
          }
        }
      } else {
        // Tạo Giám đốc mặc định nếu DB trống
        const { data } = await supabase.from('employees').insert({
          name: 'Admin', role: 'admin', title: 'Giám Đốc', username: 'admin', password: '1'
        }).select();
        if (data) {
          const admin = { id: data[0].id, name: 'Admin', role: 'admin', title: 'Giám Đốc', username: 'admin', password: '1' };
          setUsers([admin]);
          setCurrentUser(null);
        }
      }

      if (cRes.data) setCustomers(cRes.data.map(mapCustToUI));
      if (dRes.data) setDeals(dRes.data.map(mapDealToUI));
      if (taskRes.data) setTasks(taskRes.data.map(mapTaskToUI));

      // Load documents
      const { data: docsData } = await supabase.from('tn_documents').select('*').order('created_at', { ascending: false });
      if (docsData) setDocuments(docsData.map(mapDocToUI));

      // Load calendar events
      const { data: eventsData } = await supabase.from('tn_calendar_events').select('*').order('date', { ascending: true });
      if (eventsData) setEvents(eventsData.map(mapEventToUI));

      // Load Settings
      if (sysRes.data) {
        const kpi = sysRes.data.find(s => s.setting_key === 'target_kpi');
        if (kpi) setTargetKPI(Number(kpi.setting_value));

        const att = sysRes.data.find(s => s.setting_key === 'attendance');
        let attendance = att ? Number(att.setting_value) : 300000;

        let tiers = tierRes.data && tierRes.data.length > 0
          ? tierRes.data.map(t => ({ id: t.id, limit: Number(t.limit_amount), base: Number(t.base_salary), bonus: Number(t.bonus_amount) }))
          : [
            { id: 1, limit: 0, base: 3000000, bonus: 0 },
            { id: 2, limit: 120000000, base: 5000000, bonus: 2000000 },
            { id: 3, limit: 144000000, base: 5000000, bonus: 3000000 },
            { id: 4, limit: 180000000, base: 5000000, bonus: 6000000 },
            { id: 5, limit: 240000000, base: 5000000, bonus: 12000000 },
            { id: 6, limit: 360000000, base: 5000000, bonus: 24000000 }
          ];

        let superBonus = bonusRes.data && bonusRes.data.length > 0
          ? bonusRes.data.map(b => ({ id: b.id, service: b.service_name, bonus: Number(b.bonus_amount) }))
          : [
            { id: 'b1', service: 'Bán Tick xanh', bonus: 3000000 },
            { id: 'b2', service: 'Bán tài khoản hoàn tín', bonus: 500000 }
          ];

        setSalaryConfig({ attendance, tiers, superBonus });

        // Tự động Seed dữ liệu mặc định vào DB nếu nó đang rỗng!
        if (!tierRes.data || tierRes.data.length === 0) {
          const tiersPayload = tiers.map(t => ({ limit_amount: t.limit, base_salary: t.base, bonus_amount: t.bonus }));
          supabase.from('tn_salary_tiers').insert(tiersPayload).then();
        }
        if (!bonusRes.data || bonusRes.data.length === 0) {
          const bonusPayload = superBonus.map(b => ({ service_name: b.service, bonus_amount: b.bonus }));
          supabase.from('tn_super_bonus').insert(bonusPayload).then();
        }
        if (sysRes.data.length === 0) {
          supabase.from('tn_system_settings').upsert({ setting_key: 'target_kpi', setting_value: 120000000 }).then();
          supabase.from('tn_system_settings').upsert({ setting_key: 'attendance', setting_value: 300000 }).then();
        }
      }

    } catch (err) {
      console.error("Critical error loading DB:", err);
    } finally {
      setIsReady(true);
    }
  };

  // ===================== CRUD APIs =====================
  const apiAddUser = async (userPayload) => {
    const { data, error } = await supabase.from('employees').insert({
      name: userPayload.name, role: userPayload.role, title: userPayload.title,
      username: userPayload.username, password: userPayload.password || '123456'
    }).select();
    if (error) return { error };
    if (data) {
      setUsers(prev => [...prev, {
        id: data[0].id, name: data[0].name, role: data[0].role, title: data[0].title,
        username: data[0].username, password: data[0].password || '123456'
      }]);
    }
    return { data };
  };

  const apiDeleteUser = async (id) => {
    await supabase.from('employees').delete().eq('id', id);
    setUsers(users.filter(u => u.id !== id));
    if (currentUser?.id === id) setCurrentUser(users[0]);
  };

  const apiChangePassword = async (newPassword) => {
    await supabase.from('employees').update({ password: newPassword }).eq('id', currentUser.id);
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u));
    setCurrentUser({ ...currentUser, password: newPassword });
  };

  const apiUpdateConfig = async (newTarget, newSalaryConfig) => {
    setTargetKPI(newTarget);
    setSalaryConfig(newSalaryConfig);

    await supabase.from('tn_system_settings').upsert({ setting_key: 'target_kpi', setting_value: newTarget });
    await supabase.from('tn_system_settings').upsert({ setting_key: 'attendance', setting_value: newSalaryConfig.attendance });

    await supabase.from('tn_salary_tiers').delete().neq('id', 0);
    const tiersPayload = newSalaryConfig.tiers.map(t => ({ limit_amount: t.limit, base_salary: t.base, bonus_amount: t.bonus }));
    if (tiersPayload.length > 0) await supabase.from('tn_salary_tiers').insert(tiersPayload);

    await supabase.from('tn_super_bonus').delete().neq('id', 0);
    const bonusPayload = newSalaryConfig.superBonus.map(b => ({ service_name: b.service, bonus_amount: b.bonus }));
    if (bonusPayload.length > 0) await supabase.from('tn_super_bonus').insert(bonusPayload);
  };

  const apiAddCustomer = async (cust) => {
    const { data } = await supabase.from('tn_customers').insert(mapCustToDB(cust)).select();
    if (data) setCustomers([mapCustToUI(data[0]), ...customers]);
  };

  const apiUpdateCustomerBatch = async (cList) => {
    // Dùng cho kéo thả nguyên phễu
    setCustomers(cList);
    for (let c of cList) {
      supabase.from('tn_customers').update({ lead_status: c.lead_status, status: c.status }).eq('id', c.id).then();
    }
  };

  const apiUpdateCustomer = async (id, changes) => {
    let dbPayload = {};
    if (changes.name !== undefined) dbPayload.name = changes.name;
    if (changes.service !== undefined) dbPayload.service = changes.service;
    if (changes.value !== undefined) dbPayload.expected_value = changes.value;
    if (changes.status !== undefined) dbPayload.status = changes.status;
    if (changes.industry !== undefined) dbPayload.industry = changes.industry;
    if (changes.phone !== undefined) dbPayload.phone = changes.phone;
    if (changes.note !== undefined) dbPayload.note = changes.note;
    if (changes.lead_status !== undefined) dbPayload.lead_status = changes.lead_status;

    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));
    await supabase.from('tn_customers').update(dbPayload).eq('id', id);
  };

  const apiDeleteCustomer = async (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    await supabase.from('tn_customers').delete().eq('id', id);
  };


  const apiAddDeal = async (deal) => {
    const { data } = await supabase.from('tn_deals').insert(mapDealToDB(deal)).select();
    if (data) setDeals([mapDealToUI(data[0]), ...deals]);
  };

  const apiUpdateDeal = async (id, dealUpdate) => {
    // Nếu được duyệt, tự động đính kèm ngày duyệt là hôm nay
    if (dealUpdate.status === 'approved' && !dealUpdate.approvedDate) {
      dealUpdate.approvedDate = new Date().toISOString().split('T')[0];
    }

    // Dùng cho Update status (approve/reject) và chỉnh sửa
    setDeals(deals.map(d => d.id === id ? { ...d, ...dealUpdate } : d));
    // map prop sang DB prop nếu có
    let dbPayload = {};
    if (dealUpdate.status) dbPayload.status = dealUpdate.status;
    if (dealUpdate.amount) dbPayload.amount = dealUpdate.amount;
    if (dealUpdate.date) dbPayload.deal_date = dealUpdate.date;
    if (dealUpdate.service) dbPayload.service_type = dealUpdate.service;
    if (dealUpdate.approvedDate) dbPayload.approved_date = dealUpdate.approvedDate;

    await supabase.from('tn_deals').update(dbPayload).eq('id', id);
  };

  const apiDeleteDeal = async (id) => {
    setDeals(deals.filter(d => d.id !== id));
    await supabase.from('tn_deals').delete().eq('id', id);
  };

  // ── Calendar Events ──
  const apiAddEvent = async (ev) => {
    const { data, error } = await supabase.from('tn_calendar_events').insert(mapEventToDB(ev)).select();
    if (error) return { error };
    if (data) setEvents(prev => [...prev, mapEventToUI(data[0])]);
    return { data };
  };

  const apiUpdateEvent = async (id, changes) => {
    const payload = {};
    if (changes.title !== undefined) payload.title = changes.title;
    if (changes.date !== undefined) payload.date = changes.date;
    if (changes.startTime !== undefined) payload.start_time = changes.startTime;
    if (changes.endTime !== undefined) payload.end_time = changes.endTime;
    if (changes.color !== undefined) payload.color = changes.color;
    if (changes.note !== undefined) payload.note = changes.note;
    const { data, error } = await supabase.from('tn_calendar_events').update(payload).eq('id', id).select();
    if (error) return { error };
    if (data) setEvents(prev => prev.map(e => e.id === id ? mapEventToUI(data[0]) : e));
    return { data };
  };

  const apiDeleteEvent = async (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await supabase.from('tn_calendar_events').delete().eq('id', id);
  };

  const apiAddDocLink = async (doc) => {
    const payload = {
      name: doc.name,
      type: 'link',
      url: doc.url,
      uploaded_by: doc.uploadedBy,
      ...(doc.description ? { description: doc.description } : {}),
    };
    const { data, error } = await supabase.from('tn_documents').insert(payload).select();
    if (error) return { error };
    if (data) setDocuments(prev => [mapDocToUI(data[0]), ...prev]);
    return { data };
  };

  const apiUploadDocFile = async (file, uploadedBy) => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data: storageData, error } = await supabase.storage
      .from('tn-documents')
      .upload(safeName, file, { upsert: false });
    if (error) return { error };
    const { data: { publicUrl } } = supabase.storage.from('tn-documents').getPublicUrl(safeName);
    const payload = {
      name: file.name, description: '',
      type: 'file', url: publicUrl,
      file_size: file.size, uploaded_by: uploadedBy
    };
    const { data } = await supabase.from('tn_documents').insert(payload).select();
    if (data) setDocuments(prev => [mapDocToUI(data[0]), ...prev]);
    return { data };
  };

  const apiDeleteDoc = async (doc) => {
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    await supabase.from('tn_documents').delete().eq('id', doc.id);
    if (doc.type === 'file') {
      // Xóa file trong storage
      const fileName = doc.url.split('/').pop();
      await supabase.storage.from('tn-documents').remove([fileName]);
    }
  };

  const apiAddTask = async (task) => {
    const { data } = await supabase.from('tn_tasks').insert(mapTaskToDB(task)).select();
    if (data) setTasks(prev => [mapTaskToUI(data[0]), ...prev]);
  };

  // Giao task cho nhiều nhân viên cùng lúc
  const apiAddTaskBatch = async (taskTemplate, employeeList) => {
    const payloads = employeeList.map(emp => ({
      ...mapTaskToDB({ ...taskTemplate, userId: emp.id })
    }));
    const { data } = await supabase.from('tn_tasks').insert(payloads).select();
    if (data) setTasks(prev => [...data.map(mapTaskToUI), ...prev]);
  };

  const apiUpdateTask = async (id, status) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    await supabase.from('tn_tasks').update({ status }).eq('id', id);
  };

  const apiDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tn_tasks').delete().eq('id', id);
  };

  const apiEditTask = async (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    await supabase.from('tn_tasks').update(dbUpdates).eq('id', id);
  };

  if (!isReady) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-medium text-slate-400">Đang Tải Dữ Liệu...</div>
      </div>
    );
  }

  const value = {
    targetKPI, setTargetKPI,
    salaryConfig, setSalaryConfig,
    users, setUsers,
    currentUser, setCurrentUser,
    customers, setCustomers,
    deals, setDeals,
    tasks, setTasks,
    documents, setDocuments,
    // API functions
    apiAddUser, apiDeleteUser, apiUpdateConfig, apiChangePassword,
    apiAddCustomer, apiUpdateCustomerBatch, apiUpdateCustomer, apiDeleteCustomer,
    apiAddDeal, apiUpdateDeal, apiDeleteDeal,
    apiAddDocLink, apiUploadDocFile, apiDeleteDoc,
    apiAddEvent, apiUpdateEvent, apiDeleteEvent,
    events, setEvents,
    apiAddTask, apiAddTaskBatch, apiUpdateTask, apiDeleteTask, apiEditTask,
    reloadData: loadDatabase
  };

  return <TNContext.Provider value={value}>{children}</TNContext.Provider>;
};

export const useTN = () => useContext(TNContext);
