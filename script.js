/* =========================================================
   ZAKOVAT GAMES — COMPLETE PLATFORM & 15 INTELLECTUAL GAMES
   Pure Vanilla JS + LocalStorage Persistence
========================================================= */

// 1. AUDIO SYNTHESIZER (No external audio files needed)
const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    play(type) {
        if (!AppState.settings.sound) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const now = this.ctx.currentTime;
            if (type === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(120, now + 0.22);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'win') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554.37, now + 0.1);
                osc.frequency.setValueAtTime(659.25, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                osc.start(now);
                osc.stop(now + 0.45);
            }
        } catch (e) {}
    }
};

// 2. 15 GAMES CATALOG METADATA
const GAMES_CATALOG = [
    { id: 'math', title: 'Matematik misollar', category: 'math', catName: 'Matematika', icon: '🔢', color: 'linear-gradient(135deg,#6366f1,#3b82f6)', time: 60, rules: 'Berilgan arifmetik misolning to‘g‘ri javobini tez va aniq toping. Har bir to‘g‘ri javob +15 ball.' },
    { id: 'sudoku', title: 'Sudoku (4x4 Zakovat)', category: 'logic', catName: 'Mantiq', icon: '⊞', color: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', time: 90, rules: 'Har bir qator, ustun va 2x2 blokda 1 dan 4 gacha bo‘lgan raqamlar takrorlanmasdan joylashishi kerak.' },
    { id: 'chess', title: 'Shaxmat jumboqlari', category: 'logic', catName: 'Mantiq', icon: '♞', color: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', time: 75, rules: 'Shaxmat figuralarining yurish qoidalari va taktik holatlar bo‘yicha eng to‘g‘ri yurishni toping.' },
    { id: 'memory', title: 'Xotira kartalari', category: 'memory', catName: 'Xotira', icon: '🃏', color: 'linear-gradient(135deg,#ec4899,#8b5cf6)', time: 60, rules: 'Kartalarni ochib, bir xil juftliklarni toping. Barcha juftliklar topilganda yangi bosqich ochiladi.' },
    { id: 'sequence', title: 'Sonlar ketma-ketligi', category: 'math', catName: 'Matematika', icon: '📈', color: 'linear-gradient(135deg,#06b6d4,#3b82f6)', time: 60, rules: 'Sonlar qatoridagi mantiqiy qonuniyatni aniqlang va keyingi sonni toping.' },
    { id: 'logic', title: 'Mantiqiy savollar', category: 'logic', catName: 'Mantiq', icon: '🧩', color: 'linear-gradient(135deg,#7c3aed,#4f46e5)', time: 75, rules: 'Zukkolik va mantiqiy fikrlashni talab qiluvchi savollarga to‘g‘ri javob bering.' },
    { id: 'wordfind', title: 'So‘z topish', category: 'words', catName: 'So‘z o‘yinlari', icon: '🔍', color: 'linear-gradient(135deg,#10b981,#059669)', time: 60, rules: 'Ta’rif va ishoraga qarab yashiringan o‘zbekcha so‘zni toping.' },
    { id: 'anagram', title: 'Harflardan so‘z tuzish', category: 'words', catName: 'So‘z o‘yinlari', icon: '🔤', color: 'linear-gradient(135deg,#f59e0b,#d97706)', time: 60, rules: 'Aralashib ketgan harflardan to‘g‘ri ma’noli so‘z tuzing.' },
    { id: 'colormem', title: 'Ranglarni eslab qolish', category: 'memory', catName: 'Xotira', icon: '🎨', color: 'linear-gradient(135deg,#a855f7,#ec4899)', time: 60, rules: 'Yonib-o‘chgan ranglar ketma-ketligini diqqat bilan kuzating va xuddi shu tartibda bosing.' },
    { id: 'difference', title: 'Farqni topish', category: 'attention', catName: 'Diqqat', icon: '👁️', color: 'linear-gradient(135deg,#0ea5e9,#6366f1)', time: 50, rules: 'Belgilar jadvalidan boshqalaridan farq qiluvchi yagona belgini tezda toping.' },
    { id: 'shapes', title: 'Shakllar ketma-ketligi', category: 'logic', catName: 'Mantiq', icon: '🔷', color: 'linear-gradient(135deg,#8b5cf6,#ec4899)', time: 60, rules: 'Geometrik shakllar ketma-ketligini davom ettiruvchi keyingi shaklni tanlang.' },
    { id: 'fastthink', title: 'Tez fikrlash', category: 'attention', catName: 'Diqqat', icon: '⚡', color: 'linear-gradient(135deg,#f43f5e,#8b5cf6)', time: 45, rules: 'Matn rangiga emas, SO‘Z MA’NOSIGA (yoki ko‘rsatilgan shartga) qarab zudlik bilan javob bering!' },
    { id: 'maze', title: 'Labirintdan chiqish', category: 'logic', catName: 'Mantiq', icon: '🌀', color: 'linear-gradient(135deg,#4f46e5,#06b6d4)', time: 70, rules: 'Yo‘nalish tugmalari (yoki klaviatura strelkalari) yordamida qahramonni bayroqchagacha olib boring.' },
    { id: 'rebus', title: 'Rasmli jumboqlar', category: 'words', catName: 'So‘z o‘yinlari', icon: '🖼️', color: 'linear-gradient(135deg,#d946ef,#6366f1)', time: 60, rules: 'Emojilar va rasmlar kombinatsiyasi ortida yashiringan so‘z yoki iborani toping.' },
    { id: 'schulte', title: 'Diqqatni sinash (1–16)', category: 'attention', catName: 'Diqqat', icon: '🎯', color: 'linear-gradient(135deg,#2563eb,#7c3aed)', time: 50, rules: '1 dan 16 gacha bo‘lgan sonlarni o‘sish tartibida (1, 2, 3...) imkon qadar tez bosib chiqing.' }
];

// 3. ACHIEVEMENTS DEFINITIONS
const ACHIEVEMENTS_LIST = [
    { id: 'first_game', title: 'Birinchi o‘yin', desc: 'Ilk o‘yinni yakunlang', icon: '🎮', check: (s) => s.gamesPlayed >= 1 },
    { id: 'score_100', title: '100 ball', desc: 'Umumiy 100 ball to‘plang', icon: '🥉', check: (s) => s.totalScore >= 100 },
    { id: 'score_500', title: '500 ball', desc: 'Umumiy 500 ball to‘plang', icon: '🥈', check: (s) => s.totalScore >= 500 },
    { id: 'score_1000', title: '1000 ball', desc: 'Umumiy 1000 ball to‘plang', icon: '🥇', check: (s) => s.totalScore >= 1000 },
    { id: 'five_games', title: '5 ta o‘yinni tugatish', desc: 'Kamida 5 marta o‘yin o‘ynang', icon: '🔥', check: (s) => s.gamesPlayed >= 5 },
    { id: 'streak_7', title: '7 kunlik faollik', desc: '7 kun ketma-ket platformaga kiring', icon: '📅', check: (s) => s.streak >= 7 },
    { id: 'math_master', title: 'Matematik usta', desc: 'Matematika o‘yinida 90+ ball oling', icon: '🧮', check: (s) => (s.highScores.math || 0) >= 90 },
    { id: 'memory_champ', title: 'Xotira chempioni', desc: 'Xotira o‘yinida 90+ ball oling', icon: '🧠', check: (s) => (s.highScores.memory || 0) >= 90 || (s.highScores.colormem || 0) >= 90 }
];

// 4. APPLICATION STATE (LOCALSTORAGE)
const DEFAULT_STATE = {
    user: null, // { name, username, ageGroup, gender, avatar }
    stats: {
        xp: 0,
        totalScore: 0,
        dailyScore: 0,
        gamesPlayed: 0,
        streak: 1,
        lastActiveDate: new Date().toDateString(),
        highScores: {},
        history: [],
        unlockedAchievements: [],
        favorites: ['math', 'memory', 'logic'],
        lastPlayedGameId: 'math',
        dailyQuests: {
            playedToday: 0,
            correctToday: 0,
            scoreToday: 0
        }
    },
    settings: {
        theme: 'dark',
        sound: true
    },
    notifications: [
        '🎉 ZAKOVAT GAMES platformasiga xush kelibsiz!',
        '💡 Maslahat: Kunlik topshiriqlarni bajarib qo‘shimcha XP oling.'
    ]
};

let AppState = JSON.parse(localStorage.getItem('zakovat_games_state')) || structuredClone(DEFAULT_STATE);

function saveState() {
    localStorage.setItem('zakovat_games_state', JSON.stringify(AppState));
}

// Check Daily Reset & Streak
function checkDailyProgress() {
    const today = new Date().toDateString();
    if (AppState.stats.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (AppState.stats.lastActiveDate === yesterday) {
            AppState.stats.streak += 1;
        } else {
            AppState.stats.streak = 1;
        }
        AppState.stats.lastActiveDate = today;
        AppState.stats.dailyScore = 0;
        AppState.stats.dailyQuests = { playedToday: 0, correctToday: 0, scoreToday: 0 };
        saveState();
    }
}

// Get Difficulty Multiplier based on User Age Group
function getAgeDifficulty() {
    const age = AppState.user?.ageGroup || '10-13';
    if (age === '6-9') return { level: 1, label: 'Boshlang‘ich (6–9 yosh)', mult: 1 };
    if (age === '10-13') return { level: 2, label: 'O‘rta (10–13 yosh)', mult: 1.2 };
    if (age === '14-17') return { level: 3, label: 'Yuqori (14–17 yosh)', mult: 1.5 };
    return { level: 4, label: 'Ekspert (18+ yosh)', mult: 1.8 };
}

// =========================================================
// 5. INITIALIZATION & NAVIGATION
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => document.getElementById('loader').classList.add('hidden'), 500);
    }, 800);

    applyTheme();
    checkDailyProgress();

    if (!AppState.user) {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        setupRegistration();
    } else {
        document.getElementById('mainApp').classList.remove('hidden');
        initDashboard();
    }
});

function applyTheme() {
    document.documentElement.setAttribute('data-theme', AppState.settings.theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.textContent = AppState.settings.theme === 'dark' ? '🌙' : '☀️';
    if (AppState.user?.gender === 'Qiz bola') {
        document.body.classList.add('theme-pink');
    } else {
        document.body.classList.remove('theme-pink');
    }
}

function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// REGISTRATION SETUP
function setupRegistration() {
    let selectedAvatar = '🧠';
    const avatarBtns = document.querySelectorAll('#regAvatarGrid .avatar-btn');
    avatarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            avatarBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatar = btn.dataset.avatar;
        });
    });

    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const username = document.getElementById('regUsername').value.trim().replace(/^@/, '');
        const ageGroup = document.getElementById('regAge').value;
        const gender = document.querySelector('input[name="regGender"]:checked').value;

        AppState.user = { name, username, ageGroup, gender, avatar: selectedAvatar };
        saveState();
        applyTheme();

        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        initDashboard();
        showToast(`Xush kelibsiz, ${name}! 🎉`);
    });
}

// =========================================================
// 6. DASHBOARD RENDERING & UI EVENTS
// =========================================================
function initDashboard() {
    bindNavigationEvents();
    updateAllUI();
}

function updateAllUI() {
    const u = AppState.user;
    const s = AppState.stats;
    const level = Math.floor(s.xp / 250) + 1;

    // Header & Sidebar
    document.getElementById('headerAvatar').textContent = u.avatar;
    document.getElementById('headerName').textContent = u.name;
    document.getElementById('headerLevel').textContent = `${level}-daraja • ${s.xp} XP`;
    document.getElementById('sidebarStreak').textContent = `${s.streak} kun`;

    // Home Banner & Stats
    document.getElementById('homeAgeBadge').textContent = `Yosh toifasi: ${u.ageGroup} yosh`;
    document.getElementById('homeWelcomeTitle').textContent = `Xush kelibsiz, ${u.name}! 👋`;
    document.getElementById('statXP').textContent = `${s.xp} XP`;
    document.getElementById('statLevel').textContent = `${level}-daraja`;
    document.getElementById('statStreak').textContent = `${s.streak} kun`;
    document.getElementById('statDailyScore').textContent = `${s.dailyScore} ball`;

    renderDailyQuests();
    renderBestResults();
    renderRecommendedGames();
    renderAllGames('all');
    renderLeaderboard('daily');
    renderProfile();
    renderNotifications();
}

function renderDailyQuests() {
    const q = AppState.stats.dailyQuests;
    const quests = [
        { title: 'Kamida 2 ta o‘yin o‘ynang', current: Math.min(q.playedToday, 2), target: 2, reward: '+50 XP' },
        { title: '10 ta to‘g‘ri javob toping', current: Math.min(q.correctToday, 10), target: 10, reward: '+75 XP' },
        { title: 'Bugun 100 ball to‘plang', current: Math.min(q.scoreToday, 100), target: 100, reward: '+100 XP' }
    ];

    let doneCount = 0;
    const list = document.getElementById('dailyQuestsList');
    list.innerHTML = quests.map(item => {
        const isDone = item.current >= item.target;
        if (isDone) doneCount++;
        return `
            <div class="quest-item ${isDone ? 'done' : ''}">
                <div>
                    <div class="quest-title">${isDone ? '✅' : '⏳'} ${item.title}</div>
                    <small style="color:var(--text-muted)">Jarayon: ${item.current} / ${item.target}</small>
                </div>
                <span class="quest-reward">${item.reward}</span>
            </div>
        `;
    }).join('');
    document.getElementById('dailyQuestProgressText').textContent = `${doneCount}/3 bajarildi`;
}

function renderBestResults() {
    const entries = Object.entries(AppState.stats.highScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const container = document.getElementById('homeBestResults');
    if (entries.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">Hali natijalar yo‘q. Birinchi o‘yinni boshlang!</p>`;
        return;
    }

    container.innerHTML = entries.map(([gameId, score]) => {
        const g = GAMES_CATALOG.find(x => x.id === gameId);
        return `
            <div class="best-res-item">
                <span>${g ? g.icon + ' ' + g.title : gameId}</span>
                <strong style="color:#fbbf24">${score} ball</strong>
            </div>
        `;
    }).join('');
}

function createGameCardHTML(game) {
    const isFav = AppState.stats.favorites.includes(game.id);
    const high = AppState.stats.highScores[game.id] || 0;
    const diff = getAgeDifficulty().label.split(' ')[0];

    return `
        <div class="game-card">
            <div class="game-card-banner" style="background:${game.color}">
                <span>${game.icon}</span>
                <button class="fav-btn" onclick="toggleFavorite(event, '${game.id}')" title="Sevimlilarga qo'shish">
                    ${isFav ? '❤️' : '🤍'}
                </button>
                <span class="cat-tag">${game.catName}</span>
            </div>
            <div class="game-card-body">
                <h3>${game.title}</h3>
                <div class="game-card-meta">
                    <span>Daraja: ${diff}</span>
                    <span class="high-score-pill">🏆 ${high}</span>
                </div>
                <button class="btn-primary" onclick="openGameModal('${game.id}')">▶️ O‘ynash</button>
            </div>
        </div>
    `;
}

function renderRecommendedGames() {
    const recommended = GAMES_CATALOG.slice(0, 4);
    document.getElementById('recommendedGamesGrid').innerHTML = recommended.map(createGameCardHTML).join('');
}

function renderAllGames(filter = 'all', searchQuery = '') {
    let filtered = GAMES_CATALOG;
    if (filter === 'favorites') {
        filtered = filtered.filter(g => AppState.stats.favorites.includes(g.id));
    } else if (filter !== 'all') {
        filtered = filtered.filter(g => g.category === filter);
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.catName.toLowerCase().includes(q));
    }

    const grid = document.getElementById('allGamesGrid');
    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted)">Hech qanday o‘yin topilmadi.</p>`;
    } else {
        grid.innerHTML = filtered.map(createGameCardHTML).join('');
    }
}

window.toggleFavorite = function(e, gameId) {
    e.stopPropagation();
    const idx = AppState.stats.favorites.indexOf(gameId);
    if (idx > -1) {
        AppState.stats.favorites.splice(idx, 1);
        showToast('Sevimlilardan olib tashlandi');
    } else {
        AppState.stats.favorites.push(gameId);
        showToast('Sevimli o‘yinlarga qo‘shildi ❤️');
    }
    saveState();
    renderRecommendedGames();
    const activePill = document.querySelector('.filter-pill.active');
    renderAllGames(activePill ? activePill.dataset.filter : 'all', document.getElementById('globalSearch').value);
};

// LEADERBOARD (DEMO LOCAL DATA + CURRENT USER)
function renderLeaderboard(type = 'daily') {
    const mult = type === 'daily' ? 1 : type === 'weekly' ? 4 : 10;
    const bots = [
        { name: 'Madina Karimova', avatar: '👩‍🚀', age: '14-17', score: 420 * mult },
        { name: 'Amirbek Tursunov', avatar: '🦊', age: '10-13', score: 380 * mult },
        { name: 'Sardor Alimov', avatar: '🧑‍💻', age: '18+', score: 350 * mult },
        { name: 'Nilufar Rustamova', avatar: '🦉', age: '14-17', score: 290 * mult },
        { name: 'Azizbek Qodirov', avatar: '🦁', age: '6-9', score: 210 * mult },
        { name: 'Zarina Umarova', avatar: '🦄', age: '10-13', score: 175 * mult }
    ];

    const myScore = type === 'daily' ? AppState.stats.dailyScore : AppState.stats.totalScore;
    const players = [
        ...bots,
        { name: AppState.user.name + ' (Siz)', avatar: AppState.user.avatar, age: AppState.user.ageGroup, score: myScore, isMe: true }
    ].sort((a, b) => b.score - a.score);

    // Top 3 Podium
    const podium = document.getElementById('top3Podium');
    const crowns = ['🥇 1-o‘rin', '🥈 2-o‘rin', '🥉 3-o‘rin'];
    podium.innerHTML = players.slice(0, 3).map((p, idx) => `
        <div class="glass-card podium-card rank-${idx + 1}">
            <div class="podium-crown">${crowns[idx]}</div>
            <div class="podium-avatar">${p.avatar}</div>
            <h3>${p.name}</h3>
            <small style="color:var(--text-muted)">${p.age} yosh</small>
            <div class="podium-score">${p.score} ball</div>
        </div>
    `).join('');

    // Full Table
    document.getElementById('leaderboardBody').innerHTML = players.map((p, idx) => `
        <tr class="${p.isMe ? 'is-me' : ''}">
            <td>#${idx + 1}</td>
            <td>${p.avatar} ${p.name}</td>
            <td>${p.age} yosh</td>
            <td>${Math.floor(p.score / 150) + 1}-daraja</td>
            <td><strong>${p.score} ball</strong></td>
        </tr>
    `).join('');
}

// PROFILE & ACHIEVEMENTS
function renderProfile() {
    const u = AppState.user;
    const s = AppState.stats;
    const level = Math.floor(s.xp / 250) + 1;

    document.getElementById('profAvatar').textContent = u.avatar;
    document.getElementById('profName').textContent = u.name;
    document.getElementById('profUsername').textContent = '@' + u.username;
    document.getElementById('profAge').textContent = u.ageGroup + ' yosh';
    document.getElementById('profGender').textContent = u.gender;
    document.getElementById('profLevel').textContent = level + '-daraja';

    document.getElementById('profTotalScore').textContent = s.totalScore;
    document.getElementById('profTotalXP').textContent = s.xp + ' XP';
    document.getElementById('profGamesPlayed').textContent = s.gamesPlayed;
    document.getElementById('profAchCount').textContent = `${s.unlockedAchievements.length} / ${ACHIEVEMENTS_LIST.length}`;

    // Achievements Grid
    document.getElementById('achievementsGrid').innerHTML = ACHIEVEMENTS_LIST.map(ach => {
        const unlocked = s.unlockedAchievements.includes(ach.id);
        return `
            <div class="ach-card ${unlocked ? 'unlocked' : ''}">
                <div class="ach-icon">${ach.icon}</div>
                <div>
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
            </div>
        `;
    }).join('');

    // History Table
    const histBody = document.getElementById('historyTableBody');
    if (s.history.length === 0) {
        histBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Hali o‘yinlar tarixi mavjud emas</td></tr>`;
    } else {
        histBody.innerHTML = s.history.slice().reverse().slice(0, 15).map(h => `
            <tr>
                <td><strong>${h.title}</strong></td>
                <td style="color:#fbbf24;font-weight:700">${h.score} ball</td>
                <td><span class="txt-green">${h.correct}</span> / <span class="txt-red">${h.wrong}</span></td>
                <td style="color:var(--text-muted)">${h.date}</td>
            </tr>
        `).join('');
    }
}

function renderNotifications() {
    document.getElementById('notifBadge').textContent = AppState.notifications.length;
    document.getElementById('notifList').innerHTML = AppState.notifications.map(n => `
        <div class="notif-item">${n}</div>
    `).join('');
}

function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    closeMobileSidebar();
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.add('hidden');
}

function bindNavigationEvents() {
    // Sidebar Page Buttons
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    // Sidebar Category Buttons
    document.querySelectorAll('.nav-item[data-category]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchPage('all-games');
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.dataset.category;
            document.querySelectorAll('.filter-pill').forEach(p => {
                p.classList.toggle('active', p.dataset.filter === cat);
            });
            renderAllGames(cat);
        });
    });

    // Quick Goto Buttons
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.goto));
    });

    // Filter Pills on All Games Page
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderAllGames(pill.dataset.filter, document.getElementById('globalSearch').value);
        });
    });

    // Search Input
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        switchPage('all-games');
        const activeFilter = document.querySelector('.filter-pill.active')?.dataset.filter || 'all';
        renderAllGames(activeFilter, e.target.value);
    });

    // Leaderboard Tabs
    document.querySelectorAll('.tab-btn[data-lb]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderLeaderboard(tab.dataset.lb);
        });
    });

    // Theme & Sound Toggles
    const toggleTheme = () => {
        AppState.settings.theme = AppState.settings.theme === 'dark' ? 'light' : 'dark';
        saveState();
        applyTheme();
    };
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('settingsThemeBtn').addEventListener('click', toggleTheme);

    const toggleSound = () => {
        AppState.settings.sound = !AppState.settings.sound;
        saveState();
        document.getElementById('soundToggleBtn').textContent = AppState.settings.sound ? '🔊' : '🔇';
        document.getElementById('settingsSoundBtn').textContent = AppState.settings.sound ? 'Yoqilgan' : 'O‘chirilgan';
        showToast(AppState.settings.sound ? 'Ovoz effektlari yoqildi 🔊' : 'Ovoz effektlari o‘chirildi 🔇');
    };
    document.getElementById('soundToggleBtn').addEventListener('click', toggleSound);
    document.getElementById('settingsSoundBtn').addEventListener('click', toggleSound);

    // Notifications Dropdown
    document.getElementById('notifBtn').addEventListener('click', () => {
        document.getElementById('notifDropdown').classList.toggle('hidden');
    });

    // Header Profile Click
    document.getElementById('headerProfileBtn').addEventListener('click', () => switchPage('profile'));

    // Continue Last Game
    document.getElementById('continueLastGameBtn').addEventListener('click', () => {
        openGameModal(AppState.stats.lastPlayedGameId || 'math');
    });

    // Mobile Sidebar
    document.getElementById('openSidebarBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebarBackdrop').classList.remove('hidden');
    });
    document.getElementById('closeSidebarBtn').addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebarBackdrop').addEventListener('click', closeMobileSidebar);

    // Edit Profile Modal
    document.getElementById('openEditProfileBtn').addEventListener('click', () => {
        document.getElementById('editName').value = AppState.user.name;
        document.getElementById('editUsername').value = AppState.user.username;
        document.getElementById('editAge').value = AppState.user.ageGroup;
        document.querySelectorAll('#editAvatarGrid .avatar-btn').forEach(b => {
            b.classList.toggle('selected', b.dataset.avatar === AppState.user.avatar);
        });
        document.getElementById('editProfileModal').classList.remove('hidden');
    });

    document.querySelectorAll('#editAvatarGrid .avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#editAvatarGrid .avatar-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    document.getElementById('closeEditModalBtn').addEventListener('click', () => {
        document.getElementById('editProfileModal').classList.add('hidden');
    });

    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        AppState.user.name = document.getElementById('editName').value.trim();
        AppState.user.username = document.getElementById('editUsername').value.trim();
        AppState.user.ageGroup = document.getElementById('editAge').value;
        const selAv = document.querySelector('#editAvatarGrid .avatar-btn.selected');
        if (selAv) AppState.user.avatar = selAv.dataset.avatar;
        saveState();
        updateAllUI();
        document.getElementById('editProfileModal').classList.add('hidden');
        showToast('Profil muvaffaqiyatli yangilandi! ✅');
    });

    // Reset Data
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if (confirm('Haqiqatan ham barcha ma’lumotlarni o‘chirmoqchimisiz?')) {
            localStorage.removeItem('zakovat_games_state');
            location.reload();
        }
    });
}

// =========================================================
// 7. GAME ARENA CONTROLLER
// =========================================================
let ActiveGame = {
    meta: null,
    timerInterval: null,
    timeLeft: 60,
    score: 0,
    correct: 0,
    wrong: 0,
    isRunning: false
};

window.openGameModal = function(gameId) {
    const game = GAMES_CATALOG.find(g => g.id === gameId);
    if (!game) return;

    ActiveGame.meta = game;
    AppState.stats.lastPlayedGameId = gameId;
    saveState();

    const diff = getAgeDifficulty();
    document.getElementById('gmIcon').textContent = game.icon;
    document.getElementById('gmTitle').textContent = game.title;
    document.getElementById('gmDifficulty').textContent = diff.label;
    document.getElementById('gmRulesText').textContent = game.rules;

    document.getElementById('gmStartIcon').textContent = game.icon;
    document.getElementById('gmStartTitle').textContent = game.title;
    document.getElementById('gmStartDesc').textContent = game.rules;
    document.getElementById('gmStartTime').textContent = `${game.time} soniya`;
    document.getElementById('gmStartDiff').textContent = diff.label;

    resetGameHUD(game.time);
    document.getElementById('gmRulesBox').classList.add('hidden');
    document.getElementById('gmBoard').classList.add('hidden');
    document.getElementById('gmResultScreen').classList.add('hidden');
    document.getElementById('gmStartScreen').classList.remove('hidden');
    document.getElementById('gameModal').classList.remove('hidden');
};

function resetGameHUD(seconds) {
    clearInterval(ActiveGame.timerInterval);
    ActiveGame.timeLeft = seconds;
    ActiveGame.score = 0;
    ActiveGame.correct = 0;
    ActiveGame.wrong = 0;
    ActiveGame.isRunning = false;
    updateHUDDisplay();
}

function updateHUDDisplay() {
    const mins = String(Math.floor(ActiveGame.timeLeft / 60)).padStart(2, '0');
    const secs = String(ActiveGame.timeLeft % 60).padStart(2, '0');
    document.getElementById('gmTimer').textContent = `${mins}:${secs}`;
    document.getElementById('gmScore').textContent = ActiveGame.score;
    document.getElementById('gmCorrect').textContent = ActiveGame.correct;
    document.getElementById('gmWrong').textContent = ActiveGame.wrong;
}

function addScore(points) {
    ActiveGame.score += points;
    ActiveGame.correct += 1;
    SoundFX.play('correct');
    updateHUDDisplay();
}

function addWrong() {
    ActiveGame.wrong += 1;
    SoundFX.play('wrong');
    updateHUDDisplay();
}

function startActiveGame() {
    const game = ActiveGame.meta;
    resetGameHUD(game.time);
    ActiveGame.isRunning = true;

    document.getElementById('gmStartScreen').classList.add('hidden');
    document.getElementById('gmResultScreen').classList.add('hidden');
    const board = document.getElementById('gmBoard');
    board.classList.remove('hidden');
    board.innerHTML = '';

    ActiveGame.timerInterval = setInterval(() => {
        ActiveGame.timeLeft--;
        updateHUDDisplay();
        if (ActiveGame.timeLeft <= 0) {
            endActiveGame();
        }
    }, 1000);

    // Launch Specific Game Engine
    GAME_ENGINES[game.id](board);
}

function endActiveGame() {
    clearInterval(ActiveGame.timerInterval);
    ActiveGame.isRunning = false;
    SoundFX.play('win');

    const game = ActiveGame.meta;
    const earnedXP = Math.round(ActiveGame.score * 0.8) + 20;

    // Update Stats
    const s = AppState.stats;
    s.xp += earnedXP;
    s.totalScore += ActiveGame.score;
    s.dailyScore += ActiveGame.score;
    s.gamesPlayed += 1;
    s.dailyQuests.playedToday += 1;
    s.dailyQuests.correctToday += ActiveGame.correct;
    s.dailyQuests.scoreToday += ActiveGame.score;

    if (!s.highScores[game.id] || ActiveGame.score > s.highScores[game.id]) {
        s.highScores[game.id] = ActiveGame.score;
    }

    s.history.push({
        title: game.title,
        score: ActiveGame.score,
        correct: ActiveGame.correct,
        wrong: ActiveGame.wrong,
        date: new Date().toLocaleDateString('uz-UZ')
    });

    checkAchievements();
    saveState();
    updateAllUI();

    // Show Result Overlay
    document.getElementById('gmBoard').classList.add('hidden');
    document.getElementById('gmResultScreen').classList.remove('hidden');
    document.getElementById('resFinalScore').textContent = ActiveGame.score;
    document.getElementById('resFinalXP').textContent = `+${earnedXP} XP`;
    document.getElementById('resFinalCorrect').textContent = ActiveGame.correct;
    document.getElementById('resFinalWrong').textContent = ActiveGame.wrong;
}

function checkAchievements() {
    const s = AppState.stats;
    ACHIEVEMENTS_LIST.forEach(ach => {
        if (!s.unlockedAchievements.includes(ach.id) && ach.check(s)) {
            s.unlockedAchievements.push(ach.id);
            AppState.notifications.unshift(`🏆 Yangi yutuq ochildi: ${ach.title}`);
            triggerAchievementPopup(ach);
        }
    });
}

function triggerAchievementPopup(ach) {
    const popup = document.getElementById('achievementPopup');
    document.getElementById('achPopupIcon').textContent = ach.icon;
    document.getElementById('achPopupTitle').textContent = ach.title;
    document.getElementById('achPopupDesc').textContent = ach.desc;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 4200);
}

// Game Modal Controls
document.getElementById('gmStartBtn').addEventListener('click', startActiveGame);
document.getElementById('gmRestartBtn').addEventListener('click', startActiveGame);
document.getElementById('resPlayAgainBtn').addEventListener('click', startActiveGame);
document.getElementById('gmRulesBtn').addEventListener('click', () => {
    document.getElementById('gmRulesBox').classList.toggle('hidden');
});
const closeGameModal = () => {
    clearInterval(ActiveGame.timerInterval);
    ActiveGame.isRunning = false;
    document.getElementById('gameModal').classList.add('hidden');
};
document.getElementById('gmCloseBtn').addEventListener('click', closeGameModal);
document.getElementById('resBackBtn').addEventListener('click', closeGameModal);

// =========================================================
// 8. ALL 15 REAL WORKING GAME ENGINES
// =========================================================
const GAME_ENGINES = {

    // 1. MATEMATIK MISOLLAR
    math(board) {
        const diff = getAgeDifficulty().level;
        function nextQ() {
            if (!ActiveGame.isRunning) return;
            const max = diff === 1 ? 15 : diff === 2 ? 35 : diff === 3 ? 70 : 120;
            const ops = diff === 1 ? ['+', '-'] : ['+', '-', '×'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            let a = Math.floor(Math.random() * max) + 2;
            let b = Math.floor(Math.random() * (op === '×' ? 12 : max)) + 2;
            if (op === '-' && a < b) [a, b] = [b, a];
            const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;

            const opts = new Set([ans]);
            while (opts.size < 4) {
                const offset = (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
                if (ans + offset >= 0) opts.add(ans + offset);
            }
            const shuffled = [...opts].sort(() => Math.random() - 0.5);

            board.innerHTML = `
                <div class="q-box">${a} ${op} ${b} = ?</div>
                <div class="options-grid-2">
                    ${shuffled.map(v => `<button class="game-opt-btn" data-val="${v}">${v}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.val) === ans) addScore(15);
                    else addWrong();
                    nextQ();
                };
            });
        }
        nextQ();
    },

    // 2. SUDOKU (4x4)
    sudoku(board) {
        const puzzles = [
            { sol: [1,2,3,4, 3,4,1,2, 2,1,4,3, 4,3,2,1], mask: [1,0,3,0, 0,4,0,2, 2,0,4,0, 0,3,0,1] },
            { sol: [2,4,1,3, 1,3,2,4, 4,2,3,1, 3,1,4,2], mask: [0,4,1,0, 1,0,0,4, 4,0,0,1, 0,1,4,0] },
            { sol: [3,1,4,2, 4,2,3,1, 1,3,2,4, 2,4,1,3], mask: [3,0,0,2, 0,2,3,0, 0,3,2,0, 2,0,0,3] }
        ];
        let pIdx = 0;

        function renderSudoku() {
            if (!ActiveGame.isRunning) return;
            const p = puzzles[pIdx % puzzles.length];
            board.innerHTML = `
                <p style="margin-bottom:12px;color:var(--text-muted)">1 dan 4 gacha raqamlarni kiriting:</p>
                <div class="sudoku-grid">
                    ${p.mask.map((val, i) => val !== 0
                        ? `<input class="sudoku-cell fixed" value="${val}" readonly>`
                        : `<input class="sudoku-cell editable" data-idx="${i}" maxlength="1" type="number" min="1" max="4">`
                    ).join('')}
                </div>
                <button class="btn-primary" id="checkSudokuBtn">✅ Tekshirish</button>
            `;

            document.getElementById('checkSudokuBtn').onclick = () => {
                let allFilled = true;
                let allCorrect = true;
                board.querySelectorAll('.editable').forEach(inp => {
                    const idx = Number(inp.dataset.idx);
                    const v = Number(inp.value);
                    if (!v) allFilled = false;
                    if (v !== p.sol[idx]) allCorrect = false;
                });

                if (!allFilled) {
                    showToast('Barcha kataklarni to‘ldiring!');
                    return;
                }
                if (allCorrect) {
                    addScore(40);
                    pIdx++;
                    renderSudoku();
                } else {
                    addWrong();
                    showToast('Xatolik bor, qayta tekshiring!');
                }
            };
        }
        renderSudoku();
    },

    // 3. SHAXMAT JUMBOQLARI
    chess(board) {
        const questions = [
            { q: '♞ Ot (Knight) shaxmat taxtasida qanday shaklda yuradi?', opts: ['"L" (G) shaklida', 'Faqat diagonal', 'Faqat to‘g‘ri chiziqda', '1 katak oldinga'], ans: 0 },
            { q: '♛ Qaysi figura bir vaqtda ham Rux, ham Fil kabi yura oladi?', opts: ['Shoh', 'Farzin (Vazir)', 'Piyoda', 'Ot'], ans: 1 },
            { q: '♟️ Piyoda taxtaning oxirgi gorizontaliga yetib borsa nima bo‘ladi?', opts: ['O‘yindan chiqadi', 'Istalgan figuraga aylanadi (Shohdan tashqari)', 'Orqaga qaytadi', 'Durang bo‘ladi'], ans: 1 },
            { q: '♜ Rokirovka (Castles) qaysi ikki figura o‘rtasida bajariladi?', opts: ['Shoh va Farzin', 'Shoh va Rux', 'Fil va Ot', 'Farzin va Rux'], ans: 1 },
            { q: '♝ Oq katakdagi Fil o‘yin davomida qora katakka o‘ta oladimi?', opts: ['Ha, istalgan payt', 'Yo‘q, hech qachon', 'Faqat shohga hujumda', 'Faqat 1 marta'], ans: 1 },
            { q: '♚ Shohga hujum qilinganda va undan qochish imkoni bo‘lmaganda bu nima deyiladi?', opts: ['Pat', 'Mot', 'Shox', 'Rokirovka'], ans: 1 }
        ];
        let idx = 0;

        function nextChess() {
            if (!ActiveGame.isRunning) return;
            const item = questions[idx % questions.length];
            board.innerHTML = `
                <div class="q-box">${item.q}</div>
                <div class="options-grid-2">
                    ${item.opts.map((o, i) => `<button class="game-opt-btn" data-i="${i}">${o}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.i) === item.ans) addScore(20);
                    else addWrong();
                    idx++;
                    nextChess();
                };
            });
        }
        nextChess();
    },

    // 4. XOTIRA KARTALARI
    memory(board) {
        const emojis = ['🧠', '🚀', '🦉', '💎', '⚡', '🎯', '🔮', '🏆'];
        function initBoard() {
            if (!ActiveGame.isRunning) return;
            const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
            let flipped = [];
            let matchedCount = 0;

            board.innerHTML = `<div class="memory-grid">${deck.map((em, i) => `<button class="mem-card" data-i="${i}" data-em="${em}">${em}</button>`).join('')}</div>`;

            board.querySelectorAll('.mem-card').forEach(card => {
                card.onclick = () => {
                    if (flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
                    card.classList.add('flipped');
                    flipped.push(card);

                    if (flipped.length === 2) {
                        const [c1, c2] = flipped;
                        if (c1.dataset.em === c2.dataset.em) {
                            c1.classList.add('matched');
                            c2.classList.add('matched');
                            flipped = [];
                            matchedCount += 2;
                            addScore(15);
                            if (matchedCount === deck.length) {
                                setTimeout(initBoard, 500);
                            }
                        } else {
                            addWrong();
                            setTimeout(() => {
                                c1.classList.remove('flipped');
                                c2.classList.remove('flipped');
                                flipped = [];
                            }, 650);
                        }
                    }
                };
            });
        }
        initBoard();
    },

    // 5. SONLAR KETMA-KETLIGI
    sequence(board) {
        function nextSeq() {
            if (!ActiveGame.isRunning) return;
            const type = Math.floor(Math.random() * 3);
            let seq = [], ans = 0;

            if (type === 0) { // Arithmetic
                const start = Math.floor(Math.random() * 10) + 1;
                const step = Math.floor(Math.random() * 7) + 2;
                seq = [start, start + step, start + step * 2, start + step * 3];
                ans = start + step * 4;
            } else if (type === 1) { // Geometric x2
                const start = Math.floor(Math.random() * 4) + 1;
                seq = [start, start * 2, start * 4, start * 8];
                ans = start * 16;
            } else { // Squares
                const s = Math.floor(Math.random() * 4) + 1;
                seq = [s*s, (s+1)*(s+1), (s+2)*(s+2), (s+3)*(s+3)];
                ans = (s+4)*(s+4);
            }

            const opts = new Set([ans]);
            while (opts.size < 4) opts.add(ans + (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1));
            const shuffled = [...opts].sort(() => Math.random() - 0.5);

            board.innerHTML = `
                <div class="q-box">${seq.join(' , ')} , <span style="color:#a855f7">?</span></div>
                <div class="options-grid-2">
                    ${shuffled.map(v => `<button class="game-opt-btn" data-v="${v}">${v}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.v) === ans) addScore(20);
                    else addWrong();
                    nextSeq();
                };
            });
        }
        nextSeq();
    },

    // 6. MANTIQIY SAVOLLAR
    logic(board) {
        const riddles = [
            { q: 'Qaysi oyda 28 kun bor?', opts: ['Faqat Fevralda', 'Barcha oylarda', 'Hech qaysi oyda', 'Martda'], ans: 1 },
            { q: '1 kg paxta og‘irmi yoki 1 kg temir?', opts: ['Temir og‘ir', 'Paxta og‘ir', 'Ikkalasi teng', 'Aniqlab bo‘lmaydi'], ans: 2 },
            { q: 'U qanchalik ko‘p olinsa, shunchalik kattalashadi. U nima?', opts: ['O‘ra (chuqur)', 'Pul', 'Suv', 'Qor'], ans: 0 },
            { q: 'Daraxtda 5 ta qush bor edi. Ovchi 1 tasini otdi. Nechta qush qoldi?', opts: ['4 ta', '1 ta', '0 ta (qolganlari uchib ketdi)', '5 ta'], ans: 2 },
            { q: 'Yomg‘ir yog‘ayotganda qarg‘a qanday daraxtga qo‘nadi?', opts: ['Ho‘l daraxtga', 'Quruq daraxtga', 'Baland daraxtga', 'Past daraxtga'], ans: 0 },
            { q: 'Stolning 4 ta burchagi bor. 1 tasini arralab tashlasak, nechta burchak qoladi?', opts: ['3 ta', '5 ta', '4 ta', '2 ta'], ans: 1 }
        ];
        let idx = 0;

        function nextLogic() {
            if (!ActiveGame.isRunning) return;
            const r = riddles[idx % riddles.length];
            board.innerHTML = `
                <div class="q-box">${r.q}</div>
                <div class="options-grid-2">
                    ${r.opts.map((o, i) => `<button class="game-opt-btn" data-i="${i}">${o}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.i) === r.ans) addScore(20);
                    else addWrong();
                    idx++;
                    nextLogic();
                };
            });
        }
        nextLogic();
    },

    // 7. SO'Z TOPISH
    wordfind(board) {
        const words = [
            { hint: 'Kitoblar saqlanadigan va o‘qiladigan maskan (9 harf)', word: 'KUTUBXONA' },
            { hint: 'Koinotga uchuvchi kasb egasi (9 harf)', word: 'KOSMONAVT' },
            { hint: 'O‘zbekistonning poytaxti (8 harf)', word: 'TOSHKENT' },
            { hint: 'Maktabda bilim beruvchi ustoz (9 harf)', word: 'O‘QITUVCHI' },
            { hint: 'Kompyuter dasturlarini yaratuvchi mutaxassis (9 harf)', word: 'DASTURCHI' },
            { hint: 'Intellektual bilim va zukkolik (7 harf)', word: 'ZAKOVAT' }
        ];
        let idx = 0;

        function nextWord() {
            if (!ActiveGame.isRunning) return;
            const item = words[idx % words.length];
            const masked = item.word.split('').map((ch, i) => (i === 0 || i === item.word.length - 1 ? ch : '_')).join(' ');

            board.innerHTML = `
                <div class="q-box">
                    <p style="font-size:1rem;color:#c4b5fd;margin-bottom:10px;">${item.hint}</p>
                    <div style="letter-spacing:6px;font-size:2rem">${masked}</div>
                </div>
                <div style="display:flex;gap:10px;width:100%;max-width:420px;">
                    <input type="text" id="wordGuessInput" placeholder="So‘zni yozing..." style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border-glass);background:rgba(255,255,255,0.08);color:var(--text-main);font-size:1.1rem;text-transform:uppercase;">
                    <button class="btn-primary" id="wordSubmitBtn">Tekshirish</button>
                </div>
            `;
            const inp = document.getElementById('wordGuessInput');
            inp.focus();
            const check = () => {
                if (inp.value.trim().toUpperCase() === item.word) {
                    addScore(25);
                    idx++;
                    nextWord();
                } else {
                    addWrong();
                    showToast('Noto‘g‘ri, yana urinib ko‘ring!');
                }
            };
            document.getElementById('wordSubmitBtn').onclick = check;
            inp.onkeydown = (e) => { if (e.key === 'Enter') check(); };
        }
        nextWord();
    },

    // 8. HARFLARDAN SO'Z TUZISH (ANAGRAM)
    anagram(board) {
        const list = ['KITOB', 'MAKTAB', 'ILM', 'QALAM', 'YULDUZ', 'QUYOSH', 'VATAN', 'BILIM', 'MANTIQ', 'SHAXMAT'];
        let idx = 0;

        function nextAna() {
            if (!ActiveGame.isRunning) return;
            const word = list[idx % list.length];
            const scrambled = word.split('').sort(() => Math.random() - 0.5).join(' - ');

            board.innerHTML = `
                <div class="q-box">
                    <small style="display:block;font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;">Aralash harflardan so‘z tuzing:</small>
                    <span style="color:#38bdf8">${scrambled}</span>
                </div>
                <div style="display:flex;gap:10px;width:100%;max-width:420px;">
                    <input type="text" id="anaInput" placeholder="To‘g‘ri so‘z..." style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border-glass);background:rgba(255,255,255,0.08);color:var(--text-main);font-size:1.1rem;text-transform:uppercase;">
                    <button class="btn-primary" id="anaBtn">Tasdiqlash</button>
                </div>
            `;
            const inp = document.getElementById('anaInput');
            inp.focus();
            const verify = () => {
                if (inp.value.trim().toUpperCase() === word) {
                    addScore(20);
                    idx++;
                    nextAna();
                } else {
                    addWrong();
                }
            };
            document.getElementById('anaBtn').onclick = verify;
            inp.onkeydown = (e) => { if (e.key === 'Enter') verify(); };
        }
        nextAna();
    },

    // 9. RANGLARNI ESLAB QOLISH (SIMON SAYS)
    colormem(board) {
        const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
        let sequence = [];
        let userStep = 0;
        let locked = true;

        board.innerHTML = `
            <p id="simonStatus" style="margin-bottom:16px;font-weight:700;color:#c4b5fd">Kuzating...</p>
            <div class="simon-grid">
                ${colors.map((c, i) => `<button class="simon-pad" data-i="${i}" style="background:${c}"></button>`).join('')}
            </div>
        `;

        const pads = board.querySelectorAll('.simon-pad');
        const statusEl = document.getElementById('simonStatus');

        function playSequence() {
            if (!ActiveGame.isRunning) return;
            locked = true;
            userStep = 0;
            sequence.push(Math.floor(Math.random() * 4));
            statusEl.textContent = `Ketma-ketlikni eslab qoling (${sequence.length} ta)...`;

            sequence.forEach((padIdx, step) => {
                setTimeout(() => {
                    pads[padIdx].classList.add('lit');
                    setTimeout(() => pads[padIdx].classList.remove('lit'), 350);
                    if (step === sequence.length - 1) {
                        setTimeout(() => {
                            locked = false;
                            statusEl.textContent = 'Endi siz takrorlang!';
                        }, 400);
                    }
                }, (step + 1) * 650);
            });
        }

        pads.forEach(pad => {
            pad.onclick = () => {
                if (locked || !ActiveGame.isRunning) return;
                const i = Number(pad.dataset.i);
                pad.classList.add('lit');
                setTimeout(() => pad.classList.remove('lit'), 200);

                if (i === sequence[userStep]) {
                    userStep++;
                    if (userStep === sequence.length) {
                        addScore(25);
                        setTimeout(playSequence, 500);
                    }
                } else {
                    addWrong();
                    sequence = [];
                    setTimeout(playSequence, 600);
                }
            };
        });

        playSequence();
    },

    // 10. FARQNI TOPISH
    difference(board) {
        const pairs = [
            ['😀', '😃'], ['🍎', '🍅'], ['🔒', '🔓'], ['🌞', '🌝'],
            ['⌚', '⏰'], ['📘', '📙'], ['🐱', '🐯'], ['⭐', '🌟']
        ];

        function nextDiff() {
            if (!ActiveGame.isRunning) return;
            const [mainEm, oddEm] = pairs[Math.floor(Math.random() * pairs.length)];
            const size = 16;
            const oddIdx = Math.floor(Math.random() * size);

            board.innerHTML = `
                <p style="margin-bottom:14px;color:var(--text-muted)">Boshqalaridan farq qiluvchi belgini toping:</p>
                <div class="attention-grid" style="grid-template-columns:repeat(4,64px)">
                    ${Array.from({ length: size }).map((_, i) => `
                        <button class="att-cell" data-odd="${i === oddIdx}">${i === oddIdx ? oddEm : mainEm}</button>
                    `).join('')}
                </div>
            `;

            board.querySelectorAll('.att-cell').forEach(btn => {
                btn.onclick = () => {
                    if (btn.dataset.odd === 'true') {
                        addScore(15);
                        nextDiff();
                    } else {
                        addWrong();
                    }
                };
            });
        }
        nextDiff();
    },

    // 11. SHAKLLAR KETMA-KETLIGI
    shapes(board) {
        const patterns = [
            { seq: ['🔴', '🔵', '🔴', '🔵'], opts: ['🔴', '🟢', '🟡', '🟣'], ans: 0 },
            { seq: ['🔺', '🔺', '🟦', '🔺', '🔺'], opts: ['🔺', '🟦', '🟠', '⭐'], ans: 1 },
            { seq: ['🌑', '🌓', '🌕', '🌗'], opts: ['🌑', '☀️', '⭐', '🌍'], ans: 0 },
            { seq: ['1️⃣', '2️⃣', '4️⃣', '8️⃣'], opts: ['10', '16', '12', '6'], ans: 1 },
            { seq: ['⬆️', '➡️', '⬇️', '⬅️'], opts: ['⬆️', '↗️', '⬇️', '🔄'], ans: 0 }
        ];
        let idx = 0;

        function nextShape() {
            if (!ActiveGame.isRunning) return;
            const p = patterns[idx % patterns.length];
            board.innerHTML = `
                <div class="q-box">${p.seq.join('  ')}  ❓</div>
                <div class="options-grid-2">
                    ${p.opts.map((o, i) => `<button class="game-opt-btn" data-i="${i}" style="font-size:1.6rem">${o}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.i) === p.ans) addScore(20);
                    else addWrong();
                    idx++;
                    nextShape();
                };
            });
        }
        nextShape();
    },

    // 12. TEZ FIKRLASH (STROOP EFFECT)
    fastthink(board) {
        const items = [
            { name: 'QIZIL', color: '#ef4444' },
            { name: 'KO‘K', color: '#3b82f6' },
            { name: 'YASHIL', color: '#10b981' },
            { name: 'SARIQ', color: '#f59e0b' }
        ];

        function nextStroop() {
            if (!ActiveGame.isRunning) return;
            const wordObj = items[Math.floor(Math.random() * items.length)];
            const colorObj = items[Math.floor(Math.random() * items.length)];

            board.innerHTML = `
                <p style="margin-bottom:10px;color:var(--text-muted)">Matn rangiga emas, <strong>SO‘Z MA’NOSIGA</strong> mos rangni bosing!</p>
                <div class="q-box" style="color:${colorObj.color};font-size:2.5rem">${wordObj.name}</div>
                <div class="options-grid-2">
                    ${items.map(it => `<button class="game-opt-btn" data-name="${it.name}">${it.name}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (btn.dataset.name === wordObj.name) addScore(15);
                    else addWrong();
                    nextStroop();
                };
            });
        }
        nextStroop();
    },

    // 13. LABIRINTDAN CHIQISH
    maze(board) {
        // 0 = path, 1 = wall
        const maps = [
            [
                [0,1,0,0,0,0,0],
                [0,1,0,1,1,1,0],
                [0,0,0,1,0,0,0],
                [1,1,0,1,0,1,1],
                [0,0,0,0,0,1,0],
                [0,1,1,1,0,0,0],
                [0,0,0,1,1,1,0]
            ],
            [
                [0,0,0,1,0,0,0],
                [1,1,0,1,0,1,0],
                [0,0,0,0,0,1,0],
                [0,1,1,1,1,1,0],
                [0,0,0,0,0,0,0],
                [1,1,0,1,1,1,1],
                [0,0,0,0,0,0,0]
            ]
        ];
        let mapIdx = 0;
        let px = 0, py = 0;
        const gx = 6, gy = 6;

        function renderMaze() {
            if (!ActiveGame.isRunning) return;
            const grid = maps[mapIdx % maps.length];
            let html = `<div class="maze-grid" style="grid-template-columns:repeat(7,34px)">`;
            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 7; x++) {
                    let content = '';
                    if (x === px && y === py) content = '🧑‍🚀';
                    else if (x === gx && y === gy) content = '🏁';
                    html += `<div class="maze-cell ${grid[y][x] === 1 ? 'maze-wall' : 'maze-path'}">${content}</div>`;
                }
            }
            html += `</div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button class="btn-secondary" id="mUp">⬆️</button>
                    <button class="btn-secondary" id="mLeft">⬅️</button>
                    <button class="btn-secondary" id="mDown">⬇️</button>
                    <button class="btn-secondary" id="mRight">➡️</button>
                </div>`;
            board.innerHTML = html;

            const move = (dx, dy) => {
                const nx = px + dx, ny = py + dy;
                if (nx >= 0 && nx < 7 && ny >= 0 && ny < 7 && grid[ny][nx] === 0) {
                    px = nx; py = ny;
                    if (px === gx && py === gy) {
                        addScore(35);
                        px = 0; py = 0;
                        mapIdx++;
                    }
                    renderMaze();
                } else {
                    addWrong();
                }
            };

            document.getElementById('mUp').onclick = () => move(0, -1);
            document.getElementById('mDown').onclick = () => move(0, 1);
            document.getElementById('mLeft').onclick = () => move(-1, 0);
            document.getElementById('mRight').onclick = () => move(1, 0);
        }
        renderMaze();
    },

    // 14. RASMLI JUMBOQLAR (EMOJI REBUS)
    rebus(board) {
        const rebuses = [
            { pic: '☀️ + 👓', opts: ['Quyosh ko‘zoynagi', 'Yoz fasli', 'Issiq kun', 'Oyna'], ans: 0 },
            { pic: '🐝 + 🍯', opts: ['Asalari va asal', 'Shirin choy', 'Gul bog‘i', 'Kapalak'], ans: 0 },
            { pic: '📚 + 🏛️', opts: ['Muzey', 'Kutubxona', 'Teatr', 'Bozor'], ans: 1 },
            { pic: '🌍 + 🗺️', opts: ['Geografiya', 'Tarix', 'Kimyo', 'Matematika'], ans: 0 },
            { pic: '🚀 + 🌙', opts: ['Oyga parvoz', 'Samolyot', 'Yulduzlar', 'Bulut'], ans: 0 }
        ];
        let idx = 0;

        function nextRebus() {
            if (!ActiveGame.isRunning) return;
            const r = rebuses[idx % rebuses.length];
            board.innerHTML = `
                <div class="q-box" style="font-size:2.6rem">${r.pic}</div>
                <div class="options-grid-2">
                    ${r.opts.map((o, i) => `<button class="game-opt-btn" data-i="${i}">${o}</button>`).join('')}
                </div>
            `;
            board.querySelectorAll('.game-opt-btn').forEach(btn => {
                btn.onclick = () => {
                    if (Number(btn.dataset.i) === r.ans) addScore(20);
                    else addWrong();
                    idx++;
                    nextRebus();
                };
            });
        }
        nextRebus();
    },

    // 15. DIQQATNI SINASH (SCHULTE TABLE 1–16)
    schulte(board) {
        function initSchulte() {
            if (!ActiveGame.isRunning) return;
            let expected = 1;
            const nums = Array.from({ length: 16 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

            board.innerHTML = `
                <p style="margin-bottom:12px;font-weight:700">Keyingi son: <span id="schTarget" style="color:#a855f7;font-size:1.3rem">1</span></p>
                <div class="attention-grid" style="grid-template-columns:repeat(4,64px)">
                    ${nums.map(n => `<button class="att-cell" data-n="${n}">${n}</button>`).join('')}
                </div>
            `;

            board.querySelectorAll('.att-cell').forEach(btn => {
                btn.onclick = () => {
                    const val = Number(btn.dataset.n);
                    if (val === expected) {
                        btn.style.background = 'var(--success)';
                        btn.style.color = '#fff';
                        expected++;
                        addScore(10);
                        if (expected > 16) {
                            setTimeout(initSchulte, 300);
                        } else {
                            document.getElementById('schTarget').textContent = expected;
                        }
                    } else {
                        addWrong();
                    }
                };
            });
        }
        initSchulte();
    }
};
