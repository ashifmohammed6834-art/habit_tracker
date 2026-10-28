import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, BarChart3, CalendarDays, Check, CheckCircle2, ChevronDown,
  CircleHelp, Flame, LayoutDashboard, LogOut, Menu, Plus, Search,
  Settings, Sparkles, Target, Trash2, TrendingUp, X, BookOpen, Dumbbell,
  Droplets, Brain, Moon, Pencil, Sun, Clock3, LockKeyhole, Mail, Eye, EyeOff
} from "lucide-react";

const initialHabits = [
  { id: 1, title: "Read for 20 minutes", category: "Learning", icon: "book", color: "purple", description: "Make time for a few pages every day.", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], logs: {} },
  { id: 2, title: "Drink 2L of water", category: "Health", icon: "water", color: "blue", description: "Stay hydrated throughout the day.", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], logs: {} },
  { id: 3, title: "Exercise", category: "Fitness", icon: "fitness", color: "orange", description: "Move your body and build strength.", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], logs: {} },
  { id: 4, title: "Meditate for 10 minutes", category: "Mindfulness", icon: "mind", color: "green", description: "Take a moment to reset your mind.", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], logs: {} },
  { id: 5, title: "Sleep before 11 PM", category: "Wellness", icon: "moon", color: "pink", description: "Keep a consistent sleep routine.", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], logs: {} }
];

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const weekday = (date = new Date()) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];
const readStored = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const icons = { book: BookOpen, water: Droplets, fitness: Dumbbell, mind: Brain, moon: Moon, activity: Activity };

function App() {
  const [user, setUser] = useState(() => readStored("dht-user", null));
  const [habits, setHabits] = useState(() => readStored("dht-habits", initialHabits));
  const [page, setPage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All habits");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [loginMode, setLoginMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const today = todayKey();

  useEffect(() => { localStorage.setItem("dht-habits", JSON.stringify(habits)); }, [habits]);
  useEffect(() => { if (user) localStorage.setItem("dht-user", JSON.stringify(user)); else localStorage.removeItem("dht-user"); }, [user]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const completed = habits.filter(h => h.logs?.[today]).length;
  const total = habits.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const filtered = useMemo(() => habits.filter(h =>
    h.title.toLowerCase().includes(query.toLowerCase()) &&
    (category === "All habits" || h.category === category)
  ), [habits, query, category]);

  function toggleHabit(id) {
    setHabits(old => old.map(h => h.id === id ? { ...h, logs: { ...h.logs, [today]: !h.logs?.[today] } } : h));
  }
  function saveHabit(data) {
    if (editing) {
      setHabits(old => old.map(h => h.id === editing.id ? { ...h, ...data } : h));
      setToast("Habit updated successfully");
    } else {
      setHabits(old => [...old, { ...data, id: Date.now(), logs: {} }]);
      setToast("New habit added");
    }
    setShowAdd(false); setEditing(null);
  }
  function deleteHabit(id) {
    if (!window.confirm("Delete this habit? Your saved history for this habit will also be removed from this browser.")) return;
    setHabits(old => old.filter(h => h.id !== id));
    setToast("Habit deleted");
  }
  function submitAuth(e) {
    e.preventDefault(); setFormError("");
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (!email || !password || (loginMode === "signup" && !name)) {
      setFormError("Please fill in all required fields."); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setFormError("Please enter a valid email address."); return; }
    if (password.length < 6) { setFormError("Use a password with at least 6 characters."); return; }
    if (loginMode === "signup") {
      const saved = readStored("dht-demo-accounts", []);
      if (saved.some(a => a.email === email)) { setFormError("An account with this email already exists in this browser."); return; }
      localStorage.setItem("dht-demo-accounts", JSON.stringify([...saved, { name, email, password }]));
      setUser({ name, email }); setToast("Welcome! Your demo account is ready.");
    } else {
      const saved = readStored("dht-demo-accounts", []);
      const account = saved.find(a => a.email === email && a.password === password);
      if (!account) { setFormError("Demo account not found. Sign up first, or use the demo access button."); return; }
      setUser({ name: account.name, email: account.email });
    }
  }

  if (!user) return <AuthScreen mode={loginMode} setMode={setLoginMode} onSubmit={submitAuth}
    showPassword={showPassword} setShowPassword={setShowPassword} error={formError}
    onDemo={() => { setUser({ name: "Ashif", email: "demo@example.com" }); setToast("Welcome to your demo dashboard"); }} />;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "My Habits", icon: CheckCircle2 },
    { label: "Progress", icon: BarChart3 },
    { label: "Settings", icon: Settings }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Activity size={22} strokeWidth={2.5} /></div>
          <div><strong>habitly</strong><span>DAILY HABIT TRACKER</span></div>
          <button className="icon-btn close-menu" aria-label="Close menu" onClick={() => setMobileMenu(false)}><X size={19}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setMobileMenu(false); }}>
              <Icon size={19}/><span>{label}</span>{label === "My Habits" && <span className="nav-count">{habits.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quote-card"><div className="quote-icon"><Sparkles size={18}/></div><strong>Small steps, big change.</strong><p>Consistency turns actions into habits.</p><div className="quote-dots"><i/><i/><i/><i/><i/></div></div>
          <button className="profile-row" onClick={() => setPage("Settings")}>
            <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || "A"}</div>
            <div className="profile-info"><strong>{user.name}</strong><span>Personal workspace</span></div><ChevronDown size={16} className="muted"/>
          </button>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-trigger" aria-label="Open menu" onClick={() => setMobileMenu(true)}><Menu size={21}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="topbar-right"><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</div><div className="avatar small">{user.name?.charAt(0)?.toUpperCase() || "A"}</div></div>
        </header>

        {page === "Dashboard" && <Dashboard user={user} habits={habits} completed={completed} total={total} percent={percent} today={today} toggleHabit={toggleHabit} setPage={setPage} setShowAdd={setShowAdd} setEditing={setEditing} />}
        {page === "My Habits" && <HabitsPage habits={filtered} query={query} setQuery={setQuery} category={category} setCategory={setCategory} toggleHabit={toggleHabit} today={today} onAdd={() => setShowAdd(true)} onEdit={h => {setEditing(h);setShowAdd(true);}} onDelete={deleteHabit} />}
        {page === "Progress" && <ProgressPage habits={habits} today={today} />}
        {page === "Settings" && <SettingsPage user={user} habits={habits} onLogout={() => { setUser(null); setPage("Dashboard"); }} onReset={() => { if(window.confirm("Reset all habits and their history?")) { setHabits(initialHabits); setToast("Habit data reset"); } }} />}
      </main>
      {showAdd && <HabitModal initial={editing} onClose={() => {setShowAdd(false);setEditing(null);}} onSave={saveHabit} />}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function AuthScreen({ mode, setMode, onSubmit, showPassword, setShowPassword, error, onDemo }) {
  return <div className="auth-layout">
    <div className="auth-art">
      <div className="auth-brand"><div className="brand-mark"><Activity size={22}/></div><strong>habitly</strong></div>
      <div className="art-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR DAILY COMPANION</div><h1>Become 1% better, <em>every day.</em></h1><p>Build meaningful routines, celebrate small wins, and create a life you love — one habit at a time.</p>
        <div className="art-stats"><div><strong>21<span>+</span></strong><small>Days to build momentum</small></div><div><strong>1.5<span>k</span></strong><small>Habits completed today</small></div></div>
      </div>
      <div className="art-bottom"><span>“We are what we repeatedly do.”</span><small>— Aristotle</small></div>
      <div className="art-orb orb-one"/><div className="art-orb orb-two"/>
    </div>
    <div className="auth-panel">
      <div className="auth-mobile-brand"><div className="brand-mark"><Activity size={22}/></div><strong>habitly</strong></div>
      <div className="auth-form-wrap">
        <div className="auth-heading"><span className="eyebrow">WELCOME {mode === "login" ? "BACK" : "ABOARD"}</span><h2>{mode === "login" ? "Good to see you." : "Create your account."}</h2><p>{mode === "login" ? "Enter your details to continue your journey." : "Start building a better routine today."}</p></div>
        <form onSubmit={onSubmit} className="auth-form">
          {mode === "signup" && <label>Full name<div className="input-wrap"><span className="input-icon"> <Activity size={17}/> </span><input name="name" placeholder="Your name" autoComplete="name" required /></div></label>}
          <label>Email address<div className="input-wrap"><Mail size={17} className="input-icon"/><input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div></label>
          <label>Password<div className="input-wrap"><LockKeyhole size={17} className="input-icon"/><input name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength="6"/><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
          {mode === "login" && <div className="forgot-row"><span>Keep your progress going</span><span className="soft-label">Demo mode</span></div>}
          {error && <div className="form-error">{error}</div>}
          <button className="primary-btn auth-submit" type="submit">{mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
        </form>
        <div className="auth-switch">{mode === "login" ? "New to habitly?" : "Already have an account?"} <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button></div>
        <div className="auth-divider"><span>OR</span></div>
        <button className="demo-btn" onClick={onDemo}><Sparkles size={17}/> Explore with demo access</button>
        <p className="auth-note">This prototype stores demo data in this browser only. Do not use a real password.</p>
      </div>
      <div className="auth-footer">© 2026 habitly <span>Made for your next chapter</span></div>
    </div>
  </div>;
}

function Dashboard({ user, habits, completed, total, percent, today, toggleHabit, setPage, setShowAdd, setEditing }) {
  const remaining = total - completed;
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
  const bestStreak = Math.max(0, ...habits.map(h => streakFor(h)));
  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL SPACE</div><h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user.name.split(" ")[0]} <span className="wave">✦</span></h1><p>Every small step counts. Let's make today a good one.</p></div><button className="primary-btn add-main" onClick={() => setShowAdd(true)}><Plus size={18}/> Add new habit</button></div>
    <div className="daily-banner"><div className="banner-icon"><Sun size={23}/></div><div className="banner-copy"><strong>Today is a fresh start</strong><span>{todayLabel} · Show up for yourself, even in small ways.</span></div><div className="banner-progress"><div className="banner-progress-label"><span>Daily progress</span><strong>{percent}%</strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div></div></div>
    <div className="stats-grid">
      <StatCard icon={Target} tone="purple" label="Total habits" value={total} note="Your daily commitments" />
      <StatCard icon={CheckCircle2} tone="green" label="Completed today" value={completed} note={`${total ? Math.round(completed/total*100) : 0}% of today's habits`} />
      <StatCard icon={Clock3} tone="orange" label="Still to do" value={remaining} note={remaining ? "One step at a time" : "You're all caught up!"} />
      <StatCard icon={Flame} tone="pink" label="Best current streak" value={`${bestStreak} day${bestStreak === 1 ? "" : "s"}`} note="Keep the momentum going" />
    </div>
    <div className="section-heading"><div><h2>Today's habits</h2><p>A little progress is still progress.</p></div><button className="text-btn" onClick={() => setPage("My Habits")}>View all habits <span>→</span></button></div>
    <div className="habit-list">
      {habits.length === 0 && <EmptyState onAdd={() => setShowAdd(true)} />}
      {habits.slice(0,5).map(h => <HabitRow key={h.id} habit={h} today={today} onToggle={() => toggleHabit(h.id)} onEdit={() => {setEditing(h);setShowAdd(true);}} compact />)}
    </div>
    <div className="bottom-grid">
      <div className="panel weekly-panel"><div className="panel-heading"><div><h3>This week</h3><p>Your daily consistency at a glance</p></div><span className="panel-icon"><BarChart3 size={18}/></span></div><WeeklyChart habits={habits}/></div>
      <div className="panel tip-panel"><div className="tip-spark"><Sparkles size={20}/></div><div className="eyebrow">A GENTLE REMINDER</div><h3>Make it easy to begin.</h3><p>Don't focus on doing everything perfectly. Focus on showing up consistently, even if it's just for two minutes.</p><div className="tip-footer"><span>Today's mindset</span><span className="tip-dot"/></div></div>
    </div>
    <footer className="page-footer">Made for your growth, one day at a time <span>✦</span></footer>
  </div>;
}

function StatCard({ icon: Icon, tone, label, value, note }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
function HabitRow({ habit, today, onToggle, onEdit, compact=false, onDelete }) {
  const Icon = icons[habit.icon] || Activity;
  const done = Boolean(habit.logs?.[today]);
  return <div className={`habit-row ${done ? "habit-done" : ""}`}>
    <button className={`habit-check ${done ? "checked" : ""}`} onClick={onToggle} aria-label={done ? "Mark as incomplete" : "Mark as complete"}>{done && <Check size={17}/>}</button>
    <div className={`habit-icon ${habit.color}`}><Icon size={20}/></div>
    <div className="habit-main"><strong>{habit.title}</strong><span>{habit.description || habit.category}</span></div>
    <span className={`category-pill ${habit.color}`}>{habit.category}</span>
    <div className="habit-streak"><Flame size={15}/><strong>{streakFor(habit)}</strong><span>day streak</span></div>
    <div className="habit-actions"><button className="icon-btn" aria-label="Edit habit" onClick={onEdit}><Pencil size={16}/></button>{onDelete && <button className="icon-btn danger" aria-label="Delete habit" onClick={onDelete}><Trash2 size={16}/></button>}</div>
    {!compact && <span className={`status-pill ${done ? "done" : ""}`}>{done ? "Completed" : "Pending"}</span>}
  </div>;
}
function streakFor(habit) {
  let count = 0; const d = new Date();
  if (!habit.logs) return 0;
  // Count consecutive calendar days back from today, allowing today's check-in to be pending.
  if (!habit.logs[todayKey()]) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (habit.logs[key]) count++; else break;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
function WeeklyChart({ habits }) {
  const days = [];
  for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days.push(d); }
  return <div className="weekly-chart">{days.map(d => {
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const count=habits.filter(h=>h.logs?.[key]).length;
    const height=habits.length ? Math.max(count ? 12 : 4, Math.round(count/habits.length*100)) : 4;
    return <div className="chart-day" key={key}><div className="chart-bar-wrap"><div className={`chart-bar ${key===todayKey()?"today-bar":""}`} style={{height:`${height}%`}} title={`${count} completed`}/></div><span>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]}</span></div>;
  })}</div>;
}
function HabitsPage({ habits, query, setQuery, category, setCategory, toggleHabit, today, onAdd, onEdit, onDelete }) {
  const categories = ["All habits", "Learning", "Health", "Fitness", "Mindfulness", "Wellness", "Personal"];
  return <div className="page-content"><div className="welcome-row"><div><div className="eyebrow">YOUR ROUTINES</div><h1>My habits</h1><p>Manage your routines and keep your promises to yourself.</p></div><button className="primary-btn add-main" onClick={onAdd}><Plus size={18}/> Add new habit</button></div>
    <div className="list-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search habits..." /></div><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter category">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="habits-summary"><span><strong>{habits.length}</strong> habits found</span><span><i className="legend-dot"/> Completed today</span></div>
    <div className="habit-list full-habit-list">{habits.map(h=><HabitRow key={h.id} habit={h} today={today} onToggle={()=>toggleHabit(h.id)} onEdit={()=>onEdit(h)} onDelete={()=>onDelete(h.id)} />)}{habits.length===0&&<div className="empty-state"><div className="empty-icon"><Search size={22}/></div><h3>No habits found</h3><p>Try another search or add a new habit.</p><button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add a habit</button></div>}</div>
  </div>;
}
function ProgressPage({ habits, today }) {
  const completed = habits.filter(h=>h.logs?.[today]).length;
  const totalLogs = habits.reduce((sum,h)=>sum+Object.values(h.logs||{}).filter(Boolean).length,0);
  const best = Math.max(0,...habits.map(streakFor));
  const days = [];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;days.push({d,key,count:habits.filter(h=>h.logs?.[key]).length});}
  return <div className="page-content"><div className="welcome-row"><div><div className="eyebrow">YOUR GROWTH JOURNEY</div><h1>Progress & insights</h1><p>Celebrate how far you've come, one check-in at a time.</p></div><div className="date-chip"><TrendingUp size={16}/> Your overview</div></div>
    <div className="stats-grid progress-stats"><StatCard icon={CheckCircle2} tone="green" label="Completed today" value={completed} note="Habits checked off today"/><StatCard icon={Activity} tone="purple" label="Total check-ins" value={totalLogs} note="All recorded completions"/><StatCard icon={Flame} tone="orange" label="Best current streak" value={`${best} days`} note="Keep building consistency"/><StatCard icon={Target} tone="blue" label="Active habits" value={habits.length} note="Routines in your list"/></div>
    <div className="panel progress-panel"><div className="panel-heading"><div><h3>Last 14 days</h3><p>Completed habits by day</p></div><span className="panel-icon"><BarChart3 size={18}/></span></div><div className="history-chart">{days.map(({d,key,count})=><div className="history-day" key={key}><strong>{count}</strong><div className="history-track"><div className="history-fill" style={{height:`${habits.length?count/habits.length*100:0}%`}}/></div><span>{d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>)}</div><div className="chart-legend"><i/> Completed habits</div></div>
    <div className="panel habit-breakdown"><div className="panel-heading"><div><h3>Habit breakdown</h3><p>See how each routine is going</p></div></div>{habits.map(h=>{const count=Object.values(h.logs||{}).filter(Boolean).length;return <div className="breakdown-row" key={h.id}><div><strong>{h.title}</strong><span>{count} total check-ins</span></div><div className="breakdown-track"><div style={{width:`${Math.min(100,count*10)}%`}}/></div><strong className="breakdown-number">{count}</strong></div>})}{!habits.length&&<p className="muted">Add a habit to start seeing your progress.</p>}</div>
  </div>;
}
function SettingsPage({ user, habits, onLogout, onReset }) {
  return <div className="page-content"><div className="welcome-row"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p>Manage your profile and your habit tracker data.</p></div></div>
    <div className="settings-grid"><div className="panel settings-panel"><div className="panel-heading"><div><h3>Profile</h3><p>Your personal workspace details</p></div><span className="panel-icon"><Activity size={18}/></span></div><div className="settings-profile"><div className="avatar large">{user.name?.charAt(0)?.toUpperCase()||"A"}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div><div className="setting-line"><div><strong>Display name</strong><span>Name shown around the app</span></div><strong>{user.name}</strong></div><div className="setting-line"><div><strong>Habits saved</strong><span>Your current active routines</span></div><strong>{habits.length}</strong></div></div>
      <div className="panel settings-panel"><div className="panel-heading"><div><h3>Data & privacy</h3><p>Prototype storage options</p></div><span className="panel-icon"><LockKeyhole size={18}/></span></div><div className="notice-box"><CircleHelp size={18}/><p>Your data is stored in this browser using local storage. It is not synced across devices and this demo does not provide secure server authentication.</p></div><button className="setting-action" onClick={onReset}><span><strong>Reset habit data</strong><small>Restore the sample habits and clear progress</small></span><Trash2 size={17}/></button><button className="setting-action logout-action" onClick={onLogout}><span><strong>Sign out</strong><small>Return to the login screen</small></span><LogOut size={17}/></button></div></div>
  </div>;
}
function HabitModal({ initial, onClose, onSave }) {
  const [title,setTitle]=useState(initial?.title||"");
  const [description,setDescription]=useState(initial?.description||"");
  const [category,setCategory]=useState(initial?.category||"Personal");
  const [icon,setIcon]=useState(initial?.icon||"activity");
  const [color,setColor]=useState(initial?.color||"purple");
  const [error,setError]=useState("");
  function submit(e){e.preventDefault();if(!title.trim()){setError("Please enter a habit name.");return;}onSave({title:title.trim(),description:description.trim(),category,icon,color,days:initial?.days||["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],logs:initial?.logs||{}});}
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="habit-modal-title"><div className="modal-header"><div><span className="eyebrow">{initial?"REFINE YOUR ROUTINE":"MAKE IT A HABIT"}</span><h2 id="habit-modal-title">{initial?"Edit habit":"Add a new habit"}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div><form onSubmit={submit} className="modal-form"><label>Habit name<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Read for 20 minutes" maxLength={70}/></label><label>Description <span className="optional">(optional)</span><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What does this habit mean to you?" rows="3" maxLength={180}/></label><div className="form-two-col"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{["Personal","Learning","Health","Fitness","Mindfulness","Wellness"].map(c=><option key={c}>{c}</option>)}</select></label><label>Icon<select value={icon} onChange={e=>setIcon(e.target.value)}><option value="activity">Activity</option><option value="book">Reading</option><option value="water">Water</option><option value="fitness">Fitness</option><option value="mind">Mindfulness</option><option value="moon">Sleep</option></select></label></div><label>Choose a color</label><div className="color-options">{["purple","blue","orange","green","pink"].map(c=><button type="button" key={c} className={`color-option ${c} ${color===c?"selected":""}`} onClick={()=>setColor(c)} aria-label={`${c} color`}>{color===c&&<Check size={16}/>}</button>)}</div>{error&&<div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Check size={17}/>{initial?"Save changes":"Create habit"}</button></div></form></div></div>;
}
function EmptyState({ onAdd }) {
  return <div className="empty-state"><div className="empty-icon"><Target size={22}/></div><h3>Your habit journey starts here</h3><p>Add a habit you want to make part of your everyday life.</p><button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add your first habit</button></div>;
}

export default App;