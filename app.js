function isLoggedIn() {
    return !!currentUser;
}

class Task {

    constructor(title) {
        this.id = Date.now();
        this.title = title;
        this.completed = false;

        this.timer = {
            duration: 0,
            remaining: 0,
            running: false
        };
    }
}

/* COMMUNITY */

class CommunityPost {

    constructor(message, author = "Anonymous") {

        this.id = Date.now() + Math.random();
        this.message = message;
        this.author = author;
        this.time = new Date();
    }
}

const communityFeed = [

    new CommunityPost(
        "I only completed one task today, but that's already pretty good. 👍",
        "Alex"
    ),

    new CommunityPost(
        "ADHD tip: start with 5 minutes only.",
        "Mia"
    ),

    new CommunityPost(
        "If you are distracted, it’s okay. restart small.",
        "Sam"
    )
];

/* QUOTE API */

async function loadQuote() {
    try {
        const res = await fetch("https://zenquotes.io/api/random");
        const data = await res.json();

        document.getElementById("dailyQuote").innerText =
            `"${data[0].q}" — ${data[0].a}`;

    } catch (err) {
        console.log("Quote API failed:", err);

        // fallback
        const fallbackQuotes = [
            "Stay focused. Keep going.",
            "Small progress is still progress.",
            "Discipline beats motivation.",
            "One task at a time."
        ];

        document.getElementById("dailyQuote").innerText =
            fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
}
/* REPOSITORY */

class TaskRepository {

    constructor() {

        this.tasks =
            JSON.parse(localStorage.getItem("tasks") || "[]");
    }

    save(task) {

        this.tasks.push(task);
        this.sync();
    }

    delete(id) {

        this.tasks =
            this.tasks.filter(t => t.id !== id);

        this.sync();
    }

    sync() {

        localStorage.setItem(
            "tasks",
            JSON.stringify(this.tasks)
        );
    }

    getAll() {
        return this.tasks;
    }
}

/* SERVICE */

class TaskService {

    constructor(repo) {
        this.repo = repo;
    }

    addTask(title) {
        this.repo.save(new Task(title));
    }

    deleteTask(id) {
        this.repo.delete(id);
    }

    toggleTask(id) {

        this.repo.tasks =
            this.repo.tasks.map(t =>
                t.id === id
                    ? { ...t, completed: !t.completed }
                    : t
            );

        this.repo.sync();
    }

    tick() {

        this.repo.tasks.forEach(t => {

            if (t.timer?.running && t.timer.remaining > 0) {

                t.timer.remaining--;

                if (t.timer.remaining <= 0) {
                    t.timer.running = false;
                    alert("Finished:" + t.title);
                }
            }
        });

        this.repo.sync();
    }

    getAll() {
        return this.repo.getAll();
    }

    getProgress() {

        const tasks = this.repo.getAll();

        const done = tasks.filter(t => t.completed).length;

        return {
            done,
            total: tasks.length,
            percent: tasks.length
                ? (done / tasks.length) * 100
                : 0
        };
    }
}

const repo = new TaskRepository();
const service = new TaskService(repo);

/* Cookie */

const cookieManager = {

    show() {

    if (!isLoggedIn()) return;

    const accepted =
    localStorage.getItem(`cookiesAccepted_${currentUser?.id}`);

    const rejected =
    localStorage.getItem(`cookiesRejected_${currentUser?.id}`);

    if (accepted === "true" || rejected === "true") return;

const necessary =
    localStorage.getItem(`cookiesNecessary_${currentUser?.id}`);

if (
    accepted === "true" ||
    rejected === "true" ||
    necessary === "true"
) return;

    const banner =
        document.getElementById("cookieBanner");

    if (banner) {

        banner.classList.remove("hidden");

        setTimeout(() => {
            banner.classList.add("show");
        }, 50);
    }
},

    accept() {

        localStorage.setItem(`cookiesAccepted_${currentUser.id}`, "true");

        this.hide();
    },

reject() {

    localStorage.setItem(`cookiesRejected_${currentUser.id}`, "true");

    this.hide();
},

    dismiss() {

    localStorage.setItem(
        "cookiesNecessary",
        "true"
    );

    this.hide();
},

    hide() {

    const banner =
        document.getElementById("cookieBanner");

    banner.classList.remove("show");

    setTimeout(() => {

        banner.classList.add("hidden");

    }, 300);
}

};

/* AUTH */

let currentUser = null;

function getUsers() {
    let users = JSON.parse(localStorage.getItem("users") || "[]");

    if (!Array.isArray(users)) {
        users = [];
    }

    return users;
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

const auth = {

    showRegister() {
        document.getElementById("loginBox")
            .classList.add("hidden");

        document.getElementById("registerBox")
            .classList.remove("hidden");
    },

    showLogin() {
        document.getElementById("registerBox")
            .classList.add("hidden");

        document.getElementById("loginBox")
            .classList.remove("hidden");
    },

    register() {
        console.log("REGISTER CLICKED");

        const username =
            document.getElementById("registerUsername").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value.trim();

        if (!username || !email || !password) {
            alert("Please complete all fields.");
            return;
        }

        const users = getUsers();

        const exists = users.find(u => u.email === email);

        if (exists) {
            alert("Email already exists.");
            return;
        }

        users.push({
            id: Date.now(),
            username,
            email,
            password
        });

        saveUsers(users);

        alert("Account created successfully!");
        auth.showLogin();
    },

    login() {
        console.log("LOGIN CLICKED");

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value.trim();

        const users = getUsers();

        const existingUser =
            users.find(u => u.email === email);

        if (!existingUser) {
            alert("No account found. Please register first.");
            return;
        }

        if (existingUser.password !== password) {
            alert("Incorrect password.");
            return;
        }

        currentUser = existingUser;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(existingUser)
        );

        auth.enterApp(existingUser);
    },

    enterApp(userData) {
        currentUser = userData;

        document.getElementById("authPage")
            .classList.add("hidden");

        document.getElementById("mainApp")
            .classList.remove("hidden");

        document.getElementById("userName").innerText =
            userData.username;

        document.getElementById("userEmail").innerText =
            userData.email;

        document.getElementById("userId").innerText =
            userData.id;

            cookieManager.show();
    },

    logout() {
        currentUser = null;

        localStorage.removeItem("currentUser");

        document.getElementById("mainApp")
            .classList.add("hidden");

        document.getElementById("authPage")
            .classList.remove("hidden");

        if (typeof ui !== "undefined" && ui.closeSettings) {
            ui.closeSettings();
        }

        auth.showLogin();

focusMode = false;
focusTaskId = null;

document.getElementById("cookieBanner")
    .classList.add("hidden");

document.getElementById("timerModal")
    .classList.add("hidden");

document.getElementById("countdownModal")
    .classList.add("hidden");

    }
};

/* STATE */

let pendingTimer = {
    taskId: null,
    seconds: 0
};

let activeTimerTaskId = null;
let selectedMood = null;

/* ACCESSIBILITY */

let speechEnabled = false;

/* FOCUS MODE STATE (NEW) */

let focusMode = false;
let focusTaskId = null;

/* UI */

const ui = {

    render() {

        const list = document.getElementById("taskList");
        list.innerHTML = "";

        service.getAll().forEach(task => {

            const t = task.timer || {};

            const time =
                t.duration
                    ? `${Math.floor(t.remaining / 60)}:${String(t.remaining % 60).padStart(2, '0')}`
                    : "";

            const div = document.createElement("div");

            div.className = "task-item";

            /* focus mode highlight */
            if (focusMode) {

                if (focusTaskId && task.id !== focusTaskId) {
                    div.classList.add("focus-dim");
                }

                if (task.id === focusTaskId) {
                    div.classList.add("focus-active");
                }
            }

            div.innerHTML = `

                <div class="task-left">

                    <input type="checkbox"
                        ${task.completed ? "checked" : ""}
                        onchange="app.toggle(${task.id})">

                    <div>

                        <p class="task-title"
                            style="text-decoration:${task.completed ? 'line-through' : 'none'}">

                            ${task.title}

                        </p>

                    </div>

                </div>

                <div class="task-actions">

                    <span>${time}</span>

                    <button onclick="app.openTimer(${task.id})">⏲</button>
                    <button
    aria-label="Delete task"
    onclick="app.deleteTask(${task.id})">

    🗑

</button>

                </div>
            `;

            list.appendChild(div);
        });

        const p = service.getProgress();

        document.getElementById("progressFill").style.width = p.percent + "%";
        document.getElementById("progressText").innerText = `${p.done} / ${p.total} completed`;
        document.getElementById("bigProgressText").innerText = `${p.done} / ${p.total}`;
        document.getElementById("circleText").innerText = `${Math.round(p.percent)}%`;

        document.getElementById("circle")
            .style
            .setProperty("--p", `${p.percent}%`);

        ui.renderCommunity();
    },

    renderCommunity() {

if (focusMode) {
    document.getElementById("communitySection")
        .classList.add("hidden");
    return;
}

if (focusMode === false) {
    console.log("Timer started without focus mode");
}

document.getElementById("communitySection")
    .classList.remove("hidden");

        const feed = document.getElementById("communityFeed");
        if (!feed) return;

        feed.innerHTML = "";

        communityFeed.slice().reverse().forEach(post => {

            const div = document.createElement("div");
            div.className = "community-card";

            div.innerHTML = `
                <p class="community-message">${post.message}</p>
                <div class="community-author">
                    ${post.author} · ${new Date(post.time).toLocaleTimeString()}
                </div>
            `;

            feed.appendChild(div);
        });
    },

openDeadlineModal() {
    document.getElementById("deadlineModal").classList.remove("hidden");
},

    openModal() {
        document.getElementById("modal").classList.remove("hidden");
    },

    closeModal() {
        document.getElementById("modal").classList.add("hidden");
    },

    openSettings() {
        document.getElementById("settingsDrawer").classList.add("open");
        document.getElementById("settingsOverlay").classList.remove("hidden");
    },

    closeSettings() {
        document.getElementById("settingsDrawer").classList.remove("open");
        document.getElementById("settingsOverlay").classList.add("hidden");
    },

    closeTimerModal() {
        document.getElementById("timerModal").classList.add("hidden");
    },

    toggleDrawer() {
        document.getElementById("drawer").classList.add("open");
        document.getElementById("drawerOverlay").classList.remove("hidden");
    },

    closeDrawer() {
        document.getElementById("drawer").classList.remove("open");
        document.getElementById("drawerOverlay").classList.add("hidden");
    }
};

/* ROUTER */

const router = {

    go(page) {

        document.getElementById("homePage").classList.add("hidden");
        document.getElementById("progressPage").classList.add("hidden");

        if (page === "home") {
            document.getElementById("homePage").classList.remove("hidden");
        } else {
            document.getElementById("progressPage").classList.remove("hidden");
        }
    }
};

/* APP */

const app = {

    addTask() {

    const input =
        document.getElementById("taskInput");

    if (input.value.trim()) {

        const title = input.value;

        service.addTask(title);

        speak(`Task added: ${title}`);

        input.value = "";

        ui.closeModal();

        ui.render();
    }
},

    deleteTask(id) {

    const task =
        service.getAll().find(t => t.id === id);

    if (task) {
        speak(`Deleted task ${task.title}`);
    }

    service.deleteTask(id);

    ui.render();
},

    toggle(id) {

    service.toggleTask(id);

    const task =
        service.getAll().find(t => t.id === id);

    if (task) {

        speak(
            `${task.title} ${
                task.completed
                    ? "completed"
                    : "uncompleted"
            }`
        );
    }

    ui.render();
},

toggleFocusMode(enabled) {
    focusMode = enabled;

    if (!enabled) {
        focusTaskId = null;
    }

    const checkbox = document.querySelector(
        '#settingsDrawer input[onchange*="toggleFocusMode"]'
    );

    if (checkbox) {
        checkbox.checked = enabled;
    }

    ui.render();
},

    openTimer(id) {

    pendingTimer.taskId = id;

    document.getElementById("timerModal")
        .classList.remove("hidden");

    app.updateSlider(30);
},

    updateSlider(value) {

        document.getElementById("sliderMinutes").innerText = value;

        pendingTimer.seconds = value * 60;

        const circle = document.getElementById("ringProgress");

        const radius = 100;
        const circumference = 2 * Math.PI * radius;

        const offset =
    circumference - (value / 60) * circumference;

        circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = offset;

    },

    confirmTimer() {
    const task = service.getAll().find(t => t.id === pendingTimer.taskId);
    if (!task) return;

    task.timer.duration = pendingTimer.seconds;
    task.timer.remaining = pendingTimer.seconds;

    repo.sync();

    ui.closeTimerModal();
    app.startTimer(pendingTimer.taskId);
},

startTimer(id) {

    if (!isLoggedIn()) return;

    const task = service.getAll().find(t => t.id === id);
    if (!task) return;

    if (!task.timer.duration || task.timer.duration <= 0) {
        task.timer.duration = 30 * 60;
        task.timer.remaining = 30 * 60;
    }

    task.timer.running = true;
    activeTimerTaskId = id;

    repo.sync();
    ui.render();

    setTimeout(() => {

    if (!focusMode) {
        const ok = confirm("Start Focus Mode for better concentration?");

        if (ok) {
            enableFocusMode(id);
        }
    }

}, 200);
},

startFocusTimer() {

    if (!focusTaskId) {
        alert("Please select a focus task.");
        return;
    }

    app.startTimer(focusTaskId);
},

stopCountdown() {

    document.getElementById("countdownModal")
        .classList.add("hidden");

    ui.render();
},

pauseTimer() {

    const task = service.getAll().find(t => t.id === activeTimerTaskId);
    if (!task) return;

    task.timer.running = !task.timer.running;

    repo.sync();
    ui.render();
},

    toggleSpeech(enabled) {

        speechEnabled = enabled;

        if (enabled) {
            speak("Screen reader assist enabled");
        } else {
            speechSynthesis.cancel();
        }
    },

    toggleDarkMode(enabled) {
    document.body.classList.toggle("dark-mode", enabled);
},

    toggleLargeText(enabled) {
        document.body.classList.toggle("large-text-mode", enabled);
    },

    selectMood(btn) {

        document.querySelectorAll(".checkin-buttons button")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        selectedMood = btn.innerText;

        communityFeed.push(
            new CommunityPost(
    `${currentUser.username} feels: ${selectedMood}`,
    currentUser.username
)
        );

        ui.render();
    },

    postCommunityMessage() {

        const input = document.getElementById("communityInput");
        const message = input.value.trim();

        if (!message) return;

        communityFeed.push(
            new CommunityPost(
    message,
    currentUser.username
)
        );

        input.value = "";
        ui.render();
    }
};

window.app = app;

/* COUNTDOWN */

function updateCountdownUI() {

    const task = service.getAll()
        .find(t => t.id === activeTimerTaskId);

    if (!task || !task.timer) return;

    const m = Math.floor(task.timer.remaining / 60);
    const s = String(task.timer.remaining % 60).padStart(2, "0");

    document.getElementById("countdownText").innerText =
        `${m}:${s}`;
}

/* SPEECH */

function speak(text) {

    if (!speechEnabled) return;

    if (speechSynthesis.speaking) return;

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 1;

    speechSynthesis.speak(utterance);
}

/* LOOP */

setInterval(() => {

    if(currentUser){

        service.tick();
        ui.render();
        updateCountdownUI();
    }

}, 1000);

/* AUTO SCREEN READER */

document.addEventListener("focusin", (e) => {

    if (!speechEnabled) return;

    const el = e.target;

    let text = "";

    // BUTTON
    if (el.tagName === "BUTTON") {

        text =
            el.innerText ||
            el.getAttribute("aria-label");

    }

    // INPUT
    else if (el.tagName === "INPUT") {

        text =
            el.placeholder ||
            el.getAttribute("aria-label") ||
            "Input field";
    }

    // HEADINGS
    else if (
        el.tagName === "H1" ||
        el.tagName === "H2"
    ) {

        text = el.innerText;
    }

    if (text) {
        speak(text);
    }
});

/* INIT */

(async function init() {

    ui.render();

    router.go("home");

    loadQuote();

    currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    if(currentUser){

        auth.enterApp(currentUser);

        ui.render();

    } else {

        document.getElementById("authPage")
            .classList.remove("hidden");

        document.getElementById("mainApp")
            .classList.add("hidden");
    }

})();

//progress calendar (deadline system)

function getDeadlines() {
    return JSON.parse(localStorage.getItem("deadlines") || "[]");
}

function saveDeadlines(data) {
    localStorage.setItem("deadlines", JSON.stringify(data));
}

ui.closeDeadlineModal = function () {
    document.getElementById("deadlineModal").classList.add("hidden");
};

app.addDeadline = function () {
    console.log("ADD DEADLINE TRIGGERED");
    alert("clicked");
    const title = document.getElementById("deadlineTitle").value.trim();
    const date = document.getElementById("deadlineDate").value;

    if (!title || !date) {
        alert("Please fill all fields");
        return;
    }

    const deadlines = getDeadlines();

    deadlines.push({
        id: Date.now(),
        title,
        date
    });

    saveDeadlines(deadlines);

    ui.closeDeadlineModal();
    app.renderDeadlines();
};

app.renderDeadlines = function () {

    const list = document.getElementById("deadlineList");
    const deadlines = getDeadlines();

    list.innerHTML = "";

    let completedCount = 0;
    let overdueCount = 0;

    deadlines.forEach(d => {

        const daysLeft = getDaysLeft(d.date);
        const overdue = isOverdue(d);

        if (d.completed) completedCount++;
        if (overdue) overdueCount++;

        let colorClass = "green";
        if (daysLeft <= 1) colorClass = "red";
        else if (daysLeft <= 3) colorClass = "yellow";

        const item = document.createElement("div");
        item.className = "deadline-item " + colorClass;

        item.innerHTML = `
            <div>
                <strong style="text-decoration:${d.completed ? 'line-through' : 'none'}">
                    ${d.title} ${overdue ? "⚠ overdue" : ""}
                </strong>

                <div style="font-size:12px;">
                    Due: ${d.date}
                </div>

                <small>${daysLeft} days left</small>
            </div>

            <div style="display:flex;gap:8px;align-items:center;">
                <button onclick="app.toggleDeadline(${d.id})">
                    ${d.completed ? "↩" : "✔"}
                </button>

                <button onclick="app.deleteDeadline(${d.id})">✕</button>
            </div>
        `;

        list.appendChild(item);
    });

    const stats = getDeadlineStats();

    console.log("Deadline stats:", stats);

    const el = document.getElementById("deadlineProgressText");
    if (el) {
        el.innerText =
            `Deadlines: ${stats.completed + stats.overdue} / ${stats.total}`;
    }
};

app.deleteDeadline = function (id) {

    let deadlines = getDeadlines();

    deadlines = deadlines.filter(d => d.id !== id);

    saveDeadlines(deadlines);

    app.renderDeadlines();
};

document.addEventListener("DOMContentLoaded", () => {
    
    app.renderDeadlines();
});

function getDaysLeft(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);

    const diff = target - today;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

app.toggleDeadline = function(id) {

    let deadlines = getDeadlines();

    deadlines = deadlines.map(d => {
        if (d.id === id) {
            d.completed = !d.completed;
        }
        return d;
    });

    saveDeadlines(deadlines);
    app.renderDeadlines();
};

function isOverdue(deadline) {
    return new Date(deadline.date) < new Date() && !deadline.completed;
}

app.clearDeadlineHistory = function () {

    if (!confirm("Clear completed deadlines?")) return;

    let deadlines = getDeadlines();

    deadlines = deadlines.filter(d => !d.completed);

    saveDeadlines(deadlines);
    app.renderDeadlines();
};

function getDeadlineStats() {

    const deadlines = getDeadlines();

    const completed =
        deadlines.filter(d => d.completed).length;

    const overdue =
        deadlines.filter(d => isOverdue(d)).length;

    return {
        total: deadlines.length,
        completed,
        overdue
    };
}

let dragging = false;

let knob = null;

window.addEventListener("DOMContentLoaded", () => {
    knob = document.getElementById("knob");

    if (!knob) return;

    knob.addEventListener("pointerdown", () => {
        dragging = true;
    });
});

document.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (!knob) return;

    const rect = knob?.getBoundingClientRect?.();
    if (!rect) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    angle = angle < 0 ? angle + 360 : angle;

    let minutes = Math.round((angle / 360) * 60);
    if (minutes === 0) minutes = 60;

    app.updateSlider(minutes);
});

document.addEventListener("pointerup", () => {
    dragging = false;
});

function enableFocusMode(taskId) {
    focusMode = true;
    focusTaskId = taskId;

    const checkbox = document.querySelector(
        '#settingsDrawer input[onchange*="toggleFocusMode"]'
    );

    if (checkbox) {
        checkbox.checked = true;
    }

    ui.render();
}

document.addEventListener("focusin", (e) => {

    if (!speechEnabled) return;

    const el = e.target;

    let text = "";

    if (el.tagName === "BUTTON") {

        text = el.innerText;

    } else if (el.tagName === "INPUT") {

        text =
            el.placeholder ||
            "Input field";

    } else if (
        el.tagName === "H1" ||
        el.tagName === "H2"
    ) {

        text = el.innerText;
    }

    if (text) {
        speak(text);
    }
});