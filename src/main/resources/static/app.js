function categoryEmoji(category) {
    const c = (category || "").toLowerCase();
    if (c.includes("dessert") || c.includes("cake") || c.includes("sweet") || c.includes("muffin") || c.includes("cupcake")) return "🍰";
    if (c.includes("salad")) return "🥗";
    if (c.includes("soup")) return "🍲";
    if (c.includes("breakfast")) return "🍳";
    if (c.includes("drink") || c.includes("beverage") || c.includes("juice")) return "🥤";
    if (c.includes("fish") || c.includes("salmon")) return "🐟";
    if (c.includes("snack")) return "🍿";
    if (c.includes("side")) return "🍚";
    if (c.includes("main") || c.includes("pasta") || c.includes("dinner")) return "🍝";
    if (c.includes("dairy") || c.includes("cheese")) return "🧀";
    return "🍴";
}


/* ---------- current logged-in user (sent as X-User-Id header) ---------- */
let currentUserId = localStorage.getItem("currentUserId") || "";

function setCurrentUser(value) {
    currentUserId = value || "";
    localStorage.setItem("currentUserId", currentUserId);
    loadRecipes();
}

function authHeaders(extra) {
    const headers = Object.assign({}, extra || {});
    if (currentUserId) {
        headers["X-User-Id"] = currentUserId;
    }
    return headers;
}

// Parses the structured ErrorResponse from @RestControllerAdvice and shows it.
function handleResponse(response) {
    if (response.ok) {
        return response.json();
    }
    return response.json()
        .catch(() => ({ message: "Request failed (" + response.status + ")" }))
        .then(err => {
            showToast("⛔ " + (err.message || "Access denied"));
            throw new Error(err.message || response.status);
        });
}

function loadPeople() {
    fetch("/api/people")
        .then(response => response.json())
        .then(people => {
            const list = document.getElementById("people-list");
            list.innerHTML = "";

            const recipeSelect = document.getElementById("recipe-person");
            const filterSelect = document.getElementById("filter-person");
            const currentSelect = document.getElementById("current-user");
            recipeSelect.innerHTML = '<option value="">-- select a person --</option>';
            filterSelect.innerHTML = '<option value="">-- select a person --</option>';
            currentSelect.innerHTML = '<option value="">-- nobody (guest) --</option>';

            people.forEach(person => {
                const li = document.createElement("li");
                li.textContent =
                    "🎀 #" + person.id + " " + person.name +
                    " (" + person.email + ", " + person.phone + ") - role: " + person.role;

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.className = "delete-btn";
                deleteBtn.onclick = () => deletePerson(person.id);
                li.appendChild(deleteBtn);

                list.appendChild(li);

                const option1 = document.createElement("option");
                option1.value = person.id;
                option1.textContent = "#" + person.id + " " + person.name;
                recipeSelect.appendChild(option1);

                const option2 = option1.cloneNode(true);
                filterSelect.appendChild(option2);

                const option3 = document.createElement("option");
                option3.value = person.id;
                option3.textContent = "#" + person.id + " " + person.name + " (" + person.role + ")";
                currentSelect.appendChild(option3);
            });

            currentSelect.value = currentUserId;
        });
}

document.getElementById("person-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const person = {
        name: document.getElementById("person-name").value,
        email: document.getElementById("person-email").value,
        phone: document.getElementById("person-phone").value,
        role: document.getElementById("person-role").value
    };

    fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(person)
    })
        .then(response => response.json())
        .then(() => {
            this.reset();
            loadPeople();
            showToast("נוסף בהצלחה! 🧁");
        });
});

function deletePerson(id) {
    fetch("/api/people/" + id, { method: "DELETE" })
        .then(() => {
            loadPeople();
            loadRecipes();
            showToast("נמחק 🗑️");
        });
}

function loadRecipes() {
    const list = document.getElementById("recipes-list");
    fetch("/api/recipes", { headers: authHeaders() })
        .then(handleResponse)
        .then(recipes => {
            list.innerHTML = "";
            recipes.forEach(recipe => list.appendChild(buildRecipeItem(recipe)));
        })
        .catch(() => {
            list.innerHTML = '<li class="empty-msg">🔐 Only an ADMIN can view all recipes.</li>';
        });
}

document.getElementById("recipe-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const personId = document.getElementById("recipe-person").value;
    if (!personId) {
        alert("Please select a person first.");
        return;
    }

    const recipe = {
        title: document.getElementById("recipe-title").value,
        description: document.getElementById("recipe-description").value,
        ingredients: document.getElementById("recipe-ingredients").value,
        instructions: document.getElementById("recipe-instructions").value,
        category: document.getElementById("recipe-category").value,
        prepTimeMinutes: document.getElementById("recipe-prepTime").value
    };

    fetch("/api/recipes/person/" + personId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe)
    })
        .then(response => response.json())
        .then(() => {
            this.reset();
            loadRecipes();
            showToast("נוסף בהצלחה! 🧁");
        });
});

function loadRecipesByPerson() {
    const personId = document.getElementById("filter-person").value;
    if (!personId) {
        alert("Please select a person first.");
        return;
    }

    const list = document.getElementById("person-recipes-list");
    fetch("/api/people/" + personId + "/recipes", { headers: authHeaders() })
        .then(handleResponse)
        .then(recipes => {
            list.innerHTML = "";
            if (recipes.length === 0) {
                const empty = document.createElement("li");
                empty.className = "empty-msg";
                empty.textContent = "לא נמצאו מתכונים 🥺💕";
                list.appendChild(empty);
                return;
            }
            recipes.forEach(recipe => list.appendChild(buildRecipeItem(recipe)));
        })
        .catch(() => {
            list.innerHTML = '<li class="empty-msg">🔐 You can only view your own recipes.</li>';
        });
}

function deleteRecipe(id) {
    fetch("/api/recipes/" + id, { method: "DELETE" })
        .then(() => {
            loadRecipes();
            showToast("נמחק 🗑️");
        });
}

function buildRecipeItem(recipe) {
    const li = document.createElement("li");
    li.textContent =
        categoryEmoji(recipe.category) + " #" + recipe.id + " " + recipe.title +
        " [" + recipe.category + ", " + recipe.prepTimeMinutes + " min] - " + recipe.description;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteRecipe(recipe.id);
    li.appendChild(deleteBtn);

    return li;
}

/* ---------- flying hearts on click ---------- */
const HEARTS = ["💖", "💕", "💗", "💓", "🩷", "✨"];

function spawnHearts(x, y) {
    for (let i = 0; i < 6; i++) {
        const heart = document.createElement("span");
        heart.className = "heart";
        heart.textContent = HEARTS[Math.floor((x + y + i) % HEARTS.length)];
        heart.style.left = x + "px";
        heart.style.top = y + "px";
        heart.style.setProperty("--dx", (Math.floor((x * (i + 1)) % 160) - 80) + "px");
        heart.style.fontSize = (18 + (i * 4)) + "px";
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1100);
    }
}

/* ---------- tiny click sound (Web Audio) ---------- */
let audioCtx = null;

function playPop() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
        /* sound is optional */
    }
}

document.addEventListener("click", function (event) {
    if (event.target.closest("button")) {
        playPop();
    }
});

const personAddBtn = document.querySelector("#person-form button[type=submit]");
const recipeAddBtn = document.querySelector("#recipe-form button[type=submit]");

if (personAddBtn) {
    personAddBtn.addEventListener("click", event => spawnHearts(event.clientX, event.clientY));
}
if (recipeAddBtn) {
    recipeAddBtn.addEventListener("click", event => spawnHearts(event.clientX, event.clientY));
}

/* ---------- cute toast notifications ---------- */
function showToast(message) {
    const area = document.getElementById("toast-area");
    if (!area) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    area.appendChild(toast);
    setTimeout(() => toast.classList.add("hide"), 2200);
    setTimeout(() => toast.remove(), 2700);
}

/* ---------- cute day / night theme ---------- */
function applyTheme(theme) {
    const btn = document.getElementById("theme-toggle");
    if (theme === "dark") {
        document.body.classList.add("dark");
        if (btn) btn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        if (btn) btn.textContent = "🌙";
    }
}

function toggleTheme() {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
}

applyTheme(localStorage.getItem("theme") || "light");

loadPeople();
loadRecipes();
