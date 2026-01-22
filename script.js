const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const titleInput = document.getElementById("title");
const importanceInput = document.getElementById("importance");
const urgencyInput = document.getElementById("urgency");
const effortInput = document.getElementById("effort");
const deadlineInput = document.getElementById("deadline");
const insightDiv = document.getElementById("insight");
const themeToggle = document.getElementById("themeToggle");


let tasks = [];
let taskIdCounter = 1;

/* ---------- FORM SUBMISSION ---------- */

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTask();
});

/* ---------- ADD TASK ---------- */

function addTask() {
    const title = titleInput.value.trim();
    const importance = Number(importanceInput.value);
    const urgency = Number(urgencyInput.value);
    const effort = Number(effortInput.value);
    const deadline = deadlineInput.value;

    if (!title) {
        alert("Task title is required");
        return;
    }

    const task = {
        id: taskIdCounter++,
        title,
        importance,
        urgency,
        effort,
        deadline,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasksToLocalStorage();
    taskForm.reset();
    renderTasks();
}

const savedTheme = localStorage.getItem("priorityForgeTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
}

/* ---------- RENDER TASKS ---------- */

function renderTasks() {
    taskList.innerHTML = "";

    const sortedTasks = [...tasks].sort(
        (a, b) => calculatePriority(b) - calculatePriority(a)
    );

    sortedTasks.forEach((task) => {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task-card";

        const priorityScore = calculatePriority(task);
        taskDiv.style.borderLeft = `6px solid ${getPriorityColor(
            priorityScore,
            task.completed
        )}`;

        taskDiv.innerHTML = `
            <h3>${task.title}</h3>
            <p>Priority Score: ${priorityScore}</p>
            <p>Importance: ${task.importance}</p>
            <p>Urgency: ${task.urgency}</p>
            <p>Effort: ${task.effort} min</p>
            <p>Status: ${task.completed ? "Done" : "Pending"}</p>

            <div class="task-actions">
                <button class="done-btn">
                    ${task.completed ? "Completed" : "Mark as Done"}
                </button>
                <button class="delete-btn">
                    Delete
                </button>
            </div>
        `;

        if (task.completed) {
            taskDiv.style.opacity = "0.6";
            taskDiv.style.textDecoration = "line-through";
        }

        const doneButton = taskDiv.querySelector(".done-btn");
        const deleteButton = taskDiv.querySelector(".delete-btn");

        doneButton.addEventListener("click", function () {
            toggleTaskCompletion(task.id);
        });

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        taskList.appendChild(taskDiv);
    });

    /* ---------- INSIGHTS ---------- */

    const totalEffort = calculateTotalEffort();

    if (totalEffort > 300) {
        insightDiv.textContent =
            "⚠️ Heavy workload today. Consider postponing low-priority tasks.";
    } else if (totalEffort > 180) {
        insightDiv.textContent =
            "🟡 Moderate workload. Stay focused.";
    } else {
        insightDiv.textContent =
            "🟢 Light workload. Good time to finish important tasks.";
    }

    const nextTask = sortedTasks.find(task => !task.completed);
    if (nextTask) {
        insightDiv.textContent += ` | Next task: "${nextTask.title}"`;
    }
}

/* ---------- PRIORITY LOGIC ---------- */

function calculatePriority(task) {
    if (task.completed) return -1;

    let score = 0;
    score += task.importance * 3;
    score += task.urgency * 2;

    if (task.effort <= 30) score += 3;
    else if (task.effort <= 60) score += 1;

    if (task.deadline) {
        const today = new Date().toISOString().split("T")[0];
        if (task.deadline <= today) score += 10;
    }

    return score;
}

/* ---------- TASK ACTIONS ---------- */

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = true;
        saveTasksToLocalStorage();
        renderTasks();
    }
}

function deleteTask(taskId) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
}

/* ---------- HELPERS ---------- */

function getPriorityColor(score, completed) {
    if (completed) return "#b0b0b0";
    if (score >= 18) return "#ff6b6b";
    if (score >= 10) return "#ffa94d";
    return "#69db7c";
}

function calculateTotalEffort() {
    return tasks
        .filter(task => !task.completed)
        .reduce((sum, task) => sum + task.effort, 0);
}

/* ---------- LOCAL STORAGE ---------- */

function saveTasksToLocalStorage() {
    localStorage.setItem("priorityForgeTasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem("priorityForgeTasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);

        const maxId = tasks.reduce(
            (max, task) => (task.id > max ? task.id : max),
            0
        );
        taskIdCounter = maxId + 1;
    }
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    const isDarkMode = document.body.classList.contains("dark");
    localStorage.setItem("priorityForgeTheme", isDarkMode ? "dark" : "light");

    themeToggle.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});


/* ---------- INITIAL LOAD ---------- */

loadTasksFromLocalStorage();
renderTasks();
