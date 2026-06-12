// TimeFlow Local Storage and Data Helper

// Default Seed Data — empty on first launch, user fills their own data
const DEFAULT_FOLDERS = [];
const DEFAULT_TIMETABLE = [];
const DEFAULT_ATTENDANCE = [];
const DEFAULT_ASSIGNMENTS = [];
const DEFAULT_GPA = [];
const DEFAULT_SUBJECTS = [];
const DEFAULT_LOGS = [];

// Helper functions for reading and writing data
function getData(key, defaultVal) {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return defaultVal;
    }
}

function saveData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}

// Accessors
const NotesManager = {
    getFolders: () => getData("tf_folders", DEFAULT_FOLDERS),
    saveFolders: (folders) => saveData("tf_folders", folders),
    addFolder: (name, color = "primary") => {
        const folders = NotesManager.getFolders();
        const newFolder = {
            id: "folder_" + Date.now(),
            name: name,
            color: color,
            notes: []
        };
        folders.push(newFolder);
        NotesManager.saveFolders(folders);
        return newFolder;
    },
    addNote: (folderId, title, content) => {
        const folders = NotesManager.getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            const newNote = {
                id: "note_" + Date.now(),
                title: title,
                content: content,
                updatedTime: "Just now"
            };
            folder.notes.unshift(newNote);
            NotesManager.saveFolders(folders);
            return newNote;
        }
        return null;
    },
    deleteNote: (folderId, noteId) => {
        const folders = NotesManager.getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            folder.notes = folder.notes.filter(n => n.id !== noteId);
            NotesManager.saveFolders(folders);
        }
    },
    deleteFolder: (folderId) => {
        const folders = NotesManager.getFolders().filter(f => f.id !== folderId);
        NotesManager.saveFolders(folders);
    }
};

const TimetableManager = {
    getClasses: () => getData("tf_timetable", DEFAULT_TIMETABLE),
    saveClasses: (classes) => saveData("tf_timetable", classes),
    addClass: (cls) => {
        const classes = TimetableManager.getClasses();
        cls.id = "class_" + Date.now();
        classes.push(cls);
        TimetableManager.saveClasses(classes);
        
        // Also ensure attendance record exists
        const attendance = AttendanceManager.getAttendance();
        if (!attendance.find(a => a.subject.toLowerCase() === cls.subject.toLowerCase())) {
            const globalCutoff = parseInt(localStorage.getItem('tf_attendance_cutoff') || '75');
            attendance.push({
                subject: cls.subject,
                attended: 0,
                total: 0,
                required: globalCutoff
            });
            AttendanceManager.saveAttendance(attendance);
        }
        return cls;
    }
};

const AttendanceManager = {
    getAttendance: () => getData("tf_attendance", DEFAULT_ATTENDANCE),
    saveAttendance: (attendance) => saveData("tf_attendance", attendance),
    logAttendance: (subjectName, attendedStatus) => {
        const attendance = AttendanceManager.getAttendance();
        const record = attendance.find(a => a.subject.toLowerCase() === subjectName.toLowerCase());
        if (record) {
            record.total += 1;
            if (attendedStatus === "present") {
                record.attended += 1;
            }
            AttendanceManager.saveAttendance(attendance);
            ActivityLogManager.addLog(record.subject, attendedStatus === "present" ? "Marked Present" : "Marked Absent");
            return record;
        }
        return null;
    },
    revertAttendance: (subjectName, attendedStatus) => {
        const attendance = AttendanceManager.getAttendance();
        const record = attendance.find(a => a.subject.toLowerCase() === subjectName.toLowerCase());
        if (record && record.total > 0) {
            record.total -= 1;
            if (attendedStatus === "present" && record.attended > 0) {
                record.attended -= 1;
            }
            AttendanceManager.saveAttendance(attendance);
            ActivityLogManager.addLog(record.subject, "Reverted Attendance");
            return record;
        }
        return null;
    }
};

const AssignmentManager = {
    getAssignments: () => getData("tf_assignments", DEFAULT_ASSIGNMENTS),
    saveAssignments: (assignments) => saveData("tf_assignments", assignments),
    addAssignment: (title, subject, dueDate) => {
        const assignments = AssignmentManager.getAssignments();
        const newAssign = {
            id: "assign_" + Date.now(),
            title: title,
            subject: subject,
            dueDate: dueDate,
            completed: false
        };
        assignments.push(newAssign);
        AssignmentManager.saveAssignments(assignments);
        return newAssign;
    },
    toggleAssignment: (id) => {
        const assignments = AssignmentManager.getAssignments();
        const assign = assignments.find(a => a.id === id);
        if (assign) {
            assign.completed = !assign.completed;
            AssignmentManager.saveAssignments(assignments);
        }
        return assign;
    }
};

const GPAManager = {
    getGPAHistory: () => getData("tf_gpa", DEFAULT_GPA),
    saveGPAHistory: (gpa) => saveData("tf_gpa", gpa),
    addGPAHistory: (semesterName, score) => {
        const gpa = GPAManager.getGPAHistory();
        gpa.push({ semester: semesterName, gpa: score });
        GPAManager.saveGPAHistory(gpa);
    }
};

const ActivityLogManager = {
    getLogs: () => getData("tf_activity_logs", DEFAULT_LOGS),
    saveLogs: (logs) => saveData("tf_activity_logs", logs),
    addLog: (subject, action, details = "") => {
        const logs = ActivityLogManager.getLogs();
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timeStr = `${hours}:${minutes} ${ampm}`;
        
        const log = {
            id: "log_" + Date.now() + Math.random(),
            subject: subject,
            action: action,
            timestamp: `${dateStr} · ${timeStr}`,
            details: details
        };
        logs.unshift(log);
        if (logs.length > 100) logs.pop();
        ActivityLogManager.saveLogs(logs);
        return log;
    },
    clearLogs: () => {
        ActivityLogManager.saveLogs(DEFAULT_LOGS);
    }
};

const SubjectManager = {
    // { id, name, color, credits }
    getSubjects: () => getData("tf_subjects", DEFAULT_SUBJECTS),
    saveSubjects: (subjects) => saveData("tf_subjects", subjects),
    addSubject: (name, color = "primary", credits = 3) => {
        const subjects = SubjectManager.getSubjects();
        if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) return null;
        const s = { id: "sub_" + Date.now(), name, color, credits };
        subjects.push(s);
        SubjectManager.saveSubjects(subjects);
        const attendance = AttendanceManager.getAttendance();
        if (!attendance.find(a => a.subject.toLowerCase() === name.toLowerCase())) {
            const globalCutoff = parseInt(localStorage.getItem('tf_attendance_cutoff') || '75');
            attendance.push({ subject: name, attended: 0, total: 0, required: globalCutoff });
            AttendanceManager.saveAttendance(attendance);
        }
        ActivityLogManager.addLog(name, "Subject Added");
        return s;
    },
    deleteSubject: (id) => {
        const subjects = SubjectManager.getSubjects();
        const subjectToDelete = subjects.find(s => s.id === id);
        if (subjectToDelete) {
            const updatedSubjects = subjects.filter(s => s.id !== id);
            SubjectManager.saveSubjects(updatedSubjects);

            const attendance = AttendanceManager.getAttendance();
            const updatedAttendance = attendance.filter(a => a.subject.toLowerCase() !== subjectToDelete.name.toLowerCase());
            AttendanceManager.saveAttendance(updatedAttendance);
            
            ActivityLogManager.addLog(subjectToDelete.name, "Subject Deleted");
        }
    }
};

// ── Holiday Manager ───────────────────────────────────────────
// Stores holidays as { "YYYY-MM-DD": "Holiday Name" }
const HolidayManager = {
    KEY: 'tf_holidays',
    getAll: () => getData('tf_holidays', {}),
    save:   (h)  => saveData('tf_holidays', h),

    isHoliday: (dateStr) => {
        const h = HolidayManager.getAll();
        return Object.prototype.hasOwnProperty.call(h, dateStr);
    },

    getLabel: (dateStr) => {
        const h = HolidayManager.getAll();
        return h[dateStr] || 'Holiday';
    },

    mark: (dateStr, label = 'Holiday') => {
        const h = HolidayManager.getAll();
        h[dateStr] = label;
        HolidayManager.save(h);
    },

    unmark: (dateStr) => {
        const h = HolidayManager.getAll();
        delete h[dateStr];
        HolidayManager.save(h);
    }
};

// ── Daily Streak ──────────────────────────────────────────────
// Streak = consecutive calendar days on which ANY attendance was logged
const StreakManager = {
    STREAK_KEY:    'tf_streak_count',
    LAST_LOG_KEY:  'tf_streak_last_date',

    getStreak: () => parseInt(localStorage.getItem('tf_streak_count') || '0'),

    // Call this whenever an attendance action is performed
    logToday: () => {
        const today     = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
        const lastDate  = localStorage.getItem('tf_streak_last_date') || '';
        const streak    = parseInt(localStorage.getItem('tf_streak_count') || '0');

        if (lastDate === today) return streak; // already logged today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().substring(0, 10);

        const newStreak = lastDate === yStr ? streak + 1 : 1; // consecutive or restart
        localStorage.setItem('tf_streak_count',     newStreak);
        localStorage.setItem('tf_streak_last_date', today);
        return newStreak;
    },

    isLoggedToday: () => {
        const today = new Date().toISOString().substring(0, 10);
        return localStorage.getItem('tf_streak_last_date') === today;
    }
};

// Live Clock — call renderClock('elementId') on any page to show a ticking clock
function renderClock(elementId) {
    function tick() {
        const el = document.getElementById(elementId);
        if (!el) return;
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hStr = hours.toString().padStart(2, '0');
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const dayName = days[now.getDay()];
        const dateStr = `${dayName}, ${months[now.getMonth()]} ${now.getDate()}`;
        el.innerHTML = `
            <span class="font-display-lg-mobile text-display-lg-mobile text-primary leading-none">${hStr}:${minutes}<span class="text-secondary">:${seconds}</span> <span class="text-headline-sm text-on-surface-variant">${ampm}</span></span>
            <span class="font-label-md text-label-md text-on-surface-variant">${dateStr}</span>
        `;
    }
    tick();
    setInterval(tick, 1000);
}

// Global Navigation Component Injector (Ensures all pages have working, synchronized navigation)
function renderGlobalNavbar(activeTab) {
    const navbarHTML = `
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest z-[100] rounded-t-xl shadow-[0_-4px_20px_rgba(21,21,125,0.08)]">
        <a class="flex flex-col items-center justify-center ${activeTab === 'home' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'} rounded-full px-3 py-1 active:scale-90 transition-all duration-200" href="dashboard.html">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${activeTab==='home'?1:0};">dashboard</span>
            <span class="font-label-sm text-label-sm">Home</span>
        </a>
        <a class="flex flex-col items-center justify-center ${activeTab === 'subjects' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'} rounded-full px-3 py-1 active:scale-90 transition-all duration-200" href="subjects.html">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${activeTab==='subjects'?1:0};">menu_book</span>
            <span class="font-label-sm text-label-sm">Subjects</span>
        </a>
        <a class="flex flex-col items-center justify-center ${activeTab === 'timetable' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'} rounded-full px-3 py-1 active:scale-90 transition-all duration-200" href="timetable.html">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${activeTab==='timetable'?1:0};">calendar_view_week</span>
            <span class="font-label-sm text-label-sm">Schedule</span>
        </a>
        <a class="flex flex-col items-center justify-center ${activeTab === 'tracker' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'} rounded-full px-3 py-1 active:scale-90 transition-all duration-200" href="tracker.html">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${activeTab==='tracker'?1:0};">query_stats</span>
            <span class="font-label-sm text-label-sm">Tracker</span>
        </a>
        <a class="flex flex-col items-center justify-center ${['notes','gpa','assignments'].includes(activeTab) ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'} rounded-full px-3 py-1 active:scale-90 transition-all duration-200" href="notes.html">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${['notes','gpa','assignments'].includes(activeTab)?1:0};">construction</span>
            <span class="font-label-sm text-label-sm">Tools</span>
        </a>
    </nav>
    `;
    const existingNav = document.querySelector('nav') || document.querySelector('footer');
    if (existingNav) {
        existingNav.outerHTML = navbarHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', navbarHTML);
    }
}

// Inject custom confirm/toast styling animations
const customStyles = document.createElement('style');
customStyles.innerHTML = `
@keyframes scaleUp {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.animate-scaleUp {
    animation: scaleUp 0.15s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
}
@keyframes slideInUp {
    from { transform: translateY(100%) translateX(-50%); opacity: 0; }
    to { transform: translateY(0) translateX(-50%); opacity: 1; }
}
.animate-slideInUp {
    animation: slideInUp 0.2s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
}
`;
document.head.appendChild(customStyles);

window.showConfirm = function(title, message, onConfirm, onCancel = null) {
    const existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    const modalHTML = `
    <div id="custom-confirm-modal" class="fixed inset-0 z-[9999] flex items-center justify-center p-md bg-black/40 backdrop-blur-xs transition-opacity duration-200">
        <div class="bg-surface-container-lowest rounded-2xl w-full max-w-sm shadow-2xl p-lg space-y-md border border-surface-variant/40 animate-scaleUp">
            <h3 class="font-headline-sm text-headline-sm text-primary font-bold">${title}</h3>
            <p class="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">${message}</p>
            <div class="flex justify-end gap-md pt-2">
                <button id="confirm-cancel-btn" class="text-on-surface-variant font-label-md px-4 py-2 rounded-xl hover:bg-surface-container transition-colors">Cancel</button>
                <button id="confirm-ok-btn" class="bg-error text-on-error font-label-md px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md">Delete</button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('custom-confirm-modal');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');

    cancelBtn.onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };

    okBtn.onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
};

window.showToast = function(message, type = 'success') {
    const existing = document.querySelectorAll('.custom-toast');
    existing.forEach(t => t.remove());

    let bgClass = 'bg-tertiary text-on-tertiary';
    let icon = 'check_circle';
    if (type === 'error') {
        bgClass = 'bg-error text-on-error';
        icon = 'error';
    } else if (type === 'info') {
        bgClass = 'bg-primary text-on-primary';
        icon = 'info';
    }

    const toastHTML = `
    <div class="custom-toast fixed bottom-28 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-sm px-md py-3 rounded-full shadow-lg ${bgClass} font-label-md animate-slideInUp max-w-[90vw] truncate">
        <span class="material-symbols-outlined text-[20px]">${icon}</span>
        <span>${message}</span>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);

    const toast = document.querySelector('.custom-toast');
    setTimeout(() => {
        if (toast) {
            toast.style.transition = 'opacity 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 2500);
};
