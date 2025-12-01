// extension/popup.js

const API_BASE = "http://localhost:8000";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const authStatus = document.getElementById("auth-status");
const authSection = document.getElementById("auth-section");

const saveSection = document.getElementById("save-section");
const saveJobBtn = document.getElementById("save-job-btn");
const saveStatus = document.getElementById("save-status");
const jobPreview = document.getElementById("job-preview");

function setLoggedInUI() {
  authSection.style.display = "none";
  saveSection.style.display = "block";
}

function setLoggedOutUI() {
  authSection.style.display = "block";
  saveSection.style.display = "none";
}

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["access_token"], (result) => {
      resolve(result.access_token || null);
    });
  });
}

async function setToken(token) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ access_token: token }, () => resolve());
  });
}

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return;

  authStatus.textContent = "Logging in...";
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      authStatus.textContent = "Login failed";
      return;
    }
    const data = await res.json();
    await setToken(data.access_token);
    authStatus.textContent = "Logged in!";
    setLoggedInUI();
  } catch (e) {
    authStatus.textContent = "Error logging in";
  }
});

saveJobBtn.addEventListener("click", async () => {
  saveStatus.textContent = "Capturing...";
  const token = await getToken();
  if (!token) {
    saveStatus.textContent = "Not logged in";
    return;
  }

  // Ask content script to extract job details
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" }, async (response) => {
      if (!response) {
        saveStatus.textContent = "Could not read page";
        return;
      }
      const jobPayload = {
        company: response.company || "Unknown",
        role: response.title || "Unknown role",
        job_link: response.job_link,
        status: "applied",
        platform: "LinkedIn", // could detect from host
        notes: "",
        source: "extension",
      };

      jobPreview.textContent = `${jobPayload.company} – ${jobPayload.role}`;

      try {
        const res = await fetch(`${API_BASE}/jobs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobPayload),
        });
        if (!res.ok) {
          saveStatus.textContent = "API error";
          return;
        }
        saveStatus.textContent = "Saved!";
      } catch (e) {
        saveStatus.textContent = "Network error";
      }
    });
  });
});

// On load, check if already logged in
getToken().then((token) => {
  if (token) {
    setLoggedInUI();
  } else {
    setLoggedOutUI();
  }
});
