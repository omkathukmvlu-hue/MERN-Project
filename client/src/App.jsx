import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, GraduationCap, Users, BookOpen, ChartNoAxesColumn, Pencil, Trash2, X, Menu, RefreshCw, CheckCircle2, AlertCircle, Mail, Phone, Hash, Building2 } from "lucide-react";
import api from "./api.js";

const emptyForm = { name: "", rollNumber: "", email: "", department: "Information Technology", semester: "5", phone: "" };
const departments = ["Information Technology", "Computer Science", "Commerce", "Arts", "Science"];

function messageFrom(error) {
  return error?.response?.data?.message || (error.code === "ECONNABORTED" ? "Request timed out. Please try again." : "Could not connect to the server. Check that the backend is running.");
}

function StatCard({ icon: Icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function StudentModal({ initial, onClose, onSave, busy }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  useEffect(() => { setForm(initial || emptyForm); setErrors({}); }, [initial]);
  const change = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter at least 2 characters.";
    else if (!/^[a-zA-Z\s.'-]+$/.test(form.name.trim())) next.name = "Use letters, spaces, apostrophes, dots or hyphens.";
    if (!/^[a-zA-Z0-9/-]{1,20}$/.test(form.rollNumber.trim())) next.rollNumber = "Use up to 20 letters, numbers, / or -.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    if (!departments.includes(form.department)) next.department = "Select a department.";
    if (!Number.isInteger(Number(form.semester)) || Number(form.semester) < 1 || Number(form.semester) > 6) next.semester = "Choose semester 1–6.";
    if (form.phone.trim() && !/^[+0-9()\s-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    setErrors(next);
    if (!Object.keys(next).length) onSave({ ...form, name: form.name.trim(), rollNumber: form.rollNumber.trim().toUpperCase(), email: form.email.trim().toLowerCase(), semester: Number(form.semester), phone: form.phone.trim() });
  };
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-head"><div><span className="eyebrow">{initial? "STUDENT RECORD":"NEW RECORD"}</span><h2 id="modal-title">{initial ? "Edit student" : "Add a student"}</h2><p>Enter the student's academic and contact details.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    <form onSubmit={submit} noValidate><div className="form-grid">
      <label className="field full">Full name<input name="name" value={form.name} onChange={change} placeholder="e.g. Aditi Sharma" maxLength="80"/>{errors.name&&<small className="field-error">{errors.name}</small>}</label>
      <label className="field">Roll number<input name="rollNumber" value={form.rollNumber} onChange={change} placeholder="e.g. IT501" maxLength="20"/>{errors.rollNumber&&<small className="field-error">{errors.rollNumber}</small>}</label>
      <label className="field">Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="student@college.edu"/>{errors.email&&<small className="field-error">{errors.email}</small>}</label>
      <label className="field full">Department<select name="department" value={form.department} onChange={change}>{departments.map(d=><option key={d}>{d}</option>)}</select>{errors.department&&<small className="field-error">{errors.department}</small>}</label>
      <label className="field">Semester<select name="semester" value={form.semester} onChange={change}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>Semester {n}</option>)}</select>{errors.semester&&<small className="field-error">{errors.semester}</small>}</label>
      <label className="field">Phone (optional)<input name="phone" value={form.phone} onChange={change} placeholder="+91 98765 43210" maxLength="15"/>{errors.phone&&<small className="field-error">{errors.phone}</small>}</label>
    </div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy?"Saving…":initial?"Save changes":"Add student"}</button></div></form>
  </section></div>;
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const notify = useCallback((type, text) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  const loadStudents = useCallback(async (query = search, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/students", { params: { search: query } });
      setStudents(data);
    } catch (error) { notify("error", messageFrom(error)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, notify]);

  useEffect(() => { loadStudents(""); }, []); // initial API fetch

  const stats = useMemo(() => ({
    total: students.length,
    it: students.filter(s => s.department === "Information Technology").length,
    semester: students.filter(s => Number(s.semester) === 5).length,
    departments: new Set(students.map(s => s.department)).size
  }), [students]);

  const submitSearch = (e) => { e.preventDefault(); loadStudents(search); };
  const saveStudent = async (payload) => {
    setBusy(true);
    try {
      if (modal?.student?._id) {
        const { data } = await api.put(`/students/${modal.student._id}`, payload);
        notify("success", data.message);
      } else {
        const { data } = await api.post("/students", payload);
        notify("success", data.message);
      }
      setModal(null);
      await loadStudents(search, true);
    } catch (error) { notify("error", messageFrom(error)); }
    finally { setBusy(false); }
  };
  const deleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.name} (${student.rollNumber})? This action cannot be undone.`)) return;
    try {
      const { data } = await api.delete(`/students/${student._id}`);
      notify("success", data.message);
      await loadStudents(search, true);
    } catch (error) { notify("error", messageFrom(error)); }
  };

  const initials = (name = "") => name.split(" ").filter(Boolean).slice(0,2).map(s => s[0]).join("").toUpperCase();
  const colors = ["lavender", "mint", "peach", "blue"];
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><strong>CampusConnect</strong><span>SMART CAMPUS</span></div><button className="mobile-close icon-button" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="nav-label">WORKSPACE</div>
      <button className="nav-item active" onClick={()=>setMobileNav(false)}><ChartNoAxesColumn size={18}/> Overview</button>
      <button className="nav-item" onClick={()=>document.getElementById("students-table")?.scrollIntoView({behavior:"smooth"})}><Users size={18}/> Students <span className="nav-count">{students.length}</span></button>
      <button className="nav-item" onClick={()=>notify("info","Faculty management is planned as the next module.")}><BookOpen size={18}/> Academics</button>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Campus, simplified.</strong><p>One place to manage student records and academic details.</p></div><div className="profile-row"><div className="profile-avatar">AD</div><div><strong>Campus Admin</strong><span>Administrator</span></div><span className="online-dot"/></div></div>
    </aside>
    {mobileNav&&<div className="nav-scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="menu-button icon-button" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><span className="today-pill"><span className="status-dot"/> System workspace</span><div className="top-avatar">AD</div></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow">CAMPUS ADMINISTRATION</div><h1>Good day, Admin <span>✦</span></h1><p>Here's what's happening across your campus today.</p></div><button className="btn btn-primary" onClick={()=>setModal({student:null})}><Plus size={18}/> Add student</button></section>
        <section className="stats-grid">
          <StatCard icon={Users} label="Students in view" value={stats.total} note="Matching current search" tone="violet"/>
          <StatCard icon={GraduationCap} label="IT students" value={stats.it} note="Information Technology" tone="green"/>
          <StatCard icon={BookOpen} label="Semester 5" value={stats.semester} note="Students in semester five" tone="orange"/>
          <StatCard icon={Building2} label="Departments" value={stats.departments} note="Represented in results" tone="blue"/>
        </section>
        <section className="content-card" id="students-table">
          <div className="section-head"><div><h2>Student directory</h2><p>Manage student profiles and academic information.</p></div><button className="btn btn-outline refresh-btn" onClick={()=>{setRefreshing(true);loadStudents(search,true)}} disabled={refreshing}><RefreshCw size={15} className={refreshing?"spin":""}/> Refresh</button></div>
          <div className="table-toolbar"><form className="search-box" onSubmit={submitSearch}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, roll number or email…"/>{search&&<button type="button" aria-label="Clear search" onClick={()=>{setSearch("");loadStudents("");}}><X size={15}/></button>}<button className="search-submit" type="submit">Search</button></form><span className="result-count">{students.length} {students.length===1?"record":"records"}</span></div>
          <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>DEPARTMENT</th><th>SEMESTER</th><th>CONTACT</th><th className="action-heading">ACTIONS</th></tr></thead>
            <tbody>{loading?<tr><td colSpan="6"><div className="loading-state"><span className="spinner"/> Loading student records…</div></td></tr>:students.length===0?<tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><Users size={24}/></div><strong>No students found</strong><p>{search?"Try a different search term or clear your search.":"Add your first student to get started."}</p>{!search&&<button className="btn btn-primary" onClick={()=>setModal({student:null})}><Plus size={16}/> Add first student</button>}</div></td></tr>:students.map((s,i)=><tr key={s._id}><td><div className="student-cell"><div className={`student-avatar ${colors[i%colors.length]}`}>{initials(s.name)}</div><div><strong>{s.name}</strong><span>{s.email}</span></div></div></td><td><span className="roll-badge">{s.rollNumber}</span></td><td><span className="department-text">{s.department}</span></td><td><span className="semester-badge">Sem {s.semester}</span></td><td><div className="contact-cell"><Mail size={13}/><span>{s.email}</span></div>{s.phone&&<div className="contact-cell phone"><Phone size={13}/><span>{s.phone}</span></div>}</td><td><div className="action-buttons"><button className="action-btn edit" title="Edit student" aria-label={`Edit ${s.name}`} onClick={()=>setModal({student:{...s, semester:String(s.semester)}})}><Pencil size={15}/></button><button className="action-btn delete" title="Delete student" aria-label={`Delete ${s.name}`} onClick={()=>deleteStudent(s)}><Trash2 size={15}/></button></div></td></tr>)}</tbody>
          </table></div>
          <div className="table-footer"><span>Student records are stored in MongoDB.</span><span><span className="footer-dot"/> API connected when records load</span></div>
        </section>
        <footer className="page-footer"><span>© {new Date().getFullYear()} CampusConnect</span><span>Smart Campus Management System <span className="footer-separator">·</span> MERN Stack Project</span></footer>
      </div>
    </main>
    {modal&&<StudentModal initial={modal.student||emptyForm} onClose={()=>setModal(null)} onSave={saveStudent} busy={busy}/>}
    {toast&&<div className={`toast ${toast.type}`} role="status">{toast.type==="success"?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}<span>{toast.text}</span><button onClick={()=>setToast(null)} aria-label="Dismiss"><X size={16}/></button></div>}
  </div>;
}