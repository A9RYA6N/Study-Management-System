//add js for f// Storage utilities
const USERS_KEY = 'study_management_users';
const SUBJECTS_KEY = 'study_management_subjects';
const CURRENT_USER_KEY = 'study_management_current_user';

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function saveUser(user) {
    const users = getUsers();
    users[user.id] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    return id ? getUsers()[id] : null;
}

function setCurrentUser(id) {
    if (id) {
        localStorage.setItem(CURRENT_USER_KEY, id);
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

function getSubjects(userId) {
    const allSubjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '{}');
    return allSubjects[userId] || [];
}

function saveSubjects(userId, subjects) {
    const allSubjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '{}');
    allSubjects[userId] = subjects;
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(allSubjects));
}

// Date utilities
function getCurrentWeek() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

// UI utilities
function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

// Auth handling
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const users = getUsers();
    const user = Object.values(users).find(u => u.email === email);
    
    if (user) {
        setCurrentUser(user.id);
        initializeApp();
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const newUser = {
        id: crypto.randomUUID(),
        name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(document.getElementById('signupName').value)}`,
        institution: {
            type: document.getElementById('institutionType').value,
            name: document.getElementById('institutionName').value,
            class: document.getElementById('className').value
        }
    };

    saveUser(newUser);
    setCurrentUser(newUser.id);
    initializeApp();
}

// Subject handling
function handleAddSubject(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;
    const totalHours = parseInt(document.getElementById('totalHours').value);
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);

    const existingSubject = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    
    if (existingSubject) {
        existingSubject.totalHours += totalHours;
        saveSubjects(user.id, subjects);
    } else {
        const newSubject = {
            id: crypto.randomUUID(),
            name,
            totalHours,
            coveredHours: 0,
            weeklyProgress: {},
            monthlyProgress: {}
        };
        subjects.push(newSubject);
        saveSubjects(user.id, subjects);
    }

    document.getElementById('subjectForm').reset();
    renderSubjects();
}

function handleUpdateHours(subjectId, hours) {
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);
    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();

    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        const newCoveredHours = Math.min(subject.totalHours, subject.coveredHours + hours);
        subject.coveredHours = newCoveredHours;
        subject.weeklyProgress[currentWeek] = (subject.weeklyProgress[currentWeek] || 0) + hours;
        subject.monthlyProgress[currentMonth] = (subject.monthlyProgress[currentMonth] || 0) + hours;
        
        saveSubjects(user.id, subjects);
        renderSubjects();
    }
}

// Profile handling
function handleProfileEdit(e) {
    e.preventDefault();
    const user = getCurrentUser();
    user.institution = {
        type: document.getElementById('editInstitutionType').value,
        name: document.getElementById('editInstitutionName').value,
        class: document.getElementById('editClassName').value
    };
    
    saveUser(user);
    hideElement('profileEditor');
    updateProfileDisplay();
}

// Rendering
function renderSubjects() {
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);
    const subjectList = document.getElementById('subjectList');
    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();

    subjectList.innerHTML = subjects.map(subject => {
        const weeklyHours = subject.weeklyProgress[currentWeek] || 0;
        const monthlyHours = subject.monthlyProgress[currentMonth] || 0;
        const overallProgress = (subject.coveredHours / subject.totalHours) * 100;
        const weeklyProgress = (weeklyHours / 40) * 100;
        const monthlyProgress = (monthlyHours / 160) * 100;

        return `
            <div class="subject-card">
                <div class="subject-header">
                    <h3>${subject.name}</h3>
                    <span>${subject.coveredHours}/${subject.totalHours}h</span>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>Overall Progress</span>
                        <span>${Math.round(overallProgress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value overall" style="width: ${overallProgress}%"></div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>This Week</span>
                        <span>${weeklyHours}h</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value weekly" style="width: ${weeklyProgress}%"></div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>This Month</span>
                        <span>${monthlyHours}h</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value monthly" style="width: ${monthlyProgress}%"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Add study hours</label>
                    <input type="number" min="0" max="24" class="study-hours-input"
                           onchange="handleUpdateHours('${subject.id}', Number(this.value))">
                </div>
            </div>
        `;
    }).join('');
}

function updateProfileDisplay() {
    const user = getCurrentUser();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileInstitution').textContent = user.institution.name;
    document.getElementById('profileAvatar').src = user.avatar;
}

// Initialization
function initializeApp() {
    hideElement('authForms');
    showElement('app');
    updateProfileDisplay();
    renderSubjects();
}

function initializeAuth() {
    hideElement('app');
    showElement('authForms');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        initializeApp();
    } else {
        initializeAuth();
    }

    // Auth form switching
    document.getElementById('showSignup').addEventListener('click', () => {
        hideElement('loginForm');
        showElement('signupForm');
        document.getElementById('authTitle').textContent = 'Create your account';
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        hideElement('signupForm');
        showElement('loginForm');
        document.getElementById('authTitle').textContent = 'Sign in to your account';
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('subjectForm').addEventListener('submit', handleAddSubject);
    document.getElementById('profileForm').addEventListener('submit', handleProfileEdit);

    // Profile editing
    document.getElementById('profileInfo').addEventListener('click', () => {
        const user = getCurrentUser();
        document.getElementById('editInstitutionType').value = user.institution.type;
        document.getElementById('editInstitutionName').value = user.institution.name;
        document.getElementById('editClassName').value = user.institution.class;
        showElement('profileEditor');
    });

    document.getElementById('cancelProfileEdit').addEventListener('click', () => {
        hideElement('profileEditor');
    });

    // Sign out
    document.getElementById('signOutBtn').addEventListener('click', () => {
        setCurrentUser(null);
        initializeAuth();
    });
});unctionality
