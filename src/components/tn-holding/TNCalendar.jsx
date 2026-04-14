import React, { useState, useEffect, useRef } from 'react';
import { useTN } from '../../context/TNHoldingContext';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2, Edit2, Check, CalendarDays } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────
const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const EVENT_COLORS = [
  { key: 'blue',   label: 'Xanh dương', bg: 'bg-blue-500',   dot: 'bg-blue-500',   ring: 'ring-blue-500',   text: 'text-blue-700',   light: 'bg-blue-50 border-blue-200' },
  { key: 'red',    label: 'Đỏ',         bg: 'bg-red-500',    dot: 'bg-red-500',    ring: 'ring-red-500',    text: 'text-red-700',    light: 'bg-red-50 border-red-200' },
  { key: 'green',  label: 'Xanh lá',    bg: 'bg-emerald-500',dot: 'bg-emerald-500',ring: 'ring-emerald-500',text: 'text-emerald-700',light: 'bg-emerald-50 border-emerald-200' },
  { key: 'amber',  label: 'Vàng',       bg: 'bg-amber-500',  dot: 'bg-amber-500',  ring: 'ring-amber-500',  text: 'text-amber-700',  light: 'bg-amber-50 border-amber-200' },
  { key: 'purple', label: 'Tím',        bg: 'bg-purple-500', dot: 'bg-purple-500', ring: 'ring-purple-500', text: 'text-purple-700', light: 'bg-purple-50 border-purple-200' },
  { key: 'pink',   label: 'Hồng',       bg: 'bg-pink-500',   dot: 'bg-pink-500',   ring: 'ring-pink-500',   text: 'text-pink-700',   light: 'bg-pink-50 border-pink-200' },
];

const getColor = (key) => EVENT_COLORS.find(c => c.key === key) || EVENT_COLORS[0];

const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const formatDateVI = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} tháng ${parseInt(m)}, ${y}`;
};

const today = () => {
  const n = new Date();
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate());
};

// ─── Main Component ──────────────────────────────────────────
const TNCalendar = () => {
  const { currentUser, events, apiAddEvent, apiUpdateEvent, apiDeleteEvent } = useTN();
  const now = new Date();

  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Modal state: null | { mode: 'new'|'view'|'edit', date, event? }
  const [modal, setModal] = useState(null);

  // Form state
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '', color: 'blue', note: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected day panel
  const [selectedDate, setSelectedDate] = useState(today());

  // Filter events for current user (admin sees all)
  const isAdmin = currentUser.role === 'admin';
  const myEvents = isAdmin
    ? events
    : events.filter(e => e.userId === currentUser.id);

  const todayStr = today();

  // ── Calendar grid helpers ────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  // Empty cells before month start
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDate = (dateStr) => myEvents.filter(e => e.date === dateStr);

  // ── Navigation ───────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
    setSelectedDate(todayStr);
  };

  // ── Open new event modal ─────────────────────────────────
  const openNew = (dateStr) => {
    setForm({ title: '', startTime: '', endTime: '', color: 'blue', note: '' });
    setFormError('');
    setModal({ mode: 'new', date: dateStr });
  };

  // ── Open view modal ──────────────────────────────────────
  const openView = (ev, e) => {
    e.stopPropagation();
    setModal({ mode: 'view', event: ev, date: ev.date });
  };

  // ── Start edit ───────────────────────────────────────────
  const startEdit = (ev) => {
    setForm({ title: ev.title, startTime: ev.startTime, endTime: ev.endTime, color: ev.color, note: ev.note });
    setFormError('');
    setModal({ mode: 'edit', event: ev, date: ev.date });
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Vui lòng nhập tiêu đề sự kiện'); return; }
    setSaving(true);
    if (modal.mode === 'new') {
      const result = await apiAddEvent({ ...form, date: modal.date, userId: currentUser.id });
      if (result?.error) setFormError(result.error.message);
      else setModal(null);
    } else if (modal.mode === 'edit') {
      const result = await apiUpdateEvent(modal.event.id, form);
      if (result?.error) setFormError(result.error.message);
      else setModal(null);
    }
    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (evId) => {
    if (!window.confirm('Xóa sự kiện này?')) return;
    await apiDeleteEvent(evId);
    setModal(null);
  };

  // ── Day click ────────────────────────────────────────────
  const handleDayClick = (d) => {
    const dateStr = toDateStr(viewYear, viewMonth, d);
    setSelectedDate(dateStr);
  };

  const selectedEvents = getEventsForDate(selectedDate);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-0 animate-in fade-in duration-500">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={28} />
            Lịch Làm Việc
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            Hôm nay
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={prevMonth} className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 font-bold text-slate-800 text-sm whitespace-nowrap">
              {MONTHS_VI[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => openNew(selectedDate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/25"
          >
            <Plus size={16} /> Thêm sự kiện
          </button>
        </div>
      </div>

      {/* ── Main layout: Calendar + Side panel ── */}
      <div className="flex gap-5">
        {/* Calendar grid */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="grid grid-cols-7">
            {cells.map((d, idx) => {
              const dateStr = d ? toDateStr(viewYear, viewMonth, d) : null;
              const dayEvents = dateStr ? getEventsForDate(dateStr) : [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const isSun = idx % 7 === 0;
              const isSat = idx % 7 === 6;

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] border-b border-r border-slate-100 p-1.5 cursor-pointer transition-colors relative group
                    ${!d ? 'bg-slate-50/50' : 'hover:bg-blue-50/30'}
                    ${isSelected && d ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-300' : ''}
                  `}
                  onClick={() => d && handleDayClick(d)}
                >
                  {d && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors
                          ${isToday ? 'bg-blue-600 text-white' : isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-slate-700'}
                          ${isSelected && !isToday ? 'ring-2 ring-blue-400' : ''}
                        `}>
                          {d}
                        </span>
                        {/* Quick add on hover */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openNew(dateStr); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Events */}
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => {
                          const c = getColor(ev.color);
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => openView(ev, e)}
                              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded truncate text-white ${c.bg} hover:opacity-80 transition-opacity cursor-pointer`}
                            >
                              {ev.startTime && <span className="opacity-80 mr-1">{ev.startTime.slice(0,5)}</span>}
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-slate-400 font-semibold pl-1">+{dayEvents.length - 3} sự kiện</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side panel: Selected day ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          {/* Selected date info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ngày đã chọn</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{formatDateVI(selectedDate)}</div>
              </div>
              <button
                onClick={() => openNew(selectedDate)}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors shadow-md shadow-blue-600/25"
              >
                <Plus size={16} />
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="py-6 text-center">
                <div className="text-slate-300 text-3xl mb-2">📅</div>
                <p className="text-xs text-slate-400 font-medium">Không có sự kiện</p>
                <button onClick={() => openNew(selectedDate)} className="mt-2 text-xs text-blue-500 font-semibold hover:underline">
                  + Thêm sự kiện
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {selectedEvents.map(ev => {
                  const c = getColor(ev.color);
                  const canEdit = isAdmin || ev.userId === currentUser.id;
                  return (
                    <div
                      key={ev.id}
                      className={`rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-all ${c.light}`}
                      onClick={(e) => openView(ev, e)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${c.dot}`} />
                          <div className="min-w-0">
                            <div className={`font-bold text-sm truncate ${c.text}`}>{ev.title}</div>
                            {(ev.startTime || ev.endTime) && (
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock size={10} />
                                {ev.startTime && ev.startTime.slice(0, 5)}
                                {ev.endTime && ` – ${ev.endTime.slice(0, 5)}`}
                              </div>
                            )}
                            {ev.note && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{ev.note}</div>}
                          </div>
                        </div>
                        {canEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                            className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mini: upcoming events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sắp tới</div>
            {myEvents
              .filter(e => e.date >= todayStr)
              .slice(0, 5)
              .length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">Không có sự kiện sắp tới</p>
            ) : (
              <div className="space-y-2">
                {myEvents.filter(e => e.date >= todayStr).slice(0, 5).map(ev => {
                  const c = getColor(ev.color);
                  return (
                    <div key={ev.id} className="flex items-center gap-2 cursor-pointer" onClick={(e) => openView(ev, e)}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-700 truncate">{ev.title}</div>
                        <div className="text-[10px] text-slate-400">{formatDateVI(ev.date)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: new / edit / view ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`${modal.mode === 'view' ? `bg-${getColor(modal.event?.color || 'blue').bg.replace('bg-', '')}` : 'bg-white'} px-6 py-5 border-b border-slate-100 flex items-center justify-between`}>
              <div>
                {modal.mode === 'view' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${getColor(modal.event.color).bg}`} />
                      <h2 className="text-lg font-bold text-slate-900">{modal.event.title}</h2>
                    </div>
                    <p className="text-sm text-slate-500">{formatDateVI(modal.date)}</p>
                  </div>
                ) : (
                  <h2 className="text-lg font-bold text-slate-900">
                    {modal.mode === 'new' ? `Thêm sự kiện — ${formatDateVI(modal.date)}` : 'Chỉnh sửa sự kiện'}
                  </h2>
                )}
              </div>
              <div className="flex items-center gap-1">
                {modal.mode === 'view' && (isAdmin || modal.event.userId === currentUser.id) && (
                  <>
                    <button onClick={() => startEdit(modal.event)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(modal.event.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* View mode */}
            {modal.mode === 'view' && (
              <div className="p-6 space-y-4">
                {(modal.event.startTime || modal.event.endTime) && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold">
                      {modal.event.startTime && modal.event.startTime.slice(0,5)}
                      {modal.event.endTime && ` → ${modal.event.endTime.slice(0,5)}`}
                    </span>
                  </div>
                )}
                {modal.event.note && (
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-200">
                    {modal.event.note}
                  </div>
                )}
                {(isAdmin || modal.event.userId === currentUser.id) && (
                  <button
                    onClick={() => startEdit(modal.event)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={15} /> Chỉnh sửa sự kiện
                  </button>
                )}
              </div>
            )}

            {/* New / Edit mode */}
            {(modal.mode === 'new' || modal.mode === 'edit') && (
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-lg font-semibold border-0 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-2 text-slate-800 placeholder-slate-300 transition-colors bg-transparent"
                    placeholder="Thêm tiêu đề..."
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-400 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.startTime}
                      onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    />
                    <span className="text-slate-400 text-sm">→</span>
                    <input
                      type="time"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.endTime}
                      onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 placeholder-slate-400"
                    placeholder="Thêm ghi chú..."
                    rows={3}
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  />
                </div>

                {/* Color picker */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Màu sắc</div>
                  <div className="flex gap-2 flex-wrap">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c.key}
                        title={c.label}
                        onClick={() => setForm(f => ({ ...f, color: c.key }))}
                        className={`w-8 h-8 rounded-full ${c.bg} transition-all flex items-center justify-center
                          ${form.color === c.key ? 'ring-2 ring-offset-2 ' + c.ring + ' scale-110' : 'hover:scale-105 opacity-80'}`}
                      >
                        {form.color === c.key && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-semibold">
                    ⛔ {formError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? 'Đang lưu...' : (modal.mode === 'edit' ? <><Check size={15} /> Lưu thay đổi</> : <><Plus size={15} /> Tạo sự kiện</>)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TNCalendar;
