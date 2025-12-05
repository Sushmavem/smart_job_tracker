// extension/popup.js
/**
 * Job Tracker Chrome Extension Popup
 * Handles login and job saving from job posting pages
 */

const API_BASE = "http://localhost:8001";

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const authStatus = document.getElementById("auth-status");
const authSection = document.getElementById("auth-section");
const saveSection = document.getElementById("save-section");
const saveJobBtn = document.getElementById("save-job-btn");
const saveStatus = document.getElementById("save-status");
const jobPreview = document.getElementById("job-preview");
const userEmail = document.getElementById("user-email");

/**
 * Detect the job platform from URL
 */
function detectPlatform(url) {
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("indeed.com")) return "Indeed";
  if (url.includes("glassdoor.com")) return "Glassdoor";
  if (url.includes("ziprecruiter.com")) return "Other";
  return "Company";
}

/**
 * Show logged-in UI state
 */
function setLoggedInUI(email = "") {
  authSection.style.display = "none";
  saveSection.style.display = "block";
  if (userEmail && email) {
    userEmail.textContent = email;
  }
}

/**
 * Show logged-out UI state
 */
function setLoggedOutUI() {
  authSection.style.display = "block";
  saveSection.style.display = "none";
  authStatus.textContent = "";
}

/**
 * Get stored auth token
 */
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["access_token", "user_email"], (result) => {
      resolve({
        token: result.access_token || null,
        email: result.user_email || ""
      });
    });
  });
}

/**
 * Store auth token
 */
async function setToken(token, email = "") {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ access_token: token, user_email: email }, () => resolve());
  });
}

/**
 * Clear stored auth token
 */
async function clearToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(["access_token", "user_email"], () => resolve());
  });
}

// Login button handler
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authStatus.textContent = "Please enter email and password";
    authStatus.className = "status-error";
    return;
  }

  authStatus.textContent = "Logging in...";
  authStatus.className = "status-info";

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      authStatus.textContent = errorData.detail || "Login failed";
      authStatus.className = "status-error";
      return;
    }

    const data = await res.json();
    await setToken(data.access_token, email);
    authStatus.textContent = "Logged in!";
    authStatus.className = "status-success";
    setLoggedInUI(email);

  } catch (e) {
    authStatus.textContent = "Network error - is the server running?";
    authStatus.className = "status-error";
  }
});

// Logout button handler
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await clearToken();
    setLoggedOutUI();
    emailInput.value = "";
    passwordInput.value = "";
  });
}

// Save job button handler
saveJobBtn.addEventListener("click", async () => {
  saveStatus.textContent = "Capturing job data...";
  saveStatus.className = "status-info";

  const { token } = await getToken();

  if (!token) {
    saveStatus.textContent = "Please login first";
    saveStatus.className = "status-error";
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    // Check if we're on a supported site
    const platform = detectPlatform(tab.url);

    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        saveStatus.textContent = "Could not extract job data from this page";
        saveStatus.className = "status-error";
        return;
      }

      const jobPayload = {
        company: response.company?.trim() || "Unknown Company",
        role: response.title?.trim() || "Unknown Role",
        job_link: response.job_link || tab.url,
        status: "applied",
        platform: platform,
        notes: response.description ? `Auto-captured: ${response.description.slice(0, 200)}...` : "",
        source: "extension",
      };

      jobPreview.innerHTML = `
        <strong>${jobPayload.company}</strong><br>
        <span>${jobPayload.role}</span>
      `;

      try {
        // Note: Use /jobs/ with trailing slash to match FastAPI route
        const res = await fetch(`${API_BASE}/jobs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobPayload),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          saveStatus.textContent = errorData.detail || "Failed to save job";
          saveStatus.className = "status-error";
          return;
        }

        saveStatus.textContent = "Job saved successfully!";
        saveStatus.className = "status-success";

        // Show success animation
        saveJobBtn.classList.add("success");
        setTimeout(() => saveJobBtn.classList.remove("success"), 1500);

      } catch (e) {
        saveStatus.textContent = "Network error - check server connection";
        saveStatus.className = "status-error";
      }
    });
  });
});

// Initialize UI on popup open
getToken().then(({ token, email }) => {
  if (token) {
    setLoggedInUI(email);
  } else {
    setLoggedOutUI();
  }
});
