import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor, 
  useDroppable, 
  useDraggable,
  TouchSensor
} from '@dnd-kit/core';
import { 
  Briefcase, 
  Search, 
  Plus, 
  X, 
  CheckSquare, 
  Square, 
  Download, 
  Upload, 
  Calendar, 
  ArrowUpDown, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

// ==========================================
// 1. NATIVE INDEXEDDB WRAPPER
// ==========================================
const DB_NAME = 'JobCommandCenterDB';
const DB_VERSION = 1;
const STORE_NAME = 'applications';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const dbAccess = {
  async getAll() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async put(item) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  async delete(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  async clearAll() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// ==========================================
// 2. CONCRETE DESIGN SYSTEM AND STICKER PALETTE
// ==========================================
const COLUMNS = [
  { id: 'wishlist', label: 'Wishlist', bgLight: '#f1f5f9', bgDark: '#1e293b', borderLight: '#cbd5e1', borderDark: '#334155', textLight: '#334155', textDark: '#f1f5f9' },
  { id: 'applied', label: 'Applied', bgLight: '#eff6ff', bgDark: '#1e3a8a', borderLight: '#bfdbfe', borderDark: '#172554', textLight: '#1e40af', textDark: '#dbeafe' },
  { id: 'follow-up', label: 'Follow-up', bgLight: '#fffbeb', bgDark: '#451a03', borderLight: '#fde68a', borderDark: '#78350f', textLight: '#92400e', textDark: '#fef3c7' },
  { id: 'interview', label: 'Interviewing', bgLight: '#faf5ff', bgDark: '#2e1065', borderLight: '#e9d5ff', borderDark: '#4c1d95', textLight: '#6b21a8', textDark: '#f3e8ff' },
  { id: 'offer', label: 'Offer Received', bgLight: '#ecfdf5', bgDark: '#064e3b', borderLight: '#a7f3d0', borderDark: '#022c22', textLight: '#065f46', textDark: '#d1fae5' },
  { id: 'rejected', label: 'Archived / Rejected', bgLight: '#fff5f5', bgDark: '#4c0519', borderLight: '#feb2b2', borderDark: '#881337', textLight: '#9b2c2c', textDark: '#ffe4e6' }
];

const INTERVIEW_ROUND_TYPES = ['none', 'screening', 'technical', 'manager', 'system-design', 'hr'];
const RESUME_VARIANTS = ['General Tech', 'Frontend Specialized', 'Fullstack Core', 'Staff / Lead Archetype'];

// UI FIX 2: Aggressive monochromatic shifting colors using absolute hex levels
const getInterviewStyles = (roundNumber, isDark) => {
  const round = roundNumber || 1;
  if (isDark) {
    switch (round) {
      case 1: return { bg: '#1e1b4b', border: '#312e81', text: '#ddd6fe' }; // Very faint midnight violet
      case 2: return { bg: '#2e1065', border: '#4c1d95', text: '#e9d5ff' };
      case 3: return { bg: '#4c1d95', border: '#6b21a8', text: '#f3e8ff' };
      case 4: return { bg: '#581c87', border: '#86198f', text: '#fae8ff' };
      case 5: return { bg: '#701a75', border: '#a21caf', text: '#ffffff' };
      case 6: return { bg: '#a21caf', border: '#d946ef', text: '#ffffff' }; // Hyper-saturated explosive violet
      default: return { bg: '#1e1b4b', border: '#312e81', text: '#ddd6fe' };
    }
  }

  // Light Mode High-Contrast Incremental Ramp
  switch (round) {
    case 1: return { bg: '#fbf7ff', border: '#f3e8ff', text: '#6b21a8' }; // Soft lavender tint
    case 2: return { bg: '#f5e6ff', border: '#e8ccff', text: '#581c87' };
    case 3: return { bg: '#e8b8ff', border: '#d699ff', text: '#4c1d95' };
    case 4: return { bg: '#d488ff', border: '#be55ff', text: '#2e1065' };
    case 5: return { bg: '#c055ff', border: '#a81eff', text: '#ffffff' };
    case 6: return { bg: '#8a00e6', border: '#6600b3', text: '#ffffff' }; // Fully saturated dark plum violet
    default: return { bg: '#fbf7ff', border: '#f3e8ff', text: '#6b21a8' };
  }
};

// ==========================================
// 3. STATE CONTEXT PROVIDER (JobProvider)
// ==========================================
const JobContext = createContext(null);

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbAccess.getAll()
      .then((data) => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error hydrating state from IndexedDB:', err);
        setLoading(false);
      });
  }, []);

  const addJob = async (jobData) => {
    const newJob = {
      id: crypto.randomUUID(),
      companyName: jobData.companyName || 'New Entity',
      jobTitle: jobData.jobTitle || 'Software Engineer',
      linkedinUrl: jobData.linkedinUrl || '',
      resumeUsed: jobData.resumeUsed || RESUME_VARIANTS[0],
      dateApplied: jobData.dateApplied || new Date().toISOString().split('T')[0],
      salaryRange: jobData.salaryRange || '',
      notes: jobData.notes || '',
      status: jobData.status || 'wishlist',
      interviewRoundType: jobData.interviewRoundType || 'none',
      interviewRoundNumber: parseInt(jobData.interviewRoundNumber || 0, 10),
      prepChecklist: jobData.prepChecklist || [],
      lastStatusChangeDate: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);
    await dbAccess.put(newJob);
  };

  const updateJob = async (id, updatedFields) => {
    let oldJob;
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        oldJob = job;
        const modified = { ...job, ...updatedFields };
        if (updatedFields.status && updatedFields.status !== job.status) {
          modified.lastStatusChangeDate = new Date().toISOString();
        }
        return modified;
      }
      return job;
    }));

    const currentJobs = await dbAccess.getAll();
    const targeted = currentJobs.find(j => j.id === id) || oldJob;
    if (targeted) {
      const saveTarget = { ...targeted, ...updatedFields };
      if (updatedFields.status && updatedFields.status !== targeted.status) {
        saveTarget.lastStatusChangeDate = new Date().toISOString();
      }
      await dbAccess.put(saveTarget);
    }
  };

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(job => job.id !== id));
    await dbAccess.delete(id);
  };

  const importBackup = async (fullData) => {
    await dbAccess.clearAll();
    for (const item of fullData) {
      await dbAccess.put(item);
    }
    setJobs(fullData);
  };

  return (
    <JobContext.Provider value={{ jobs, loading, addJob, updateJob, deleteJob, importBackup }}>
      {children}
    </JobContext.Provider>
  );
}

const useJobs = () => useContext(JobContext);

// ==========================================
// 4. KANBAN COMPONENTS (DND-KIT)
// ==========================================
function DraggableCard({ job, onClick, isDark }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const isInterviewLane = job.status === 'interview';
  const laneConfig = COLUMNS.find(c => c.id === job.status) || COLUMNS[0];

  // Resolve absolute style color maps 
  const cardColors = isInterviewLane 
    ? getInterviewStyles(job.interviewRoundNumber, isDark)
    : {
        bg: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        text: isDark ? '#f1f5f9' : '#1e293b'
      };

  // UI FIX 1: Explicitly map sticker hex variables matching parent columns 1:1
  const badgeColors = isInterviewLane
    ? getInterviewStyles(job.interviewRoundNumber, isDark)
    : {
        bg: isDark ? laneConfig.bgDark : laneConfig.bgLight,
        border: isDark ? laneConfig.borderDark : laneConfig.borderLight,
        text: isDark ? laneConfig.textDark : laneConfig.textLight
      };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: cardColors.bg,
        borderColor: cardColors.border,
        color: cardColors.text
      }}
      {...attributes}
      {...listeners}
      className={`group relative p-4 mb-3.5 rounded-xl border text-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'opacity-40 scale-95 shadow-none' : 'shadow-xs hover:shadow-md'}`}
    >
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <div className="font-bold text-base tracking-tight truncate max-w-[85%]">
          {job.companyName}
        </div>
        <div className="text-slate-400 opacity-60 group-hover:opacity-100 p-0.5">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 100 4h2a2 2 0 100-4H7zm0 6a2 2 0 100 4h2a2 2 0 100-4H7zm0 6a2 2 0 100 4h2a2 2 0 100-4H7zM11 4a2 2 0 114 0h-4zm0 6a2 2 0 114 0h-4zm0 6a2 2 0 114 0h-4z" />
          </svg>
        </div>
      </div>

      <div style={{ color: isDark ? '#94a3b8' : '#475569' }} className="font-medium mb-3 truncate text-xs sm:text-sm">
        {job.jobTitle}
      </div>

      {/* FIXED STICKERS COMPONENT CONTAINER */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        <div 
          style={{
            backgroundColor: badgeColors.bg,
            borderColor: badgeColors.border,
            color: badgeColors.text
          }}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border"
        >
          {isInterviewLane ? (
            <span>Rd {job.interviewRoundNumber || 1}: {job.interviewRoundType !== 'none' ? job.interviewRoundType : 'SCREENING'}</span>
          ) : (
            <span>{laneConfig.label}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-slate-100/60 dark:border-slate-700/60 text-xs text-slate-400" onClick={(e) => e.stopPropagation()}>
        <span className="flex items-center gap-1 font-mono font-medium">
          <Calendar className="w-3.5 h-3.5" /> {job.dateApplied}
        </span>
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => {
            e.stopPropagation();
            onClick(job);
          }}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({ column, jobs, onCardClick, sortOrder, onToggleSort, isDark }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const dateA = new Date(a.dateApplied).getTime();
      const dateB = new Date(b.dateApplied).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [jobs, sortOrder]);

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-[20rem] rounded-2xl border h-[calc(100vh-16rem)] transition-colors duration-200 ${
        isOver 
          ? 'bg-slate-100 dark:bg-slate-800/80 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950/50' 
          : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <span 
            style={{
              backgroundColor: isDark ? column.bgDark : column.bgLight,
              borderColor: isDark ? column.borderDark : column.borderLight,
              color: isDark ? column.textDark : column.textLight
            }}
            className="px-3 py-1 rounded-lg font-bold text-sm sm:text-base tracking-tight border"
          >
            {column.label}
          </span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-black px-2 py-0.5 rounded-md">
            {sortedJobs.length}
          </span>
        </div>
        
        <button
          onClick={() => onToggleSort(column.id)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto min-h-0">
        {sortedJobs.map(job => (
          <DraggableCard key={job.id} job={job} onClick={onCardClick} isDark={isDark} />
        ))}
        {sortedJobs.length === 0 && (
          <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic font-medium">
            Drop entries here
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. INTERACTIVE SLIDE OVER PANEL
// ==========================================
function EditSlideOver({ job, onClose }) {
  const { updateJob, deleteJob } = useJobs();
  const [formData, setFormData] = useState({ ...job });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    if (job) setFormData({ ...job });
  }, [job]);

  if (!job) return null;

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateJob(job.id, { [field]: value });
  };

  const handleChecklistToggle = (itemId) => {
    const freshChecklist = formData.prepChecklist.map(t => 
      t.id === itemId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    handleChange('prepChecklist', freshChecklist);
  };

  const addChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      task: newChecklistItem.trim(),
      isCompleted: false
    };
    handleChange('prepChecklist', [...(formData.prepChecklist || []), newItem]);
    setNewChecklistItem('');
  };

  const removeChecklistItem = (itemId) => {
    const filtered = formData.prepChecklist.filter(t => t.id !== itemId);
    handleChange('prepChecklist', filtered);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 dark:border-slate-800">
          
          <div className="p-4 bg-slate-900 dark:bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm tracking-wide uppercase">Workspace Record</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Company Entity</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Engineering Role</label>
              <input 
                type="text" 
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pipeline State</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {COLUMNS.map(col => (
                    <option key={col.id} value={col.id}>{col.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Execution Window</label>
                <input 
                  type="date" 
                  value={formData.dateApplied}
                  onChange={(e) => handleChange('dateApplied', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Round Mechanics</label>
                <select
                  value={formData.interviewRoundType}
                  onChange={(e) => handleChange('interviewRoundType', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {INTERVIEW_ROUND_TYPES.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Round Counter</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.interviewRoundNumber}
                  onChange={(e) => handleChange('interviewRoundNumber', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">LinkedIn Listing URL</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://linkedin.com/..."
                  value={formData.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formData.linkedinUrl && (
                  <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md bg-slate-50 dark:bg-slate-800">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Asset Target Variant</label>
                <select
                  value={formData.resumeUsed}
                  onChange={(e) => handleChange('resumeUsed', e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RESUME_VARIANTS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Compensation Index</label>
                <input 
                  type="text" 
                  placeholder="e.g., ₹25-30 LPA"
                  value={formData.salaryRange}
                  onChange={(e) => handleChange('salaryRange', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recruiter Log Notes</label>
              <textarea 
                rows="3"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Log internal historical updates here..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technical Prep Checklist</label>
              
              <form onSubmit={addChecklistItem} className="flex gap-2 mb-3">
                <input 
                  type="text"
                  placeholder="Add target assignment or module..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="px-3 py-1.5 bg-slate-800 dark:bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-slate-700 dark:hover:bg-indigo-700 cursor-pointer">
                  Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {formData.prepChecklist?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 group/item">
                    <button 
                      type="button" 
                      onClick={() => handleChecklistToggle(item.id)}
                      className="flex items-center gap-2 text-left text-xs text-slate-700 dark:text-slate-300 flex-1 cursor-pointer"
                    >
                      {item.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      )}
                      <span className={item.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}>{item.task}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!formData.prepChecklist || formData.prepChecklist.length === 0) && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No custom checklist tasks loaded.</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if(confirm('Confirm complete operational deletion of this record?')) {
                  deleteJob(job.id);
                  onClose();
                }
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-900 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
            >
              Purge Entry
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md transition-all cursor-pointer">
              Commit & Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN WORKSPACE DASHBOARD COMPONENT
// ==========================================
export default function JobInterviewCommandCenter() {
  const { jobs, loading, addJob, updateJob, importBackup } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDrawerJob, setActiveDrawerJob] = useState(null);
  
  // UI FIX 1: Bulletproof forced fallback local storage initializer
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.className = 'dark';
      root.style.backgroundColor = '#020617'; // Hard override dark sheet
      localStorage.setItem('theme', 'dark');
    } else {
      root.className = '';
      root.style.backgroundColor = '#f8fafc'; // Hard override light sheet
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [columnSortOrders, setColumnSortOrders] = useState({
    'wishlist': 'newest',
    'applied': 'newest',
    'follow-up': 'newest',
    'interview': 'newest',
    'offer': 'newest',
    'rejected': 'newest'
  });

  const toggleColumnSort = (colId) => {
    setColumnSortOrders(prev => ({
      ...prev,
      [colId]: prev[colId] === 'newest' ? 'oldest' : 'newest'
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const metrics = useMemo(() => {
    const total = jobs.length;
    const activePipeline = jobs.filter(j => ['applied', 'follow-up', 'interview'].includes(j.status)).length;
    const interviewing = jobs.filter(j => j.status === 'interview').length;
    const offers = jobs.filter(j => j.status === 'offer').length;
    
    let winRate = 0;
    if (total > 0) {
      const rejectedCount = jobs.filter(j => j.status === 'rejected').length;
      winRate = (offers + rejectedCount) > 0 ? Math.round((offers / (offers + rejectedCount)) * 100) : 0;
    }

    return { total, activePipeline, interviewing, offers, winRate };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const norm = searchTerm.toLowerCase().trim();
    if (!norm) return jobs;
    return jobs.filter(j => 
      j.companyName.toLowerCase().includes(norm) || 
      j.jobTitle.toLowerCase().includes(norm) ||
      (j.notes && j.notes.toLowerCase().includes(norm))
    );
  }, [jobs, searchTerm]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id;
    const nextStatus = over.id;

    const matchedJob = jobs.find(j => j.id === jobId);
    if (matchedJob && matchedJob.status !== nextStatus) {
      updateJob(jobId, { status: nextStatus });
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `interview_snapshot_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const targetedFile = e.target.files[0];
    if (!targetedFile) return;

    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          if (confirm('This action overwrites your data completely. Proceed?')) {
            await importBackup(parsed);
          }
        } else {
          alert('Error: File formatting structure does not conform to system blueprint.');
        }
      } catch (err) {
        alert('Critical syntax parse error reading file.');
      }
    };
    fileReader.readAsText(targetedFile);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm tracking-widest">
        INITIALIZING SECURE INDEXED_DB TRANSACTION SPACE...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-200">
      
      {/* Header panel component */}
      <header className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 dark:border-slate-800/80 shadow-md transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-500/20">
            <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-200 uppercase">
              Command Center
            </h1>
            <p className="text-[11px] font-mono text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mt-0.5 font-bold">
              Local-First Sandbox Environment
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 dark:border-slate-800 cursor-pointer transition-all"
            title="Toggle Visual Environment Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search index target logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 dark:bg-slate-900 text-slate-100 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={() => addJob({ companyName: 'New Entity', jobTitle: 'Software Engineer', status: 'wishlist' })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Initialize Application
          </button>

          <div className="flex items-center gap-2 border-l border-slate-700 dark:border-slate-800 pl-3">
            <button
              onClick={handleExportData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-sm transition-colors cursor-pointer border border-transparent dark:border-slate-800"
              title="Export Snapshot JSON"
            >
              <Download className="w-5 h-5" />
            </button>
            <label
              className="p-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-sm cursor-pointer transition-colors border border-transparent dark:border-slate-800"
              title="Import Snapshot JSON"
            >
              <Upload className="w-5 h-5" />
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>
      </header>

      {/* Metrics Row Matrix */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 grid grid-cols-2 sm:grid-cols-5 gap-6 transition-colors duration-200">
        <div className="border-r border-slate-100 dark:border-slate-800 last:border-0 pr-4">
          <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Throughput</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{metrics.total}</div>
        </div>
        <div className="border-r border-slate-100 dark:border-slate-800 last:border-0 pr-4">
          <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Pipelines</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-2">
            {metrics.activePipeline}
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
        </div>
        <div className="border-r border-slate-100 dark:border-slate-800 last:border-0 pr-4">
          <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Live Interviews</div>
          <div className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400 tracking-tight flex items-center gap-2">
            {metrics.interviewing}
            <Clock className="w-5 h-5 opacity-75" />
          </div>
        </div>
        <div className="border-r border-slate-100 dark:border-slate-800 last:border-0 pr-4">
          <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Offers Claimed</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center gap-2">
            {metrics.offers}
            <Award className="w-5 h-5 opacity-75" />
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Closed Outcome Win Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{metrics.winRate}%</div>
        </div>
      </section>

      {/* Grid columns rendering ecosystem */}
      <main className="flex-1 p-6 overflow-x-auto min-h-0 bg-slate-50 dark:bg-slate-950">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-5 items-start pb-4">
            {COLUMNS.map(column => {
              const laneJobs = filteredJobs.filter(j => j.status === column.id);
              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  jobs={laneJobs}
                  sortOrder={columnSortOrders[column.id]}
                  onToggleSort={toggleColumnSort}
                  onCardClick={(job) => setActiveDrawerJob(job)}
                  isDark={isDark}
                />
              );
            })}
          </div>
        </DndContext>
      </main>

      {activeDrawerJob && (
        <EditSlideOver
          job={activeDrawerJob}
          onClose={() => setActiveDrawerJob(null)}
        />
      )}
    </div>
  );
}