// TimeFlow Local Storage and Data Helper

// Default Seed Data — empty on first launch, user fills their own data
const DEFAULT_FOLDERS = [];
const DEFAULT_TIMETABLE = [];
const DEFAULT_ATTENDANCE = [];
const DEFAULT_ASSIGNMENTS = [];
const DEFAULT_GPA = [];
const DEFAULT_SUBJECTS = [];

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
            attendance.push({
                subject: cls.subject,
                attended: 0,
                total: 0,
                required: 75
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

const SubjectManager = {
    // { id, name, color, credits }
    getSubjects: () => getData("tf_subjects", DEFAULT_SUBJECTS),
    saveSubjects: (subjects) => saveData("tf_subjects", subjects),
    addSubject: (name, color = "primary", credits = 3) => {
        const subjects = SubjectManager.getSubjects();
        if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) return null; // no duplicate
        const s = { id: "sub_" + Date.now(), name, color, credits };
        subjects.push(s);
        SubjectManager.saveSubjects(subjects);
        // Auto-create attendance record
        const attendance = AttendanceManager.getAttendance();
        if (!attendance.find(a => a.subject.toLowerCase() === name.toLowerCase())) {
            attendance.push({ subject: name, attended: 0, total: 0, required: 75 });
            AttendanceManager.saveAttendance(attendance);
        }
        return s;
    },
    deleteSubject: (id) => {
        const subjects = SubjectManager.getSubjects().filter(s => s.id !== id);
        SubjectManager.saveSubjects(subjects);
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
