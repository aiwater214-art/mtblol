const form = document.getElementById("payload-form");
const progressContainer = document.getElementById("progress-container");
const triggerButtons = Array.from(document.querySelectorAll("button[data-trigger]"));

let activeSource = null;
let activeJob = null;

function collectArgs() {
  const data = new FormData(form);
  return {
    project: data.get("project")?.trim() ?? "",
    version: data.get("version")?.trim() ?? "",
    token: data.get("token")?.trim() ?? "",
    notes: data.get("notes")?.trim() ?? "",
  };
}

function collectFiles(mode) {
  const textarea = document.getElementById(`${mode}-files`);
  if (!textarea) {
    return [];
  }
  return textarea.value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clearProgress(message = "Launch a download to see realtime progress updates.") {
  progressContainer.innerHTML = "";
  delete progressContainer.dataset.hasItems;
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = message;
  progressContainer.appendChild(p);
}

function ensureJobSpace() {
  progressContainer.innerHTML = "";
  delete progressContainer.dataset.hasItems;
}

function setButtonsDisabled(state) {
  triggerButtons.forEach((btn) => {
    btn.disabled = state;
    btn.classList.toggle("is-disabled", state);
  });
}

function createFileCard({ file, directory, index, total }) {
  const card = document.createElement("article");
  card.className = "file-progress breaking";
  card.dataset.file = file;

  const header = document.createElement("div");
  header.className = "file-title";

  const name = document.createElement("span");
  name.textContent = file;

  const meta = document.createElement("span");
  meta.textContent = `File ${index} of ${total} · ${directory}`;

  const track = document.createElement("div");
  track.className = "progress-track";

  const bar = document.createElement("div");
  bar.className = "progress-bar";
  bar.style.width = "0%";
  track.appendChild(bar);

  header.append(name, meta);
  card.append(header, track);

  return card;
}

function findCard(fileName) {
  return progressContainer.querySelector(`.file-progress[data-file="${CSS.escape(fileName)}"]`);
}

function updateProgress(card, percentage) {
  const bar = card.querySelector(".progress-bar");
  if (bar) {
    bar.style.width = `${Math.round(percentage * 100)}%`;
  }
}

function markComplete(card, path) {
  card.classList.remove("breaking");
  card.classList.add("complete");

  const subtitle = card.querySelector(".file-title span:last-child");
  if (subtitle) {
    subtitle.textContent = `Saved to ${path}`;
  }

  updateProgress(card, 1);
}

function handleStreamMessage(event) {
  const payload = JSON.parse(event.data);

  switch (payload.event) {
    case "start_file": {
      if (!progressContainer.dataset.hasItems) {
        ensureJobSpace();
        progressContainer.dataset.hasItems = "true";
      }
      const card = createFileCard(payload);

      // Remove breaking state from previous cards to pause their animation.
      progressContainer.querySelectorAll(".file-progress.breaking").forEach((el) => {
        if (el.dataset.file !== payload.file) {
          el.classList.remove("breaking");
        }
      });

      progressContainer.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "end" });
      break;
    }
    case "progress": {
      const card = findCard(payload.file);
      if (card) {
        card.classList.add("breaking");
        updateProgress(card, payload.progress);
      }
      break;
    }
    case "file_complete": {
      const card = findCard(payload.file);
      if (card) {
        markComplete(card, payload.path);
      }
      break;
    }
    case "job_complete": {
      activeJob = null;
      setButtonsDisabled(false);
      if (activeSource) {
        activeSource.close();
        activeSource = null;
      }

      const summary = document.createElement("div");
      summary.className = "file-progress complete";
      summary.innerHTML = `<div class="file-title"><span>All ${payload.mode} files processed</span><span>${new Date().toLocaleTimeString()}</span></div>`;
      progressContainer.appendChild(summary);
      break;
    }
    default:
      break;
  }
}

function handleStreamError(event) {
  console.error("Stream error", event);
  if (activeSource) {
    activeSource.close();
    activeSource = null;
  }
  setButtonsDisabled(false);
}

async function startDownload(mode) {
  const files = collectFiles(mode);
  if (!files.length) {
    clearProgress(`Add at least one ${mode} file to start the download.`);
    return;
  }

  if (activeSource) {
    activeSource.close();
    activeSource = null;
  }

  setButtonsDisabled(true);
  ensureJobSpace();

  const placeholder = document.createElement("p");
  placeholder.className = "empty-state";
  placeholder.textContent = `Preparing ${mode} files…`;
  progressContainer.appendChild(placeholder);

  const args = collectArgs();

  try {
    const response = await fetch("/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode, files, args }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ error: response.statusText }));
      clearProgress(`Download failed: ${errorPayload.error ?? "Unexpected error"}`);
      setButtonsDisabled(false);
      return;
    }

    const { job_id: jobId } = await response.json();
    if (!jobId) {
      clearProgress("Download failed: missing job identifier");
      setButtonsDisabled(false);
      return;
    }

    activeJob = jobId;
    ensureJobSpace();

    activeSource = new EventSource(`/download/stream/${jobId}`);
    activeSource.onmessage = handleStreamMessage;
    activeSource.onerror = handleStreamError;
  } catch (error) {
    console.error(error);
    clearProgress(`Download failed: ${(error && error.message) || "Network error"}`);
    setButtonsDisabled(false);
  }
}

triggerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    startDownload(button.dataset.trigger);
  });
});

clearProgress();
