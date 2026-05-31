/* ══════════════════ DATA / DEFAULTS ══════════════════ */
const TODAY = new Date().toISOString().split("T")[0];
function dPlus(n) {
  const d = new Date(Date.now() + n * 864e5);
  return d.toISOString().split("T")[0] + "T" + (n === 0 ? "10:00" : "18:00");
}

const DD = {
  tasks: [
    {
      id: 1,
      title: "Group Assignment Week 8",
      subject: "Advance Programming",
      deadline: dPlus(0),
      completed: false,
    },
    {
      id: 2,
      title: "Assignment Week 8 Item MLBB",
      subject: "Data Structure",
      deadline: dPlus(1),
      completed: false,
    },
    {
      id: 3,
      title: "Repository HTML Figma",
      subject: "Web Programming",
      deadline: dPlus(2),
      completed: false,
    },
    {
      id: 4,
      title: "Revision ERD Report",
      subject: "Database",
      deadline: dPlus(4),
      completed: false,
    },
  ],
  events: [
    {
      id: 1,
      title: "Rapat Besar NPLC 13TH",
      type: "rapat",
      start: TODAY + "T09:00",
      end: TODAY + "T11:00",
      date: TODAY,
    },
    {
      id: 2,
      title: "Lecture – Web Programming",
      type: "kuliah",
      start: TODAY + "T11:30",
      end: TODAY + "T13:00",
      date: TODAY,
    },
    {
      id: 3,
      title: "Dance Practice",
      type: "UKM",
      start: TODAY + "T13:00",
      end: TODAY + "T14:00",
      date: TODAY,
    },
  ],
  cel: [
    {
      id: 1,
      courseName: "Advance Programming",
      targetGrade: "A",
      targetScore: 4.0,
      semester: "Semester 2",
      currentScore: 3.7,
    },
    {
      id: 2,
      courseName: "Data Structure",
      targetGrade: "A-",
      targetScore: 3.7,
      semester: "Semester 2",
      currentScore: 3.5,
    },
    {
      id: 3,
      courseName: "Web Programming",
      targetGrade: "B+",
      targetScore: 3.5,
      semester: "Semester 2",
      currentScore: 3.2,
    },
  ],
  study: {
    weeklyTotal: 18.5,
    lastWeekTotal: 16.5,
    pendingTasks: 6,
    aboveAvg: 82,
    weeklyProg: 74,
    history: [3, 2.5, 4, 2, 5, 1.5, 0.5],
  },
  settings: {
    university: "Universitas Indonesia",
    targetGPA: 3.8,
    streak: 7,
    name: "Muh. Sahlan Rahman",
    bio: "Informatics Engineering, 2nd Semester. Aiming for 3.8 GPA. Specializing in Artificial Intelligence",
    avatarInit: "A",
    totalHours: 128,
  },
};

/* ══════════════════ STORAGE ══════════════════ */
const LS = {
  g(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  s(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
function getTasks() {
  return LS.g("tasks", DD.tasks);
}
function getEvents() {
  return LS.g("calendarEvents", DD.events);
}
function getCel() {
  return LS.g("celenganTargets", DD.cel);
}
function getStudy() {
  return LS.g("studyHoursData", DD.study);
}
function getSettings() {
  return LS.g("userSettings", DD.settings);
}

/* ══════════════════ COMPUTED ══════════════════ */
function avgGPA() {
  const c = getCel();
  if (!c.length) return 0;
  return parseFloat(
    (c.reduce((s, x) => s + x.currentScore, 0) / c.length).toFixed(2),
  );
}
function pendingCount() {
  return getTasks().filter((t) => !t.completed).length;
}
function achievedCount() {
  const c = getCel();
  return c.filter((x) => x.currentScore >= x.targetScore).length;
}
function todayEvents() {
  return getEvents()
    .filter((e) => e.date === TODAY)
    .sort((a, b) => a.start.localeCompare(b.start));
}
function upcomingTasks() {
  const now = Date.now();
  return getTasks()
    .filter((t) => !t.completed && new Date(t.deadline).getTime() > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);
}
function dlInfo(dl) {
  const diff = new Date(dl).getTime() - Date.now();
  const h = Math.floor(diff / 36e5);
  if (diff < 0) return { lbl: "Overdue!", col: "var(--m)", urgent: true };
  if (h < 24) return { lbl: `${h}h left`, col: "var(--m)", urgent: true };
  const d = Math.floor(h / 24);
  return {
    lbl: `${d}d left`,
    col: d <= 3 ? "var(--mm)" : "var(--sub)",
    urgent: false,
  };
}
function fmtT(iso) {
  const d = new Date(iso);
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

/* ══════════════════ STATE ══════════════════ */
let curView = "dashboard";
let calY = new Date().getFullYear(),
  calM = new Date().getMonth(),
  calSel = TODAY;
let charts = {};

/* ══════════════════ SIDEBAR ══════════════════ */
function updateSidebar() {
  const study = getStudy(),
    set = getSettings();
  const cel = getCel(),
    pct = Math.min(100, Math.round((study.weeklyTotal / 25) * 100));
  document.getElementById("sb-hrs").textContent = study.weeklyTotal + "h";
  document.getElementById("sb-hrs-bar").style.width = pct + "%";
  document.getElementById("sb-hrs-lbl").textContent = pct + "% dari 25h";
  document.getElementById("sb-pending").textContent = pendingCount();
  document.getElementById("sb-gpa").textContent =
    avgGPA() > 0 ? avgGPA().toFixed(2) : "—";
  document.getElementById("sb-cel").textContent =
    achievedCount() + "/" + cel.length;
  document.getElementById("sb-streak").textContent = set.streak + "🔥";
  const pc = pendingCount();
  const badge = document.getElementById("hdr-badge");
  badge.textContent = pc;
  badge.style.display = pc > 0 ? "inline" : "none";
  document.getElementById("sbar-date").textContent =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  const set2 = getSettings();
  document.getElementById("hdr-av-nm").textContent = set2.name.split(" ")[0];
  document.getElementById("drop-nm").textContent = set2.name;
}

function toggleSidebar() {
  const s = document.getElementById("sbar"),
    o = document.getElementById("sbar-ov");
  s.classList.toggle("open");
  o.classList.toggle("open");
}

/* ══════════════════ DARK MODE ══════════════════ */
function applyTheme(dm) {
  document.documentElement.setAttribute("data-theme", dm ? "dark" : "light");
  localStorage.setItem("sc_dark", dm ? "true" : "false");
  const tr = document.getElementById("tog-tr");
  const icon = document.getElementById("tog-icon");
  const lbl = document.getElementById("tog-lbl");
  tr.classList.toggle("on", dm);
  icon.className = dm ? "fas fa-sun" : "fas fa-moon";
  lbl.textContent = dm ? "Dark Mode" : "Light Mode";
}
function toggleDark() {
  applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
}
function toggleDrop() {
  document.getElementById("av-drop").classList.toggle("open");
}
document.addEventListener("click", (e) => {
  const d = document.getElementById("av-drop");
  if (d.classList.contains("open") && !e.target.closest(".hdr-r"))
    d.classList.remove("open");
});

/* ══════════════════ MODAL ══════════════════ */
function openModal(title, body) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("ov").classList.add("open");
  document.getElementById("modal").classList.add("open");
}
function closeModal() {
  document.getElementById("ov").classList.remove("open");
  document.getElementById("modal").classList.remove("open");
}
function showToast(msg) {
  const t = document.createElement("div");
  t.style.cssText =
    "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--m);color:#fff;padding:10px 20px;border-radius:99px;font-size:.83rem;font-weight:600;z-index:999;box-shadow:0 4px 16px rgba(128,0,32,.4);animation:fi .3s ease";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ══════════════════ NAVIGATE ══════════════════ */
function navigate(view) {
  curView = view;
  document.querySelectorAll(".nb").forEach((b) => {
    b.classList.toggle("act", b.dataset.view === view);
  });
  renderView(view);
}
function renderView(v) {
  const vc = document.getElementById("vc");
  vc.innerHTML = "";
  const inner = document.createElement("div");
  (
    ({
      dashboard: renderDashboard,
      tasks: renderTasks,
      calendar: renderCalendar,
      goals: renderGoals,
      analytics: renderAnalytics,
    })[v] || renderDashboard
  )(inner);
  vc.appendChild(inner);
  updateSidebar();
}

/* ══════════════════ DASHBOARD ══════════════════ */
function renderDashboard(el) {
  const set = getSettings(),
    study = getStudy(),
    cel = getCel();
  const gpa = avgGPA(),
    ach = achievedCount(),
    pend = pendingCount();
  const tgt = set.targetGPA || 3.8;
  const gpaPct = Math.min(100, Math.round((gpa / tgt) * 100));
  const activeCel = cel.filter((c) => c.currentScore < c.targetScore).length;
  const studyPct = Math.min(100, Math.round((study.weeklyTotal / 25) * 100));
  const upTasks = upcomingTasks();
  const todevents = todayEvents();

  el.innerHTML = `
<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:1.5rem">
  <div>
    <h1 style="font-weight:800;font-size:1.4rem;color:var(--text);margin:0 0 3px">Welcome back, ${set.name.split(" ")[0]}! 👋</h1>
    <p style="font-size:.83rem;color:var(--sub);margin:0">${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
  </div>
  <button class="btn-p" onclick="navigate('tasks')"><i class="fas fa-plus"></i> Add Task</button>
</div>

<!-- 4 Cards -->
<div class="g4 mb-6" style="margin-bottom:1.25rem">
  <!-- Card 1: Universitas -->
  <div class="card" style="position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--md),var(--m))"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="width:38px;height:38px;border-radius:10px;background:rgba(128,0,32,.1);display:flex;align-items:center;justify-content:center;color:var(--m)"><i class="fas fa-university fa-lg"></i></div>
      <button class="bic" onclick="editUniversity()" title="Edit"><i class="fas fa-pencil-alt"></i></button>
    </div>
    <p style="font-weight:800;font-size:.98rem;color:var(--m);margin:0 0 3px;line-height:1.3" id="d-uni">${set.university || "Universitas Indonesia"}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">Current University</p>
  </div>
  <!-- Card 2: Target GPA -->
  <div class="card" style="position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--md),var(--m))"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="width:38px;height:38px;border-radius:10px;background:rgba(128,0,32,.1);display:flex;align-items:center;justify-content:center;color:var(--m)"><i class="fas fa-bullseye fa-lg"></i></div>
      <button class="bic" onclick="editTargetGPA()" title="Edit"><i class="fas fa-pencil-alt"></i></button>
    </div>
    <p style="font-weight:800;font-size:1.6rem;color:var(--m);margin:0 0 2px">${tgt.toFixed(1)}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0 0 8px">GPA Target</p>
    <div class="ptr"><div class="pb" style="width:${gpaPct}%"></div></div>
    <p style="font-size:.65rem;color:var(--sub);margin:3px 0 0">${gpa > 0 ? gpa.toFixed(2) + " / " + tgt.toFixed(1) : gpaPct + "% reached"}</p>
  </div>
  <!-- Card 3: Active Targets -->
  <div class="card" style="position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--md),var(--m))"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="width:38px;height:38px;border-radius:10px;background:rgba(128,0,32,.1);display:flex;align-items:center;justify-content:center;color:var(--m)"><i class="fas fa-piggy-bank fa-lg"></i></div>
      <span class="chip">${ach}/${cel.length} ✓</span>
    </div>
    <p style="font-weight:800;font-size:1.6rem;color:var(--m);margin:0 0 2px">${activeCel}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">Active Targets (Not Reached Yet)</p>
  </div>
  <!-- Card 4: Streak -->
  <div class="card" style="position:relative;overflow:hidden">
    <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--md),var(--m))"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="width:38px;height:38px;border-radius:10px;background:rgba(128,0,32,.1);display:flex;align-items:center;justify-content:center;color:var(--m)"><i class="fas fa-fire fa-lg"></i></div>
      <button class="bic" onclick="editStreak()" title="Edit"><i class="fas fa-pencil-alt"></i></button>
    </div>
    <p style="font-weight:800;font-size:1.6rem;color:var(--m);margin:0 0 2px">${set.streak} 🔥</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">Current Streak of Studying</p>
  </div>
</div>

<!-- Study Hours + Active Goals -->
<div class="g2" style="margin-bottom:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
  <div class="card">
    <div class="sec-hd"><span class="sec-t">📖 Study Hours This Week</span><button class="sec-lnk" onclick="navigate('analytics')">Analytics →</button></div>
    <div class="g2" style="margin-bottom:12px">
      ${[
        {
          v: study.weeklyTotal + "h",
          l: "Current Week",
          s: `+${(((study.weeklyTotal - study.lastWeekTotal) / study.lastWeekTotal) * 100).toFixed(0)}% vs last week`,
        },
        {
          v: pend,
          l: "Pending",
          s: getTasks().filter((t) => t.completed).length + " completed",
        },
        { v: study.aboveAvg + "%", l: "Above Average", s: "class percentile" },
        {
          v: studyPct + "%",
          l: "Weekly Progress",
          s: study.weeklyTotal + "/25h",
        },
      ]
        .map(
          (s) => `
      <div style="background:var(--sec);border:1px solid var(--border);border-radius:10px;padding:9px 10px">
        <p style="font-weight:800;font-size:1.2rem;color:var(--m);margin:0 0 1px">${s.v}</p>
        <p style="font-size:.71rem;color:var(--text);font-weight:600;margin:0 0 1px">${s.l}</p>
        <p style="font-size:.64rem;color:var(--sub);margin:0">${s.s}</p>
      </div>`,
        )
        .join("")}
    </div>
    <div class="ptr"><div class="pb" style="width:${studyPct}%"></div></div>
  </div>
  <div class="card">
    <div class="sec-hd"><span class="sec-t">🎯 Active Goals</span><button class="sec-lnk" onclick="navigate('goals')">Goals →</button></div>
    ${[
      {
        ic: "🎓",
        lbl: "Midterm GPA Target",
        val: `${gpa > 0 ? gpa.toFixed(2) : "0.00"} / 4.0`,
        pct: gpa > 0 ? Math.round((gpa / 4) * 100) : 0,
      },
      {
        ic: "⏱️",
        lbl: "Study Hours / Week",
        val: `${study.weeklyTotal} / 25h`,
        pct: studyPct,
      },
      {
        ic: "🪙",
        lbl: "Reached Target",
        val: `${ach} / ${cel.length}`,
        pct: cel.length ? Math.round((ach / cel.length) * 100) : 0,
      },
      { ic: "💻", lbl: "Online Course", val: "65 / 100%", pct: 65 },
    ]
      .map(
        (
          g,
        ) => `<div style="background:var(--sec);border:1px solid var(--border);border-radius:10px;padding:8px 10px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.8rem;font-weight:600;color:var(--text)">${g.ic} ${g.lbl}</span><span style="font-weight:700;font-size:.77rem;color:var(--m)">${g.val}</span></div>
      <div class="ptr"><div class="pb" style="width:${g.pct}%"></div></div>
    </div>`,
      )
      .join("")}
  </div>
</div>

<!-- Upcoming Tasks + Today Schedule -->
<div class="g2" style="margin-bottom:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
  <div class="card">
    <div class="sec-hd"><span class="sec-t">📋 Upcoming Tasks</span><button class="sec-lnk" onclick="navigate('tasks')">Look Out →</button></div>
    ${
      upTasks.length === 0
        ? '<div style="text-align:center;padding:1.5rem;color:var(--sub)">✅ There are no upcoming tasks!</div>'
        : upTasks
            .map((t) => {
              const dl = dlInfo(t.deadline);
              return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--sec);border:1px solid ${dl.urgent ? "rgba(128,0,32,.3)" : "var(--border)"};border-radius:9px;margin-bottom:6px">
      <div style="width:7px;height:7px;border-radius:50%;background:${dl.urgent ? "var(--m)" : "var(--sub)"};flex-shrink:0"></div>
      <div style="flex:1;min-width:0"><p style="font-weight:600;font-size:.82rem;color:var(--text);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</p><p style="font-size:.69rem;color:var(--sub);margin:0">${t.subject}</p></div>
      <span style="font-size:.67rem;font-weight:700;color:${dl.col};background:rgba(128,0,32,.1);padding:2px 7px;border-radius:99px;white-space:nowrap">${dl.lbl}</span>
    </div>`;
            })
            .join("")
    }
  </div>
  <div class="card">
    <div class="sec-hd"><span class="sec-t">📅 Today's Schedule</span><button class="sec-lnk" onclick="navigate('calendar')">Calendar →</button></div>
    ${
      todevents.length === 0
        ? '<div style="text-align:center;padding:1.5rem;color:var(--sub)"><i class="far fa-calendar-alt" style="font-size:1.8rem;opacity:.25;display:block;margin:0 auto 8px"></i>There is no schedule</div>'
        : todevents
            .map((e) => {
              const cm = {
                kuliah: { c: "var(--m)", b: "rgba(128,0,32,.08)" },
                belajar: { c: "var(--md)", b: "rgba(90,0,21,.08)" },
                tugas: { c: "var(--mm)", b: "rgba(165,42,42,.08)" },
                istirahat: { c: "#777", b: "rgba(120,120,120,.08)" },
              }[e.type] || { c: "var(--m)", b: "rgba(128,0,32,.08)" };
              return `
    <div style="display:flex;gap:8px;padding:8px 10px;background:${cm.b};border:1px solid rgba(128,0,32,.18);border-radius:9px;margin-bottom:6px;align-items:center">
      <div style="width:3px;height:32px;background:${cm.c};border-radius:99px;flex-shrink:0"></div>
      <div style="flex:1"><p style="font-weight:600;font-size:.82rem;color:var(--text);margin:0">${e.title}</p><p style="font-size:.69rem;color:${cm.c};margin:0;font-weight:500">${fmtT(e.start)}–${fmtT(e.end)}</p></div>
    </div>`;
            })
            .join("")
    }
  </div>
</div>

<!-- Weekly Chart -->
<div class="card">
  <div class="sec-hd"><span class="sec-t">📊 Study Hours This Week</span></div>
  <canvas id="chart-dash-weekly" height="110"></canvas>
</div>`;

  setTimeout(() => {
    const ctx = document.getElementById("chart-dash-weekly");
    if (!ctx) return;
    const dm = document.documentElement.getAttribute("data-theme") === "dark";
    const barBg = study.history.map((v, i) =>
      v === Math.max(...study.history)
        ? "#800020"
        : dm
          ? "rgba(128,0,32,.28)"
          : "rgba(128,0,32,.15)",
    );
    if (charts.dashW) {
      charts.dashW.destroy();
      delete charts.dashW;
    }
    charts.dashW = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: study.history,
            backgroundColor: barBg,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.raw + "h" } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: dm ? "#a0a0a0" : "#666" },
          },
          y: {
            grid: { color: dm ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)" },
            ticks: { color: dm ? "#a0a0a0" : "#666" },
          },
        },
      },
    });
  }, 50);
}

/* ══════════════════ EDIT CARDS ══════════════════ */
function editUniversity() {
  const s = getSettings();
  openModal(
    "Edit Universitas",
    `
    <div class="fl"><label>Nama Universitas</label><input class="inp" id="uni-inp" value="${s.university || "Universitas Indonesia"}" placeholder="Universitas Indonesia"></div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveUniversity()"><i class="fas fa-save"></i> Simpan</button>`,
  );
}
function saveUniversity() {
  const v = document.getElementById("uni-inp").value.trim();
  if (!v) return;
  const s = getSettings();
  s.university = v;
  LS.s("userSettings", s);
  closeModal();
  renderView(curView);
  showToast("✅ Universitas diperbarui!");
}

function editTargetGPA() {
  const s = getSettings();
  openModal(
    "Edit Target IPK",
    `
    <div class="fl"><label>Target IPK (0 – 4.0)</label><input class="inp" id="gpa-inp" type="number" min="0" max="4" step="0.1" value="${s.targetGPA || 3.8}"></div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveTargetGPA()"><i class="fas fa-save"></i> Simpan</button>`,
  );
}
function saveTargetGPA() {
  const v = parseFloat(document.getElementById("gpa-inp").value);
  if (isNaN(v) || v < 0 || v > 4) return;
  const s = getSettings();
  s.targetGPA = v;
  LS.s("userSettings", s);
  closeModal();
  renderView(curView);
  showToast("✅ Target IPK diperbarui!");
}

function editStreak() {
  const s = getSettings();
  openModal(
    "Edit Streak Belajar",
    `
    <div class="fl"><label>Hari Konsistensi Belajar</label><input class="inp" id="streak-inp" type="number" min="0" max="365" value="${s.streak || 7}"></div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveStreak()"><i class="fas fa-save"></i> Simpan</button>`,
  );
}
function saveStreak() {
  const v = parseInt(document.getElementById("streak-inp").value);
  if (isNaN(v) || v < 0) return;
  const s = getSettings();
  s.streak = v;
  LS.s("userSettings", s);
  closeModal();
  renderView(curView);
  showToast("✅ Streak diperbarui!");
}

/* ══════════════════ TASKS ══════════════════ */
let taskFilter = "all";
function renderTasks(el) {
  const tasks = getTasks();
  const done = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter(
    (t) => !t.completed && new Date(t.deadline).getTime() < Date.now(),
  ).length;
  const urgent = tasks.filter((t) => {
    if (t.completed) return false;
    const d = new Date(t.deadline).getTime() - Date.now();
    return d > 0 && d < 864e5;
  }).length;
  const filtered = tasks
    .filter((t) =>
      taskFilter === "all"
        ? true
        : taskFilter === "pending"
          ? !t.completed
          : t.completed,
    )
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  el.innerHTML = `
<div class="g4" style="margin-bottom:1.25rem">
  ${[
    { ic: "fas fa-clipboard", v: pendingCount(), l: "Pending" },
    { ic: "fas fa-exclamation-triangle", v: urgent, l: "Urgent 24j" },
    { ic: "fas fa-fire", v: overdue, l: "Overdue" },
    { ic: "fas fa-check-circle", v: done, l: "Completed" },
  ]
    .map(
      (s, i) => `
  <div class="card" style="text-align:center"><i class="${s.ic}" style="font-size:1.4rem;color:${i < 3 && s.v > 0 ? "var(--m)" : "var(--sub)"};display:block;margin:0 0 6px"></i>
    <p style="font-weight:800;font-size:1.7rem;color:${i < 3 && s.v > 0 ? "var(--m)" : "var(--sub)"};margin:0">${s.v}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">${s.l}</p>
  </div>`,
    )
    .join("")}
</div>
${overdue > 0 || urgent > 0 ? `<div style="background:rgba(128,0,32,.08);border:1px solid rgba(128,0,32,.25);border-radius:11px;padding:10px 14px;display:flex;align-items:center;gap:9px;margin-bottom:1rem"><i class="fas fa-bell" style="color:var(--m)"></i><p style="font-weight:600;font-size:.875rem;color:var(--m);margin:0">${overdue > 0 ? overdue + " overdue assignments! " : ""} ${urgent > 0 ? urgent + " assignments with deadline ≤24 hours" : ""}</p></div>` : ""}
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
  <div style="display:flex;background:rgba(128,0,32,.07);border-radius:9px;padding:3px">
    ${["all", "pending", "done"].map((f) => `<button onclick="taskFilter='${f}';renderView('tasks')" style="padding:5px 11px;border-radius:7px;border:none;cursor:pointer;background:${taskFilter === f ? "var(--card)" : "transparent"};color:${taskFilter === f ? "var(--m)" : "var(--sub)"};font-weight:${taskFilter === f ? 700 : 400};font-size:.77rem;font-family:Inter,sans-serif;text-transform:capitalize;box-shadow:${taskFilter === f ? "0 1px 3px rgba(0,0,0,.1)" : "none"}">${f}</button>`).join("")}
  </div>
  <button class="btn-p" style="margin-left:auto" onclick="openAddTask()"><i class="fas fa-plus"></i> Add Task</button>
</div>
<div id="task-list">
  ${
    filtered.length === 0
      ? '<div style="text-align:center;padding:3rem;color:var(--sub)"><i class="fas fa-check-circle" style="font-size:2.5rem;opacity:.2;display:block;margin:0 auto 10px"></i>No tasks in this category</div>'
      : filtered
          .map((t) => {
            const dl = dlInfo(t.deadline);
            return `
  <div class="ti ${t.completed ? "done" : ""}">
    <div class="tc ${t.completed ? "chk" : ""}" onclick="toggleTask(${t.id})">${t.completed ? '<i class="fas fa-check" style="color:#fff;font-size:.7rem"></i>' : ""}</div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <p style="font-weight:600;font-size:.88rem;color:var(--text);margin:0;text-decoration:${t.completed ? "line-through" : "none"}">${t.title}</p>
        ${dl.urgent && !t.completed ? '<span class="chip"><i class="fas fa-exclamation"></i> Urgent</span>' : ""}
      </div>
      <div style="display:flex;gap:10px;margin-top:3px;flex-wrap:wrap">
        <span style="font-size:.71rem;color:var(--sub)"><i class="fas fa-book-open"></i> ${t.subject}</span>
        <span style="font-size:.71rem;color:${dl.col};font-weight:${dl.urgent ? 600 : 400}"><i class="fas fa-clock"></i> ${dl.lbl}</span>
      </div>
    </div>
    <div style="display:flex;gap:4px">
      <button class="bic" onclick="openEditTask(${t.id})" title="Edit"><i class="fas fa-edit"></i></button>
      <button class="bic del" onclick="deleteTask(${t.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>`;
          })
          .join("")
  }
</div>
${tasks.length > 0 ? `<div class="card" style="margin-top:.75rem"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-weight:600;font-size:.83rem;color:var(--text)">Overall Progress</span><span style="font-weight:700;font-size:.83rem;color:var(--m)">${done}/${tasks.length} completed</span></div><div class="ptr"><div class="pb" style="width:${Math.round((done / tasks.length) * 100)}%"></div></div></div>` : ""}`;
}

const SUBJ = [
  "Advance Programming",
  "Data Structure",
  "Web Programming",
  "Database",
  "Civics",
  "Becoming Indonesia",
  "EVCE",
  "Lainnya",
];
function openAddTask() {
  openModal(
    "Add New Task",
    `
    <div class="fl"><label>Task Title *</label><input class="inp" id="t-title" placeholder="e.g. Physics Lab Report"></div>
    <div class="fl"><label>Subject</label><select class="inp" id="t-subj">${SUBJ.map((s) => `<option>${s}</option>`).join("")}</select></div>
    <div class="fl"><label>Deadline *</label><input class="inp" type="datetime-local" id="t-dl"></div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveAddTask()"><i class="fas fa-plus"></i> Add Task</button>`,
  );
}
function saveAddTask() {
  const t = document.getElementById("t-title").value.trim(),
    dl = document.getElementById("t-dl").value,
    s = document.getElementById("t-subj").value;
  if (!t || !dl) return;
  const tasks = getTasks();
  tasks.push({
    id: Date.now(),
    title: t,
    subject: s,
    deadline: dl,
    completed: false,
  });
  LS.s("tasks", tasks);
  closeModal();
  renderView("tasks");
  showToast("✅ Task added!");
}
function openEditTask(id) {
  const t = getTasks().find((x) => x.id === id);
  if (!t) return;
  openModal(
    "Edit Task",
    `
  <div class="fl"><label>Task Title</label><input class="inp" id="et-title" value="${t.title}"></div>
  <div class="fl"><label>Subject</label><select class="inp" id="et-subj">${SUBJ.map((s) => `<option ${s === t.subject ? "selected" : ""}>${s}</option>`).join("")}</select></div>
  <div class="fl"><label>Deadline</label><input class="inp" type="datetime-local" id="et-dl" value="${t.deadline}"></div>
  <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveEditTask(${id})"><i class="fas fa-save"></i> Save</button>`,
  );
}
function saveEditTask(id) {
  const title = document.getElementById("et-title").value.trim(),
    dl = document.getElementById("et-dl").value,
    subj = document.getElementById("et-subj").value;
  if (!title || !dl) return;
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, title, subject: subj, deadline: dl } : t,
  );
  LS.s("tasks", tasks);
  closeModal();
  renderView("tasks");
  showToast("✅ Task updated!");
}
function toggleTask(id) {
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );
  LS.s("tasks", tasks);
  renderView("tasks");
}
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  LS.s(
    "tasks",
    getTasks().filter((t) => t.id !== id),
  );
  renderView("tasks");
  showToast("🗑️ Task deleted");
}

/* ══════════════════ CALENDAR ══════════════════ */
function renderCalendar(el) {
  const events = getEvents(),
    today = TODAY;
  const firstDay = new Date(calY, calM, 1).getDay();
  const dim = new Date(calY, calM + 1, 0).getDate();
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selEvs = events
    .filter((e) => e.date === calSel)
    .sort((a, b) => a.start.localeCompare(b.start));
  const totalToday = events.filter((e) => e.date === today).length;
  const ETC = {
    kuliah: "var(--m)",
    rapat: "var(--md)",
    assignment: "var(--mm)",
    ukm: "#777",
  };

  el.innerHTML = `
<div class="g4" style="margin-bottom:1.25rem">
  ${[
    { ic: "far fa-calendar-alt", v: events.length, l: "Total Events" },
    { ic: "fas fa-sun", v: totalToday, l: "Today" },
    {
      ic: "fas fa-book",
      v: events.filter((e) => e.type === "belajar").length,
      l: "Study Sessions",
    },
    {
      ic: "fas fa-graduation-cap",
      v: events.filter((e) => e.type === "kuliah").length,
      l: "Lectures",
    },
  ]
    .map(
      (s) => `
  <div class="card" style="text-align:center"><i class="${s.ic}" style="font-size:1.4rem;color:var(--m);display:block;margin:0 0 5px"></i>
    <p style="font-weight:800;font-size:1.7rem;color:var(--m);margin:0">${s.v}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">${s.l}</p>
  </div>`,
    )
    .join("")}
</div>
<div style="display:grid;grid-template-columns:2fr 1fr;gap:1.25rem" class="g-cal">
  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
      <button class="btn-g" onclick="calPrev()"><i class="fas fa-chevron-left"></i></button>
      <h3 style="font-weight:700;font-size:.98rem;color:var(--text)">${MONTHS[calM]} ${calY}</h3>
      <button class="btn-g" onclick="calNext()"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="cal-g" style="margin-bottom:4px">
      ${DAYS.map((d) => `<div class="cal-hdr">${d}</div>`).join("")}
    </div>
    <div class="cal-g">
      ${Array.from({ length: firstDay })
        .map(() => "<div></div>")
        .join("")}
      ${Array.from({ length: dim })
        .map((_, i) => {
          const d = i + 1;
          const ds = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const evs = events.filter((e) => e.date === ds);
          const isT = ds === today,
            isS = ds === calSel;
          return `<div class="cal-cell ${isT ? "today" : ""} ${isS ? "sel" : ""}" onclick="calSelect('${ds}')"><div class="cal-dn">${d}</div>${
            evs.length
              ? `<div class="cal-dots">${evs
                  .slice(0, 3)
                  .map(() => '<div class="cal-dot"></div>')
                  .join("")}</div>`
              : ""
          }</div>`;
        })
        .join("")}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;padding-top:11px;border-top:1px solid var(--border)">
      ${Object.entries(ETC)
        .map(
          ([k, v]) =>
            `<div style="display:flex;align-items:center;gap:5px"><div style="width:7px;height:7px;border-radius:50%;background:${v}"></div><span style="font-size:.69rem;color:var(--sub)">${k.charAt(0).toUpperCase() + k.slice(1)}</span></div>`,
        )
        .join("")}
    </div>
  </div>
  <div class="card" style="display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div><h3 style="font-weight:700;font-size:.88rem;color:var(--text);margin:0">${new Date(calSel + "T12:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</h3><p style="font-size:.68rem;color:var(--sub);margin:0">${selEvs.length} event</p></div>
      <button class="btn-p" style="font-size:.76rem;padding:6px 10px" onclick="openAddEvent()"><i class="fas fa-plus"></i> Add</button>
    </div>
    <div style="flex:1;overflow-y:auto">
      ${
        selEvs.length === 0
          ? '<div style="text-align:center;padding:2rem;color:var(--sub)"><i class="far fa-calendar" style="font-size:1.8rem;opacity:.2;display:block;margin:0 auto 8px"></i><p style="font-size:.8rem">Klik "Add" untuk tambah event</p></div>'
          : selEvs
              .map((e) => {
                const ec = ETC[e.type] || "var(--m)";
                return `<div style="display:flex;gap:7px;padding:8px 10px;background:rgba(128,0,32,.06);border:1px solid rgba(128,0,32,.15);border-radius:9px;margin-bottom:6px;align-items:flex-start"><div style="width:3px;align-self:stretch;background:${ec};border-radius:99px;flex-shrink:0"></div><div style="flex:1"><p style="font-weight:600;font-size:.8rem;color:var(--text);margin:0">${e.title}</p><p style="font-size:.69rem;color:${ec};margin:0;font-weight:500">${fmtT(e.start)}–${fmtT(e.end)}</p><span style="font-size:.64rem;color:${ec};border:1px solid rgba(128,0,32,.2);padding:1px 6px;border-radius:99px">${e.type}</span></div><button class="bic del" onclick="deleteEvent(${e.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button></div>`;
              })
              .join("")
      }
    </div>
  </div>
</div>`;
}
function calPrev() {
  if (calM === 0) {
    calM = 11;
    calY--;
  } else calM--;
  renderView("calendar");
}
function calNext() {
  if (calM === 11) {
    calM = 0;
    calY++;
  } else calM++;
  renderView("calendar");
}
function calSelect(ds) {
  calSel = ds;
  renderView("calendar");
}
function openAddEvent() {
  openModal(
    "Tambah Event — " + calSel,
    `
    <div class="fl"><label>Judul Event *</label><input class="inp" id="ev-title" placeholder="e.g. AFL 2 Submission Deadline "></div>
    <div class="fl"><label>Jenis</label><select class="inp" id="ev-type"><option value="rapat">Rapat</option><option value="kuliah">Kuliah</option><option value="assignment">Assignment</option><option value="ukm">UKM</option></select></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="fl"><label>Mulai</label><input class="inp" type="time" id="ev-start" value="09:00"></div>
      <div class="fl"><label>Selesai</label><input class="inp" type="time" id="ev-end" value="11:00"></div>
    </div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveAddEvent()"><i class="fas fa-plus"></i> Tambah Event</button>`,
  );
}
function saveAddEvent() {
  const t = document.getElementById("ev-title").value.trim(),
    tp = document.getElementById("ev-type").value,
    s = document.getElementById("ev-start").value,
    e = document.getElementById("ev-end").value;
  if (!t) return;
  const evs = getEvents();
  evs.push({
    id: Date.now(),
    title: t,
    type: tp,
    start: calSel + "T" + s,
    end: calSel + "T" + e,
    date: calSel,
  });
  LS.s("calendarEvents", evs);
  closeModal();
  renderView("calendar");
  showToast("✅ Event ditambahkan!");
}
function deleteEvent(id) {
  if (!confirm("Hapus event ini?")) return;
  LS.s(
    "calendarEvents",
    getEvents().filter((e) => e.id !== id),
  );
  renderView("calendar");
  showToast("🗑️ Event dihapus");
}

/* ══════════════════ GOALS ══════════════════ */
function renderGoals(el) {
  const cel = getCel(),
    study = getStudy(),
    set = getSettings(),
    gpa = avgGPA(),
    ach = achievedCount(),
    pend = pendingCount();
  const studyPct = Math.min(100, Math.round((study.weeklyTotal / 25) * 100));

  el.innerHTML = `  
<div class="g4" style="margin-bottom:1.25rem">
  ${[
    {
      ic: "fas fa-graduation-cap",
      v: gpa > 0 ? gpa.toFixed(2) : "—",
      l: "Avg GPA",
    },
    { ic: "fas fa-piggy-bank", v: `${ach}/${cel.length}`, l: "Reached" },
    { ic: "far fa-clipboard", v: pend, l: "Pending Tasks" },
    { ic: "fas fa-clock", v: study.weeklyTotal + "h", l: "Study Current Week" },
  ]
    .map(
      (s) => `
  <div class="card" style="text-align:center"><i class="${s.ic}" style="font-size:1.4rem;color:var(--m);display:block;margin:0 0 5px"></i>
    <p style="font-weight:800;font-size:1.5rem;color:var(--m);margin:0">${s.v}</p>
    <p style="font-size:.72rem;color:var(--sub);margin:0">${s.l}</p>
  </div>`,
    )
    .join("")}
</div>
<!-- Active Goals -->
<div class="card" style="margin-bottom:1.25rem">
  <div class="sec-hd"><span class="sec-t"><i class="fas fa-bullseye" style="color:var(--m)"></i> Active Goals</span><span style="font-size:.72rem;color:var(--sub)">Automatically synced</span></div>
  <div class="g2">
    ${[
      {
        ic: "🎓",
        l: "Midterm GPA Target",
        v: `${gpa > 0 ? gpa.toFixed(2) : "—"} / 4.0`,
        pct: gpa > 0 ? Math.round((gpa / 4) * 100) : 0,
      },
      {
        ic: "⏱️",
        l: "Study Hours / Week",
        v: `${study.weeklyTotal} / 25h`,
        pct: studyPct,
      },
      {
        ic: "🪙",
        l: "Reached Target",
        v: `${ach} / ${cel.length}`,
        pct: cel.length ? Math.round((ach / cel.length) * 100) : 0,
      },
      { ic: "💻", l: "Online Course", v: "65 / 100%", pct: 65 },
    ]
      .map(
        (g) =>
          `<div style="background:var(--sec);border:1px solid var(--border);border-radius:11px;padding:10px 12px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:.8rem;font-weight:600;color:var(--text)">${g.ic} ${g.l}</span><span style="font-weight:700;font-size:.77rem;color:var(--m)">${g.v}</span></div><div class="ptr"><div class="pb" style="width:${g.pct}%"></div></div><p style="font-size:.64rem;color:var(--sub);margin:3px 0 0">${g.pct}%</p></div>`,
      )
      .join("")}
  </div>
</div>
<!-- Celengan -->
<div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
    <div>
      <h3 style="font-weight:700;font-size:.95rem;color:var(--text);margin:0"><i class="fas fa-fire" style="color:var(--m)"></i> Grade Targets</h3>
      <p style="font-size:.7rem;color:var(--sub);margin:0">${ach}/${cel.length} reached</p>
    </div>
    <button class="btn-p" onclick="openAddCel()"><i class="fas fa-plus"></i> Add Target</button>
  </div>
  <div class="g2">
    ${
      cel.length === 0
        ? '<div style="grid-column:1/-1;text-align:center;padding:3rem;border:2px dashed var(--border);border-radius:16px;color:var(--sub)"><p style="font-size:2rem;margin:0 0 8px">🪙</p><p>Belum ada celengan. Tambahkan sekarang!</p></div>'
        : cel
            .map((c, idx) => {
              const pct =
                c.targetScore > 0
                  ? Math.min(
                      100,
                      Math.round((c.currentScore / c.targetScore) * 100),
                    )
                  : 0;
              const coins = ["🏺", "💰", "🌟", "⭐", "💎", "🎖️", "🏆", "🪙"];
              return `<div class="card">
        <div style="display:flex;gap:10px;margin-bottom:11px">
          <div style="width:42px;height:42px;border-radius:10px;background:rgba(128,0,32,.1);border:1px solid rgba(128,0,32,.2);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${coins[idx % 8]}</div>
          <div style="flex:1;min-width:0"><p style="font-weight:700;font-size:.88rem;color:var(--text);margin:0 0 3px">${c.courseName}</p><div style="display:flex;gap:5px;flex-wrap:wrap"><span style="font-size:.66rem;color:var(--sub)">${c.semester}</span><span class="chip">Target: ${c.targetGrade} (${c.targetScore.toFixed(1)})</span></div></div>
          <button class="bic del" onclick="deleteCel(${c.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
        </div>
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.71rem;color:var(--sub)">Progress</span><span style="font-weight:800;font-size:.8rem;color:var(--m)">${pct}%</span></div>
          <div style="display:flex;gap:2px;margin-bottom:3px">${Array.from({
            length: 10,
          })
            .map(
              (_, i) =>
                `<div style="flex:1;height:9px;border-radius:3px;background:${i < Math.round(pct / 10) ? "var(--m)" : "rgba(128,0,32,.12)"};transition:background .4s"></div>`,
            )
            .join("")}</div>
          <div class="ptr"><div class="pb" style="width:${pct}%"></div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--sec);border:1px solid var(--border);border-radius:9px;padding:8px 11px">
          <div><p style="font-size:.66rem;color:var(--sub);margin:0">Current Score</p><p style="font-weight:800;font-size:1.2rem;color:var(--m);margin:0">${c.currentScore.toFixed(1)}<span style="font-size:.72rem;color:var(--sub)"> / ${c.targetScore.toFixed(1)}</span></p></div>
          <button class="btn-p" style="font-size:.76rem;padding:6px 10px" onclick="updateCelScore(${c.id})"><i class="fas fa-edit"></i> Update</button>
        </div>
        <p style="font-size:.75rem;font-weight:600;color:var(--m);margin:7px 0 0">${pct >= 100 ? "🎉 Target reached!" : pct >= 75 ? "💪 Almost there!" : pct >= 50 ? "🎯 Halfway there!" : "📖 Need more study"}</p>
      </div>`;
            })
            .join("")
    }
  </div>
</div>`;
}
function openAddCel() {
  openModal(
    "🌟 Set your grade targets",
    `
    <div class="fl"><label>Lecture Name *</label><input class="inp" id="cl-name" placeholder="e.g. Advance Programming"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="fl"><label>Target Grade</label><select class="inp" id="cl-grade">${["A", "A-", "B+", "B", "B-", "C+", "C"].map((g) => `<option value="${g}">${g}</option>`).join("")}</select></div>
      <div class="fl"><label>Semester</label><select class="inp" id="cl-sem">${[1, 2, 3, 4, 5, 6, 7, 8].map((s) => `<option value="Semester ${s}">Semester ${s}</option>`).join("")}</select></div>
    </div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveAddCel()"><i class="fas fa-fire"></i> Tambah Target</button>`,
  );
}
const GSCORE = {
  A: 4.0,
  "A-": 3.75,
  "B+": 3.5,
  B: 3.0,
  "B-": 2.75,
  "C+": 2.5,
  C: 2.0,
};
function saveAddCel() {
  const n = document.getElementById("cl-name").value.trim(),
    g = document.getElementById("cl-grade").value,
    sem = document.getElementById("cl-sem").value;
  if (!n) return;
  const cel = getCel();
  cel.push({
    id: Date.now(),
    courseName: n,
    targetGrade: g,
    targetScore: GSCORE[g] || 4,
    semester: sem,
    currentScore: 0,
  });
  LS.s("celenganTargets", cel);
  closeModal();
  renderView("goals");
  showToast("✅ Celengan ditambahkan!");
}
function updateCelScore(id) {
  const c = getCel().find((x) => x.id === id);
  if (!c) return;
  const v = prompt(
    `Update score "${c.courseName}" (0–4.0):\nCurrent score: ${c.currentScore.toFixed(1)}`,
    c.currentScore.toFixed(1),
  );
  if (v === null) return;
  const n = parseFloat(v);
  if (isNaN(n) || n < 0 || n > 4) return alert("Score must be between 0–4.0");
  LS.s(
    "celenganTargets",
    getCel().map((x) => (x.id === id ? { ...x, currentScore: n } : x)),
  );
  renderView("goals");
  showToast("✅ Score updated!");
}
function deleteCel(id) {
  if (!confirm("Delete this target?")) return;
  LS.s(
    "celenganTargets",
    getCel().filter((c) => c.id !== id),
  );
  renderView("goals");
  showToast("🗑️ Target deleted");
}

/* ══════════════════ ANALYTICS ══════════════════ */
function renderAnalytics(el) {
  const study = getStudy(),
    cel = getCel(),
    tasks = getTasks(),
    gpa = avgGPA(),
    ach = achievedCount();
  const done = tasks.filter((t) => t.completed).length,
    pend = tasks.filter((t) => !t.completed).length,
    ovd = tasks.filter(
      (t) => !t.completed && new Date(t.deadline).getTime() < Date.now(),
    ).length;
  const ipkT = [
    { s: "Sem 1", v: 3.42 },
    { s: "Sem 2", v: 3.58 },
    { s: "Sem 3", v: 3.65 },
    { s: "Sem 4", v: gpa > 0 ? gpa : 3.72 },
  ];

  el.innerHTML = `
<div class="g4" style="margin-bottom:1.25rem">
  ${[
    {
      ic: "fas fa-clock",
      v: study.weeklyTotal + "h",
      l: "Current Week",
      sub: `+${(((study.weeklyTotal - study.lastWeekTotal) / study.lastWeekTotal) * 100).toFixed(0)}% vs last week`,
    },
    {
      ic: "fas fa-graduation-cap",
      v: gpa > 0 ? gpa.toFixed(2) : "—",
      l: "Avg GPA",
      sub: `${cel.length} courses`,
    },
    {
      ic: "fas fa-check-circle",
      v: done,
      l: "Tasks Completed",
      sub: pend + " pending",
    },
    {
      ic: "fas fa-chart-bar",
      v: study.aboveAvg + "%",
      l: "Above Average",
      sub: "class percentile",
    },
  ]
    .map(
      (s) => `
  <div class="card"><i class="${s.ic}" style="font-size:1.4rem;color:var(--m);display:block;margin:0 0 5px"></i>
    <p style="font-weight:800;font-size:1.5rem;color:var(--m);margin:0 0 1px">${s.v}</p>
    <p style="font-size:.73rem;color:var(--text);font-weight:600;margin:0 0 1px">${s.l}</p>
    <p style="font-size:.67rem;color:var(--sub);margin:0">${s.sub}</p>
  </div>`,
    )
    .join("")}
</div>
<div class="g2" style="margin-bottom:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
  <div class="card"><div class="sec-hd"><span class="sec-t">📊 Study Hours Harian</span></div><div style="position:relative;height:190px"><canvas id="ch-weekly"></canvas></div>
    <div style="display:flex;justify-content:space-between;margin-top:10px;padding:8px 11px;background:var(--sec);border-radius:9px;border:1px solid var(--border)">
      ${[
        { v: study.weeklyTotal + "h", l: "Total" },
        { v: (study.weeklyTotal / 7).toFixed(1) + "h", l: "Rata-rata" },
        { v: Math.max(...study.history) + "h", l: "Terbanyak" },
      ]
        .map(
          (s) =>
            `<div style="text-align:center"><p style="font-weight:700;font-size:.92rem;color:var(--m);margin:0">${s.v}</p><p style="font-size:.64rem;color:var(--sub);margin:0">${s.l}</p></div>`,
        )
        .join("")}
    </div>
  </div>
  <div class="card"><div class="sec-hd"><span class="sec-t">📈 GPA Graphic</span></div><div style="position:relative;height:190px"><canvas id="ch-ipk"></canvas></div>
    <div style="margin-top:10px;padding:8px 11px;background:var(--sec);border:1px solid var(--border);border-radius:9px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:.77rem;color:var(--sub)">Projection Sem 4</span><span style="font-weight:800;font-size:.98rem;color:var(--m)">${gpa > 0 ? gpa.toFixed(2) : "3.72"}</span></div>
  </div>
</div>
<div class="g2" style="margin-bottom:1.25rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
  <div class="card"><div class="sec-hd"><span class="sec-t">⏳ Time Distribution</span></div>
    <div style="display:flex;gap:20px;align-items:center">
      <canvas id="ch-dist" width="140" height="140" style="flex-shrink:0"></canvas>
      <div style="flex:1">
        ${[
          ["Studying", 40, "var(--m)"],
          ["Assignments", 25, "var(--mm)"],
          ["Rest", 20, "#888"],
          ["Classes", 15, "var(--md)"],
        ]
          .map(
            ([l, v, c]) =>
              `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="font-size:.76rem;color:var(--text)">${l}</span><span style="font-weight:700;font-size:.76rem;color:${c}">${v}%</span></div><div class="ptr"><div style="height:100%;width:${v}%;background:${c};border-radius:99px"></div></div></div>`,
          )
          .join("")}
      </div>
    </div>
  </div>
  <div class="card"><div class="sec-hd"><span class="sec-t">🪙 Target Insights</span></div>
    <div class="g2" style="margin-bottom:12px">
      ${[
        {
          v: ach,
          l: "Reached ✅",
          bg: "rgba(128,0,32,.1)",
          bc: "rgba(128,0,32,.25)",
        },
        {
          v: cel.filter(
            (c) => c.currentScore > 0 && c.currentScore < c.targetScore,
          ).length,
          l: "In Progress",
          bg: "rgba(165,42,42,.08)",
          bc: "rgba(165,42,42,.2)",
        },
        {
          v: cel.filter((c) => c.currentScore === 0).length,
          l: "Not Started",
          bg: "var(--sec)",
          bc: "var(--border)",
        },
        {
          v: cel.length,
          l: "Total Targets",
          bg: "rgba(128,0,32,.07)",
          bc: "rgba(128,0,32,.18)",
        },
      ]
        .map(
          (s) =>
            `<div style="background:${s.bg};border:1px solid ${s.bc};border-radius:9px;padding:8px;text-align:center"><p style="font-weight:800;font-size:1.4rem;color:var(--m);margin:0">${s.v}</p><p style="font-size:.66rem;color:var(--sub);margin:0">${s.l}</p></div>`,
        )
        .join("")}
    </div>
    ${cel
      .map((c) => {
        const pct =
          c.targetScore > 0
            ? Math.min(100, Math.round((c.currentScore / c.targetScore) * 100))
            : 0;
        return `<div style="background:var(--sec);border:1px solid var(--border);border-radius:8px;padding:7px 10px;margin-bottom:5px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:.74rem;color:var(--text)">${c.courseName.length > 22 ? c.courseName.slice(0, 22) + "…" : c.courseName}</span><span style="font-size:.72rem;font-weight:700;color:var(--m)">${pct}%</span></div><div class="ptr"><div class="pb" style="width:${pct}%"></div></div></div>`;
      })
      .join("")}
  </div>
</div>
<div class="card"><div class="sec-hd"><span class="sec-t">📋 Assignments Insights</span></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;text-align:center;margin-bottom:14px">
    ${[
      {
        v: done,
        l: "Completed",
        pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        op: 1,
      },
      {
        v: pend,
        l: "Pending",
        pct: tasks.length ? Math.round((pend / tasks.length) * 100) : 0,
        op: 0.7,
      },
      {
        v: ovd,
        l: "Overdue",
        pct: tasks.length ? Math.round((ovd / tasks.length) * 100) : 0,
        op: 0.5,
      },
    ]
      .map(
        (s) =>
          `<div><div style="height:70px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:5px"><div style="width:36px;height:${Math.max(8, s.pct * 0.7)}%;min-height:8px;background:var(--m);border-radius:5px 5px 0 0;opacity:${s.op}"></div></div><p style="font-weight:800;font-size:1.2rem;color:var(--m);margin:0">${s.v}</p><p style="font-size:.72rem;color:var(--sub);margin:0">${s.l}</p></div>`,
      )
      .join("")}
  </div>
  ${tasks.length > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.78rem;font-weight:600;color:var(--text)">Completion Rate</span><span style="font-weight:700;font-size:.78rem;color:var(--m)">${Math.round((done / tasks.length) * 100)}%</span></div><div class="ptr"><div class="pb" style="width:${Math.round((done / tasks.length) * 100)}%"></div></div>` : ""}
</div>`;

  setTimeout(() => {
    const dm = document.documentElement.getAttribute("data-theme") === "dark";
    const tc = { color: dm ? "#a0a0a0" : "#666", font: { size: 11 } };
    const gc = dm ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
    Object.keys(charts).forEach((k) => {
      try {
        charts[k].destroy();
      } catch {}
    });
    charts = {};
    const cW = document.getElementById("ch-weekly");
    if (cW) {
      charts.W = new Chart(cW, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              data: study.history,
              backgroundColor: study.history.map((v) =>
                v === Math.max(...study.history)
                  ? "#800020"
                  : dm
                    ? "rgba(128,0,32,.3)"
                    : "rgba(128,0,32,.18)",
              ),
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: tc },
            y: { grid: { color: gc }, ticks: tc },
          },
        },
      });
    }
    const cI = document.getElementById("ch-ipk");
    if (cI) {
      charts.I = new Chart(cI, {
        type: "line",
        data: {
          labels: ipkT.map((x) => x.s),
          datasets: [
            {
              data: ipkT.map((x) => x.v),
              borderColor: "#800020",
              backgroundColor: "rgba(128,0,32,.08)",
              pointBackgroundColor: "#800020",
              pointRadius: 5,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: tc },
            y: { min: 3, max: 4, grid: { color: gc }, ticks: tc },
          },
        },
      });
    }
    const cD = document.getElementById("ch-dist");
    if (cD) {
      charts.D = new Chart(cD, {
        type: "doughnut",
        data: {
          labels: ["Rapat", "Assignment", "UKM", "Kuliah"],
          datasets: [
            {
              data: [40, 25, 20, 15],
              backgroundColor: ["#800020", "#a52a2a", "#aaa", "#5a0015"],
              borderWidth: 0,
            },
          ],
        },
        options: { plugins: { legend: { display: false } }, cutout: "60%" },
      });
    }
  }, 80);
}

/* ══════════════════ PROFILE ══════════════════ */
function openProfile() {
  const ov = document.getElementById("prof-ov"),
    pp = document.getElementById("prof-p");
  renderProfileContent();
  ov.classList.add("open");
  pp.classList.add("open");
}
function closeProfile() {
  document.getElementById("prof-ov").classList.remove("open");
  document.getElementById("prof-p").classList.remove("open");
}
function renderProfileContent() {
  const set = getSettings(),
    cel = getCel(),
    tasks = getTasks(),
    study = getStudy();
  const gpa = avgGPA(),
    ach = achievedCount();
  const done = tasks.filter((t) => t.completed).length;
  const earnedBadges = computeBadges();

  const tl = [
    { ic: "fas fa-check-circle", t: "Completed Task", s: "2 hours ago" },
    { ic: "fas fa-calendar-check", t: "Making Schedule", s: "Yesterday" },
    {
      ic: "fas fa-piggy-bank",
      t: `Updating Target: ${cel[0]?.courseName || "Algoritma"} → ${cel[0]?.currentScore?.toFixed(1) || 3.7}`,
      s: "2 days ago",
    },
    {
      ic: "fas fa-fire",
      t: "Study Streak: " + set.streak + " days!",
      s: "3 days ago",
    },
    { ic: "fas fa-star", t: 'Badge "Study Warrior" reached', s: "1 week ago" },
  ];

  document.getElementById("prof-content").innerHTML = `
<div class="prof-cover">
  <button onclick="closeProfile()" style="position:absolute;top:12px;right:12px;z-index:2;background:rgba(255,255,255,.18);border:none;cursor:pointer;border-radius:8px;padding:7px 10px;color:#fff"><i class="fas fa-times"></i></button>
</div>
<div style="padding:0 1.5rem 2rem">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px">
    <div class="prof-av" id="prof-av-el">${set.avatarInit || "A"}</div>
    <button class="btn-g" onclick="openEditProfile()" style="margin-bottom:10px"><i class="fas fa-edit"></i> Edit Profil</button>
  </div>
  <h2 style="font-weight:800;font-size:1.35rem;color:var(--text);margin:0 0 3px" id="prof-nm">${set.name}</h2>
  <p style="font-size:.82rem;color:var(--m);font-weight:600;margin:0 0 8px">Surabaya Ciputra University Freshman</p>
  <div style="background:rgba(128,0,32,.07);border:1px solid rgba(128,0,32,.18);border-radius:10px;padding:10px 14px;margin-bottom:1.25rem">
    <p style="font-size:.83rem;color:var(--text);font-style:italic;margin:0;line-height:1.6" id="prof-bio">"${set.bio}"</p>
  </div>

  <!-- Stats count-up -->
  <div class="g3" style="margin-bottom:1.4rem">
    <div class="sc"><div style="font-size:1.5rem;margin-bottom:6px">⏱️</div><p style="font-weight:800;font-size:2rem;color:var(--m);margin:0" id="cu-hrs">0</p><p style="font-size:.73rem;color:var(--sub);margin:0">Hours Studied</p></div>
    <div class="sc"><div style="font-size:1.5rem;margin-bottom:6px">🎓</div><p style="font-weight:800;font-size:2rem;color:var(--m);margin:0" id="cu-gpa">0.00</p><p style="font-size:.73rem;color:var(--sub);margin:0">Average GPA</p></div>
    <div class="sc"><div style="font-size:1.5rem;margin-bottom:6px">🪙</div><p style="font-weight:800;font-size:2rem;color:var(--m);margin:0" id="cu-cel">0</p><p style="font-size:.73rem;color:var(--sub);margin:0">Targets Reached</p></div>
  </div>

  <!-- Celengan + Timeline (2 col) -->
  <div class="g2" style="margin-bottom:1.4rem;display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
    <div class="card">
      <div class="sec-hd"><span class="sec-t" style="font-size:.88rem"><i class="fas fa-fire" style="color:var(--m)"></i> Grade Targets</span><span style="font-size:.7rem;font-weight:700;color:var(--m)">${ach}/${cel.length}</span></div>
      ${
        cel.length === 0
          ? '<p style="color:var(--sub);font-size:.82rem;text-align:center;padding:1rem">Belum ada celengan</p>'
          : cel
              .map((c, idx) => {
                const pct =
                  c.targetScore > 0
                    ? Math.min(
                        100,
                        Math.round((c.currentScore / c.targetScore) * 100),
                      )
                    : 0;
                return `<div style="background:var(--sec);border:1px solid var(--border);border-radius:10px;padding:9px 11px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-weight:600;font-size:.8rem;color:var(--text)">${c.courseName.length > 18 ? c.courseName.slice(0, 18) + "…" : c.courseName}</span><div style="display:flex;gap:5px;align-items:center">${pct >= 100 ? '<span style="font-size:.8rem">✅</span>' : ""}<span style="font-weight:800;font-size:.79rem;color:var(--m)">${pct}%</span></div></div>
        <div class="ptr"><div class="pb" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:3px"><span style="font-size:.64rem;color:var(--sub)">${c.semester}</span><div style="display:flex;gap:4px">
          <button onclick="updateCelScore(${c.id});closeProfile()" style="font-size:.65rem;background:rgba(128,0,32,.1);border:1px solid rgba(128,0,32,.2);border-radius:5px;padding:2px 6px;cursor:pointer;color:var(--m);font-family:Inter,sans-serif"><i class="fas fa-edit"></i></button>
          <button onclick="deleteCel(${c.id});renderProfileContent()" style="font-size:.65rem;background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);border-radius:5px;padding:2px 6px;cursor:pointer;color:#dc2626;font-family:Inter,sans-serif"><i class="fas fa-trash-alt"></i></button>
        </div></div>
      </div>`;
              })
              .join("")
      }
      <button class="btn-p" style="width:100%;justify-content:center;font-size:.77rem;padding:7px;margin-top:4px" onclick="closeProfile();navigate('goals')"><i class="fas fa-external-link-alt"></i> Kelola Semua</button>
    </div>
    <!-- Timeline -->
    <div class="card">
      <div class="sec-hd"><span class="sec-t" style="font-size:.88rem"><i class="fas fa-history" style="color:var(--m)"></i> Aktivitas Terbaru</span></div>
      ${tl.map((item, i) => `<div class="tl-item"><div class="tl-ic"><i class="${item.ic}"></i></div><div style="padding-top:3px"><p style="font-size:.8rem;font-weight:500;color:var(--text);margin:0 0 2px;line-height:1.4">${item.t}</p><p style="font-size:.67rem;color:var(--sub);margin:0">${item.s}</p></div></div>`).join("")}
    </div>
  </div>

  <!-- Badges -->
  <div class="card">
    <div class="sec-hd"><span class="sec-t"><i class="fas fa-medal" style="color:var(--m)"></i> Badges</span><span style="font-size:.72rem;font-weight:700;color:var(--m)">${earnedBadges.filter((b) => b.earned).length}/${earnedBadges.length} diraih</span></div>
    <div class="g4">
      ${earnedBadges.map((b) => `<div class="badge-item ${b.earned ? "earned" : ""}" title="${b.desc}"><div style="font-size:1.6rem;margin-bottom:5px">${b.icon}</div><p style="font-weight:600;font-size:.67rem;color:${b.earned ? "var(--m)" : "var(--sub)"};margin:0;line-height:1.3">${b.name}</p></div>`).join("")}
    </div>
    <div style="margin-top:11px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.75rem;color:var(--sub)">Progres Lencana</span><span style="font-size:.75rem;font-weight:700;color:var(--m)">${Math.round((earnedBadges.filter((b) => b.earned).length / earnedBadges.length) * 100)}%</span></div>
      <div class="ptr"><div class="pb" style="width:${Math.round((earnedBadges.filter((b) => b.earned).length / earnedBadges.length) * 100)}%"></div></div>
    </div>
  </div>
</div>`;

  // Count-up animations
  countUp("cu-hrs", set.totalHours || 128, 0, 1800);
  countUp("cu-gpa", gpa > 0 ? gpa : 0, 2, 1800);
  countUp("cu-cel", ach, 0, 1200);
}

function countUp(id, target, dec, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - (1 - p) ** 3;
    const v = target * eased;
    el.textContent = dec > 0 ? v.toFixed(dec) : Math.floor(v);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = dec > 0 ? target.toFixed(dec) : target;
  }
  requestAnimationFrame(tick);
}

function computeBadges() {
  const tasks = getTasks(),
    cel = getCel(),
    events = getEvents(),
    study = getStudy();
  const done = tasks.filter((t) => t.completed).length;
  return [
    {
      icon: "📚",
      name: "Studious",
      desc: "15+ hours of studying this week",
      earned: study.weeklyTotal >= 15,
    },
    {
      icon: "🎯",
      name: "Target Hunter",
      desc: "1+ target 100% reached",
      earned: cel.some((c) => c.currentScore >= c.targetScore),
    },
    {
      icon: "🪙",
      name: "High Achiever",
      desc: "2+ targets reached",
      earned: cel.filter((c) => c.currentScore >= c.targetScore).length >= 2,
    },
    {
      icon: "🌅",
      name: "Early Bird",
      desc: "There is an event before 8 AM",
      earned: events.some(
        (e) =>
          e.start.includes("T07") ||
          e.start.includes("T06") ||
          e.start.includes("T08"),
      ),
    },
  ];
}

function openEditProfile() {
  const s = getSettings();
  closeProfile();
  openModal(
    "Edit Profil",
    `
    <div style="display:flex;justify-content:center;margin-bottom:1rem"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--m),#c87070);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;color:#fff">${s.avatarInit || "A"}</div></div>
    <div class="fl"><label>Nama Lengkap</label><input class="inp" id="ep-name" value="${s.name}"></div>
    <div class="fl"><label>Bio / Motto</label><textarea class="inp" id="ep-bio" rows="3" style="resize:none">${s.bio}</textarea></div>
    <button class="btn-p" style="width:100%;justify-content:center;margin-top:4px" onclick="saveEditProfile()"><i class="fas fa-save"></i> Simpan</button>`,
  );
}
function saveEditProfile() {
  const n = document.getElementById("ep-name").value.trim(),
    b = document.getElementById("ep-bio").value.trim();
  if (!n) return;
  const s = getSettings();
  s.name = n;
  s.bio = b;
  s.avatarInit = n.charAt(0).toUpperCase();
  LS.s("userSettings", s);
  closeModal();
  updateSidebar();
  openProfile();
  showToast("✅ Profil diperbarui!");
}

/* ══════════════════ INIT ══════════════════ */
function init() {
  // Init defaults
  if (!LS.g("tasks", null)) LS.s("tasks", DD.tasks);
  if (!LS.g("calendarEvents", null)) LS.s("calendarEvents", DD.events);
  if (!LS.g("celenganTargets", null)) LS.s("celenganTargets", DD.cel);
  if (!LS.g("studyHoursData", null)) LS.s("studyHoursData", DD.study);
  if (!LS.g("userSettings", null)) LS.s("userSettings", DD.settings);
  // Apply theme
  const dm = localStorage.getItem("sc_dark") === "true";
  applyTheme(dm);
  // Render
  renderView("dashboard");
  updateSidebar();
}
init();
