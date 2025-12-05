// extension/contentScript.js

function extractLinkedIn() {
    const title = document.querySelector("h1")?.innerText || "";
    const company =
      document.querySelector(".topcard__org-name-link")?.innerText ||
      document.querySelector(".topcard__flavor")?.innerText ||
      "";
    const job_link = window.location.href;
    const description =
      document.querySelector(".show-more-less-html__markup")?.innerText || "";
    return { title, company, job_link, description };
  }
  
  function extractIndeed() {
    const title = document.querySelector("h1")?.innerText || "";
    const company =
      document.querySelector("[data-testid='company-name']")?.innerText ||
      document.querySelector(".jobsearch-CompanyInfoWithoutHeaderImage div")?.innerText ||
      "";
    const job_link = window.location.href;
    const description =
      document.querySelector("[data-testid='jobDescriptionText']")?.innerText || "";
    return { title, company, job_link, description };
  }
  
  // fallbacks for other sites
  function extractGeneric() {
    const title = document.querySelector("h1")?.innerText || document.title;
    const company = "";
    const job_link = window.location.href;
    const description = document.body.innerText.slice(0, 2000);
    return { title, company, job_link, description };
  }
  
  function extractJob() {
    const host = window.location.host;
    if (host.includes("linkedin.com")) return extractLinkedIn();
    if (host.includes("indeed.com")) return extractIndeed();
    // TODO: add ziprecruiter, glassdoor selectors similarly
    return extractGeneric();
  }
  
  // Listen for message from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "EXTRACT_JOB") {
      const job = extractJob();
      sendResponse(job);
    }
  });
  