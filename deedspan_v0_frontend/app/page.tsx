'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Flame,
  Goal,
  LayoutGrid,
  ListTodo,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'

const navItems = [
  { id: 'today', label: 'Today', icon: LayoutGrid },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'habits', label: 'Habits', icon: Flame },
  { id: 'journal', label: 'Journal', icon: BookOpen },
]

const initialTasks = [
  { id: 1, title: 'Review quarterly metrics', project: 'Work', time: '09:00', done: true },
  { id: 2, title: 'Draft product brief', project: 'Work', time: '10:30', done: false },
  { id: 3, title: 'Walk 30 minutes', project: 'Wellbeing', time: '13:00', done: false },
  { id: 4, title: 'Read chapter 4 of Atomic Habits', project: 'Learning', time: '20:00', done: false },
]

const initialHabits = [
  { id: 1, name: 'Morning movement', detail: '30 min · Every day', streak: 12, done: true },
  { id: 2, name: 'Deep work block', detail: '90 min · Weekdays', streak: 8, done: false },
  { id: 3, name: 'Read before bed', detail: '20 min · Every day', streak: 21, done: false },
]

const goals = [
  { title: 'Ship the new onboarding', area: 'Work', progress: 72, due: 'Due in 12 days', color: 'terracotta' },
  { title: 'Run a half marathon', area: 'Health', progress: 48, due: 'Due in 48 days', color: 'sage' },
  { title: 'Build a reading habit', area: 'Learning', progress: 81, due: 'Due in 23 days', color: 'ink' },
]

function formatDate() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(2026, 8, 7))
}

export default function Page() {
  const [active, setActive] = useState('today')
  const [tasks, setTasks] = useState(initialTasks)
  const [habits, setHabits] = useState(initialHabits)
  const [dark, setDark] = useState(true)
  const [mobileNav, setMobileNav] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [saved, setSaved] = useState(false)

  const completedTasks = tasks.filter((task) => task.done).length
  const completedHabits = habits.filter((habit) => habit.done).length
  const completion = Math.round(((completedTasks + completedHabits) / (tasks.length + habits.length)) * 100)

  const viewTitle = useMemo(() => navItems.find((item) => item.id === active)?.label ?? 'Today', [active])

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  }

  function toggleHabit(id: number) {
    setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, done: !habit.done } : habit))
  }

  function addTask() {
    if (!newTask.trim()) return
    setTasks((current) => [...current, { id: Date.now(), title: newTask.trim(), project: 'Personal', time: 'Anytime', done: false }])
    setNewTask('')
    setQuickAdd(false)
  }

  return (
    <div className={dark ? 'app-shell dark' : 'app-shell'}>
      <aside className={mobileNav ? 'sidebar mobile-open' : 'sidebar'}>
        <div className="brand"><div className="brand-mark">D</div><span>DeedSpan</span></div>
        <div className="workspace-label">Workspace</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(id); setMobileNav(false) }}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{id === 'today' && <span className="nav-count">{tasks.length - completedTasks}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={active === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => setActive('settings')}><Settings size={17} /><span>Settings</span></button>
          <div className="profile-card"><div className="avatar">AR</div><div><strong>Alex Rivera</strong><small>Personal space</small></div><MoreHorizontal size={16} /></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{viewTitle}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={17} /></button><button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="quick-add" onClick={() => setQuickAdd(true)}><Plus size={16} /> <span>Quick add</span></button></div></header>
        <div className="content-wrap">
          {active === 'today' && <Today tasks={tasks} habits={habits} completion={completion} toggleTask={toggleTask} toggleHabit={toggleHabit} setActive={setActive} />}
          {active === 'tasks' && <TasksView tasks={tasks} toggleTask={toggleTask} onAdd={() => setQuickAdd(true)} />}
          {active === 'goals' && <GoalsView />}
          {active === 'habits' && <HabitsView habits={habits} toggleHabit={toggleHabit} />}
          {active === 'journal' && <JournalView saved={saved} onSave={() => setSaved(true)} />}
          {active === 'settings' && <SettingsView dark={dark} setDark={setDark} />}
        </div>
      </main>

      {quickAdd && <div className="modal-backdrop" onClick={() => setQuickAdd(false)}><div className="quick-modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">Quick capture</span><h2>Add a task</h2></div><button className="icon-button" onClick={() => setQuickAdd(false)} aria-label="Close"><X size={17} /></button></div><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTask() }} placeholder="What needs your attention?" /><button className="primary-button" onClick={addTask}>Add to today <ArrowUpRight size={16} /></button></div></div>}
      <div className="mobile-nav">{navItems.slice(0, 4).map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><Icon size={18} /><span>{label}</span></button>)}</div>
    </div>
  )
}

function Today({ tasks, habits, completion, toggleTask, toggleHabit, setActive }: any) {
  return <>
    <section className="welcome-row"><div><span className="eyebrow">{formatDate()}</span><h1>Good morning, Alex.</h1><p className="subtitle">A clear mind makes room for meaningful work.</p></div><div className="daily-score"><div className="score-ring" style={{ '--score': `${completion * 3.6}deg` } as React.CSSProperties}><span>{completion}%</span></div><div><span className="eyebrow">Daily focus</span><strong>{completion >= 70 ? 'Strong start' : 'Finding rhythm'}</strong></div></div></section>
    <section className="focus-card"><div className="focus-copy"><span className="eyebrow">Focus for today</span><h2>Make space for the work that matters.</h2><p>Protect your attention by choosing one meaningful thing to move forward.</p><button className="text-button" onClick={() => setActive('goals')}>View your goals <ArrowUpRight size={15} /></button></div><div className="focus-orbit"><Sparkles size={22} /><span>One thing<br /><b>at a time</b></span></div></section>
    <div className="section-heading"><div><span className="eyebrow">Your day</span><h2>Today&apos;s rhythm</h2></div><button className="ghost-button" onClick={() => setActive('tasks')}>See all tasks <ArrowUpRight size={15} /></button></div>
    <div className="dashboard-grid"><section className="panel task-panel"><div className="panel-header"><div><h3>Tasks</h3><p>{tasks.filter((t: any) => !t.done).length} remaining</p></div><button className="circle-button" onClick={() => setActive('tasks')} aria-label="View tasks"><ChevronRight size={16} /></button></div><div className="task-list">{tasks.slice(0, 4).map((task: any) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}</div></section><section className="panel habit-panel"><div className="panel-header"><div><h3>Habits</h3><p>{habits.filter((h: any) => h.done).length} of {habits.length} complete</p></div><button className="circle-button" onClick={() => setActive('habits')} aria-label="View habits"><ChevronRight size={16} /></button></div><div className="habit-list">{habits.map((habit: any) => <HabitRow key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} />)}</div></section></div>
    <section className="lower-grid"><div className="panel progress-panel"><div className="panel-header"><div><h3>Weekly momentum</h3><p>Your consistency over the last 7 days</p></div><TrendingUp size={18} className="green-icon" /></div><div className="bars">{[42, 68, 55, 82, 74, 91, completion].map((height, i) => <div className="bar-col" key={i}><div className="bar" style={{ height: `${height}%` }}></div><span>{['M','T','W','T','F','S','S'][i]}</span></div>)}</div></div><div className="panel quote-panel"><span className="eyebrow">A note for you</span><p>“The secret of getting ahead is getting started.”</p><small>— Mark Twain</small></div></section>
  </>
}

function TaskRow({ task, onToggle }: any) { return <div className={task.done ? 'task-row done' : 'task-row'}><button className="check-button" onClick={onToggle} aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}>{task.done ? <Check size={14} /> : <Circle size={17} />}</button><div className="task-info"><strong>{task.title}</strong><small><span className={`project-dot ${task.project.toLowerCase()}`}></span>{task.project}</small></div><time>{task.time}</time></div> }
function HabitRow({ habit, onToggle }: any) { return <div className={habit.done ? 'habit-row done' : 'habit-row'}><button className="check-button" onClick={onToggle} aria-label={habit.done ? 'Mark incomplete' : 'Mark complete'}>{habit.done ? <Check size={14} /> : <Circle size={17} />}</button><div className="task-info"><strong>{habit.name}</strong><small>{habit.detail}</small></div><span className="streak"><Flame size={13} /> {habit.streak}</span></div> }
function TasksView({ tasks, toggleTask, onAdd }: any) { return <ViewHeader eyebrow="Task management" title="Tasks" description="Keep the small things moving toward the bigger picture." action="New task" onAction={onAdd}><div className="filter-row"><button className="filter active">All tasks <span>{tasks.length}</span></button><button className="filter">Today <span>{tasks.length}</span></button><button className="filter">Completed <span>{tasks.filter((t:any) => t.done).length}</span></button></div><div className="wide-panel task-list">{tasks.map((task: any) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}</div></ViewHeader> }
function GoalsView() { return <ViewHeader eyebrow="Long-term direction" title="Goals" description="Small steps, repeated with care, become remarkable progress." action="New goal"><div className="goal-grid">{goals.map((goal) => <div className="panel goal-card" key={goal.title}><div className={`goal-icon ${goal.color}`}><Goal size={18} /></div><span className="eyebrow">{goal.area}</span><h3>{goal.title}</h3><div className="progress-line"><div style={{ width: `${goal.progress}%` }}></div></div><div className="goal-meta"><strong>{goal.progress}%</strong><span>{goal.due}</span></div></div>)}</div></ViewHeader> }
function HabitsView({ habits, toggleHabit }: any) { return <ViewHeader eyebrow="Daily systems" title="Habits" description="Consistency is a practice, not a personality trait." action="New habit"><div className="wide-panel habit-list">{habits.map((habit:any) => <HabitRow key={habit.id} habit={habit} onToggle={() => toggleHabit(habit.id)} />)}</div><div className="panel habit-insight"><div className="insight-icon"><TrendingUp size={19} /></div><div><h3>Nice momentum</h3><p>Your current best is <strong>21 days</strong>. Keep showing up gently.</p></div></div></ViewHeader> }
function JournalView({ saved, onSave }: any) { const [entry, setEntry] = useState(''); return <ViewHeader eyebrow="Reflection space" title="Journal" description="Notice what is happening, then decide what comes next."><div className="journal-grid"><div className="panel journal-editor"><span className="eyebrow">{formatDate()}</span><h3>What is present for you today?</h3><textarea value={entry} onChange={(event) => setEntry(event.target.value)} placeholder="Start writing here..." /><div className="journal-footer"><span>{saved ? 'Saved just now' : 'Private by default'}</span><button className="primary-button small" onClick={onSave}><CheckCircle2 size={15} /> {saved ? 'Saved' : 'Save entry'}</button></div></div><div className="panel journal-prompt"><BookOpen size={20} /><h3>Go a little deeper</h3><p>What would make today feel like a day well spent?</p><button className="text-button">Use this prompt <ArrowUpRight size={15} /></button></div></div></ViewHeader> }
function SettingsView({ dark, setDark }: any) { return <ViewHeader eyebrow="Your preferences" title="Settings" description="Make DeedSpan feel like a place you want to return to."><div className="wide-panel settings-list"><div className="setting-row"><div><strong>Appearance</strong><small>Choose how DeedSpan looks on your screen.</small></div><button className="switch" onClick={() => setDark(!dark)} aria-label="Toggle appearance"><span className={dark ? 'on' : ''}></span>{dark ? 'Dark' : 'Light'}</button></div><div className="setting-row"><div><strong>Daily reminder</strong><small>A gentle nudge to review your day.</small></div><button className="switch"><span className="on"></span>9:00 AM</button></div><div className="setting-row"><div><strong>Week starts on</strong><small>Used for your weekly momentum view.</small></div><button className="outline-select">Monday <ChevronRight size={15} /></button></div></div></ViewHeader> }
function ViewHeader({ eyebrow, title, description, action, onAction, children }: any) { return <><section className="page-heading"><span className="eyebrow">{eyebrow}</span><div className="heading-line"><div><h1>{title}</h1><p className="subtitle">{description}</p></div>{action && <button className="primary-button" onClick={onAction}><Plus size={16} /> {action}</button>}</div></section>{children}</> }
