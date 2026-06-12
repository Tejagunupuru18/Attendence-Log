// TimeFlow Local Storage and Data Helper

// Default Seed Data
const DEFAULT_FOLDERS = [
    {
        id: "folder_1",
        name: "Database Mgmt",
        color: "secondary", // electric blue
        notes: [
            { id: "note_11", title: "Final Exam Review", content: "Review indexing, B-Trees, transaction isolation levels (ACID), and normalization (1NF, 2NF, 3NF, BCNF). Make sure to practice SQL query optimization queries.", updatedTime: "2 hours ago" },
            { id: "note_12", title: "SQL Query Optimization", content: "Use EXPLAIN to analyze query execution plan. Avoid SELECT *, use indexes on frequently queried columns. Focus on JOIN performance.", updatedTime: "3 days ago" }
        ]
    },
    {
        id: "folder_2",
        name: "Discrete Math",
        color: "primary", // deep indigo
        notes: [
            { id: "note_21", title: "Boolean Algebra Basics", content: "De Morgan's Laws:\n1) NOT (A AND B) = (NOT A) OR (NOT B)\n2) NOT (A OR B) = (NOT A) AND (NOT B)\n\nTruth tables are essential for validation.", updatedTime: "Yesterday" }
        ]
    },
    {
        id: "folder_3",
        name: "Cloud Computing",
        color: "tertiary", // mint green / dark teal
        notes: [
            { id: "note_31", title: "SaaS vs PaaS vs IaaS", content: "IaaS: Infrastructure (AWS EC2, GCE)\nPaaS: Platform (Heroku, App Engine)\nSaaS: Software (Gmail, Salesforce)\n\nShared responsibility model is critical.", updatedTime: "3 days ago" }
        ]
    },
    {
        id: "folder_4",
        name: "Capstone Proj",
        color: "error", // red / coral
        notes: [
            { id: "note_41", title: "Project Milestones", content: "Milestone 1: UI/UX Wireframes & System Architecture (Done)\nMilestone 2: Database schema setup & core API development\nMilestone 3: Frontend-Backend integration & local testing", updatedTime: "5 min ago" }
        ]
    }
];

const DEFAULT_TIMETABLE = [
    {
        id: "class_1",
        subject: "Database Mgmt",
        instructor: "Dr. Sarah Jenkins",
        room: "Lab 402",
        day: "Mon",
        startTime: "09:00 AM",
        endTime: "10:45 AM",
        color: "primary"
    },
    {
        id: "class_2",
        subject: "Discrete Math",
        instructor: "Prof. Alan Turing",
        room: "Hall B",
        day: "Mon",
        startTime: "11:00 AM",
        endTime: "12:00 PM",
        color: "secondary"
    },
    {
        id: "class_3",
        subject: "Cloud Computing",
        instructor: "Dr. Aris Thorne",
        room: "Auditorium B",
        day: "Mon",
        startTime: "01:00 PM",
        endTime: "02:30 PM",
        color: "tertiary"
    },
    {
        id: "class_4",
        subject: "Data Structures",
        instructor: "Dr. Sarah Jenkins",
        room: "Lab 402",
        day: "Tue",
        startTime: "11:30 AM",
        endTime: "01:00 PM",
        color: "primary"
    },
    {
        id: "class_5",
        subject: "Linear Algebra",
        instructor: "Prof. Alan Turing",
        room: "Hall B",
        day: "Tue",
        startTime: "02:00 PM",
        endTime: "03:00 PM",
        color: "secondary"
    }
];

const DEFAULT_ATTENDANCE = [
    { subject: "Database Mgmt", attended: 18, total: 22, required: 75 },
    { subject: "Discrete Math", attended: 14, total: 20, required: 75 },
    { subject: "Cloud Computing", attended: 12, total: 14, required: 75 },
    { subject: "Data Structures", attended: 15, total: 18, required: 75 },
    { subject: "Linear Algebra", attended: 10, total: 15, required: 75 }
];

const DEFAULT_ASSIGNMENTS = [
    { id: "assign_1", title: "Normalization Practice Set", subject: "Database Mgmt", dueDate: "2026-06-19", completed: false },
    { id: "assign_2", title: "De Morgan's Proof Draft", subject: "Discrete Math", dueDate: "2026-06-21", completed: false },
    { id: "assign_3", title: "Deploy Docker Container", subject: "Cloud Computing", dueDate: "2026-06-15", completed: true },
    { id: "assign_4", title: "Red-Black Tree Implementation", subject: "Data Structures", dueDate: "2026-06-25", completed: false }
];

const DEFAULT_GPA = [
    { semester: "Semester 1", gpa: 3.8 },
    { semester: "Semester 2", gpa: 3.9 },
    { semester: "Semester 3", gpa: 3.75 }
];

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

// Global Navigation Component Injector (Ensures all pages have working, synchronized navigation)
function renderGlobalNavbar(activeTab) {
    const navbarHTML = `
    <!-- BottomNavBar -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 pb-safe bg-surface-container-lowest dark:bg-inverse-surface z-[100] rounded-t-xl shadow-[0_-4px_20px_rgba(21,21,125,0.08)]">
        <!-- Home -->
        <a class="flex flex-col items-center justify-center ${activeTab === 'home' ? 'bg-primary-container text-on-primary-container dark:bg-primary-fixed-dim dark:text-on-primary-fixed' : 'text-on-surface-variant dark:text-outline-variant'} rounded-full px-4 py-1 active:scale-90 transition-all duration-200" href="dashboard.html">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activeTab === 'home' ? 1 : 0};">dashboard</span>
            <span class="font-label-sm text-label-sm">Home</span>
        </a>
        <!-- Timetable -->
        <a class="flex flex-col items-center justify-center ${activeTab === 'timetable' ? 'bg-primary-container text-on-primary-container dark:bg-primary-fixed-dim dark:text-on-primary-fixed' : 'text-on-surface-variant dark:text-outline-variant'} rounded-full px-4 py-1 active:scale-90 transition-all duration-200" href="timetable.html">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activeTab === 'timetable' ? 1 : 0};">calendar_view_week</span>
            <span class="font-label-sm text-label-sm">Timetable</span>
        </a>
        <!-- Tracker -->
        <a class="flex flex-col items-center justify-center ${activeTab === 'tracker' ? 'bg-primary-container text-on-primary-container dark:bg-primary-fixed-dim dark:text-on-primary-fixed' : 'text-on-surface-variant dark:text-outline-variant'} rounded-full px-4 py-1 active:scale-90 transition-all duration-200" href="tracker.html">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activeTab === 'tracker' ? 1 : 0};">query_stats</span>
            <span class="font-label-sm text-label-sm">Tracker</span>
        </a>
        <!-- Tools -->
        <a class="flex flex-col items-center justify-center ${['notes', 'gpa', 'assignments'].includes(activeTab) ? 'bg-primary-container text-on-primary-container dark:bg-primary-fixed-dim dark:text-on-primary-fixed' : 'text-on-surface-variant dark:text-outline-variant'} rounded-full px-4 py-1 active:scale-90 transition-all duration-200" href="notes.html">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${['notes', 'gpa', 'assignments'].includes(activeTab) ? 1 : 0};">construction</span>
            <span class="font-label-sm text-label-sm">Tools</span>
        </a>
    </nav>
    `;
    
    // Inject the navbar into the document body or footer
    const existingNav = document.querySelector('nav') || document.querySelector('footer');
    if (existingNav) {
        existingNav.outerHTML = navbarHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', navbarHTML);
    }
}
