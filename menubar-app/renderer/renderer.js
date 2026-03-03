'use strict'

// ---- State ----
let activeTask = null          // Task object | null
let pollInterval = null        // setInterval handle
let elapsedInterval = null     // setInterval for elapsed-time display

// ---- DOM refs ----
const statusDot       = document.getElementById('statusDot')
const idleState       = document.getElementById('idleState')
const runningState    = document.getElementById('runningState')
const elapsedDisplay  = document.getElementById('elapsedDisplay')
const activeDesc      = document.getElementById('activeDescription')
const stopBtn         = document.getElementById('stopBtn')
const taskForm        = document.getElementById('taskForm')
const taskInput       = document.getElementById('taskInput')
const startBtn        = document.getElementById('startBtn')
const formError       = document.getElementById('formError')
const recentList      = document.getElementById('recentList')
const offlineOverlay  = document.getElementById('offlineOverlay')
const retryBtn        = document.getElementById('retryBtn')

// ---- Time helpers ----

function formatElapsed(startIso) {
  const ms = Date.now() - new Date(startIso).getTime()
  if (ms < 0) return '0:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return '—'
  const totalMin = Math.round(ms / 60000)
  if (totalMin < 60) return `${totalMin}m`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ---- UI helpers ----

function setOnline(online) {
  statusDot.className = 'status-dot ' + (online ? 'online' : 'offline')
  statusDot.title = online ? 'Connected' : 'Server not reachable'
  if (online) {
    offlineOverlay.classList.add('hidden')
  } else {
    offlineOverlay.classList.remove('hidden')
  }
}

function showError(msg) {
  formError.textContent = msg
  formError.classList.remove('hidden')
  setTimeout(() => { formError.classList.add('hidden') }, 3000)
}

function renderActiveTask(task) {
  if (task) {
    activeTask = task
    idleState.classList.add('hidden')
    runningState.classList.remove('hidden')
    activeDesc.textContent = task.description
    startBtn.disabled = true
    taskInput.disabled = true
    taskInput.placeholder = 'Stop the active task first'
    startElapsedTimer(task.start_time)
  } else {
    activeTask = null
    runningState.classList.add('hidden')
    idleState.classList.remove('hidden')
    startBtn.disabled = false
    taskInput.disabled = false
    taskInput.placeholder = 'What are you working on?'
    stopElapsedTimer()
    elapsedDisplay.textContent = '0:00:00'
    window.trackIt.setTrayTitle('')
  }
}

function renderRecentTasks(tasks) {
  const done = tasks.filter(t => t.status === 'done').slice(0, 5)
  if (done.length === 0) {
    recentList.innerHTML = '<li class="recent-empty">No recent tasks</li>'
    return
  }
  recentList.innerHTML = done.map(t => `
    <li class="recent-item">
      <span class="recent-desc" title="${escapeHtml(t.description)}">${escapeHtml(t.description)}</span>
      <span class="recent-dur">${formatDuration(t.duration)}</span>
    </li>
  `).join('')
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- Elapsed timer ----

function startElapsedTimer(startIso) {
  stopElapsedTimer()
  const tick = () => {
    const text = formatElapsed(startIso)
    elapsedDisplay.textContent = text
    window.trackIt.setTrayTitle(text)
  }
  tick()
  elapsedInterval = setInterval(tick, 1000)
}

function stopElapsedTimer() {
  if (elapsedInterval) {
    clearInterval(elapsedInterval)
    elapsedInterval = null
  }
}

// ---- API calls ----

async function fetchActiveTask() {
  const res = await window.trackIt.request('GET', '/api/tasks/active')
  if (!res.ok && res.status === 0) {
    // Network error
    return { online: false, task: null }
  }
  return { online: true, task: res.data?.task ?? null }
}

async function fetchRecentTasks() {
  const res = await window.trackIt.request('GET', '/api/tasks')
  if (!res.ok) return []
  return res.data?.tasks ?? []
}

async function startTask(description) {
  return window.trackIt.request('POST', '/api/tasks', { description, status: 'in_progress' })
}

async function stopTask(id) {
  return window.trackIt.request('PATCH', '/api/tasks', {
    id,
    end_time: new Date().toISOString(),
    status: 'done',
  })
}

// ---- Polling ----

async function poll() {
  const { online, task } = await fetchActiveTask()
  setOnline(online)
  if (!online) {
    stopPolling()
    startRetryPolling()
    return
  }

  // Only re-render if state changed
  const prevId = activeTask?.id ?? null
  const nextId = task?.id ?? null
  if (prevId !== nextId) {
    renderActiveTask(task)
    // Also refresh recent tasks when state changes
    const tasks = await fetchRecentTasks()
    renderRecentTasks(tasks)
  }
}

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(poll, 1000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function startRetryPolling() {
  // Try to reconnect every 5 seconds
  stopPolling()
  pollInterval = setInterval(async () => {
    const { online } = await fetchActiveTask()
    if (online) {
      clearInterval(pollInterval)
      pollInterval = null
      await initialLoad()
    }
  }, 5000)
}

// ---- Event handlers ----

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const description = taskInput.value.trim()
  if (!description) return

  startBtn.disabled = true
  startBtn.textContent = 'Starting…'
  formError.classList.add('hidden')

  const res = await startTask(description)

  startBtn.textContent = 'Start'

  if (!res.ok) {
    startBtn.disabled = false
    if (res.status === 400) {
      showError('A task is already running. Stop it first.')
    } else if (res.status === 0) {
      showError('Server not reachable.')
      setOnline(false)
    } else {
      showError('Failed to start task. Try again.')
    }
    return
  }

  taskInput.value = ''
  renderActiveTask(res.data.task)
  // Refresh recent tasks in background
  fetchRecentTasks().then(renderRecentTasks)
})

stopBtn.addEventListener('click', async () => {
  if (!activeTask) return

  stopBtn.disabled = true
  stopBtn.textContent = 'Stopping…'

  const res = await stopTask(activeTask.id)

  stopBtn.disabled = false
  stopBtn.textContent = 'Stop task'

  if (!res.ok) {
    if (res.status === 0) {
      setOnline(false)
    } else {
      showError('Failed to stop task. Try again.')
    }
    return
  }

  renderActiveTask(null)
  fetchRecentTasks().then(renderRecentTasks)
})

retryBtn.addEventListener('click', async () => {
  stopPolling()
  const { online, task } = await fetchActiveTask()
  setOnline(online)
  if (online) {
    renderActiveTask(task)
    fetchRecentTasks().then(renderRecentTasks)
    startPolling()
  }
})

// ---- Init ----

async function initialLoad() {
  const { online, task } = await fetchActiveTask()
  setOnline(online)

  if (!online) {
    startRetryPolling()
    return
  }

  renderActiveTask(task)
  const tasks = await fetchRecentTasks()
  renderRecentTasks(tasks)
  startPolling()
}

initialLoad()
