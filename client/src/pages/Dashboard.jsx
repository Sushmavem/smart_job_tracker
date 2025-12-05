// client/src/pages/Dashboard.jsx
/**
 * Main dashboard component
 * Displays stats, job cards, and handles different views
 */
import { useEffect, useState, useCallback } from "react";
import { createJob, getJobs, getStats, updateJob, deleteJob } from "../api/jobsApi";
import StatsCards from "../components/StatsCards";
import JobCard from "../components/JobCard";
import JobModal from "../components/JobModal";
import JobDetailModal from "../components/JobDetailModal";
import Calendar from "../components/Calendar";

// Icons
const Icons = {
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="80" height="80">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
};

const Dashboard = ({ currentView, onNavigate }) => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  // Load data from API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([getJobs(), getStats()]);
      setJobs(jobsRes);
      setStats(statsRes);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open add modal when navigating to "add" view
  useEffect(() => {
    if (currentView === "add") {
      setShowAddModal(true);
    }
  }, [currentView]);

  // Handle creating a new job
  const handleCreate = async (jobData) => {
    try {
      await createJob(jobData);
      await loadData();
      setShowAddModal(false);
      onNavigate("dashboard");
    } catch (error) {
      console.error("Failed to create job:", error);
      throw error;
    }
  };

  // Handle updating a job
  const handleUpdate = async (id, patch) => {
    try {
      await updateJob(id, patch);
      await loadData();
      if (selectedJob?.id === id) {
        setSelectedJob((prev) => ({ ...prev, ...patch }));
      }
    } catch (error) {
      console.error("Failed to update job:", error);
    }
  };

  // Handle deleting a job
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }
    try {
      await deleteJob(id);
      await loadData();
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesPlatform = !platformFilter || job.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Get page title based on current view
  const getPageTitle = () => {
    switch (currentView) {
      case "stats":
        return "Statistics";
      case "calendar":
        return "Interview Calendar";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  // Render settings view
  if (currentView === "settings") {
    return (
      <>
        <header className="main-header">
          <div className="header-left">
            <h1 className="header-title">Settings</h1>
          </div>
        </header>
        <div className="page-content">
          <div className="card">
            <h3>Account Settings</h3>
            <p className="text-muted" style={{ marginTop: "1rem" }}>
              Settings page coming soon. Here you'll be able to manage your account,
              notification preferences, and more.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Render stats view
  if (currentView === "stats") {
    return (
      <>
        <header className="main-header">
          <div className="header-left">
            <h1 className="header-title">Statistics</h1>
          </div>
        </header>
        <div className="page-content">
          <StatsCards stats={stats} detailed />
        </div>
      </>
    );
  }

  // Render calendar view
  if (currentView === "calendar") {
    return (
      <>
        <header className="main-header">
          <div className="header-left">
            <h1 className="header-title">Interview Calendar</h1>
          </div>
        </header>
        <div className="page-content">
          <Calendar
            onJobClick={(jobId) => {
              const job = jobs.find((j) => j.id === jobId);
              if (job) setSelectedJob(job);
            }}
          />
        </div>
        {/* Job Detail Modal for calendar clicks */}
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </>
    );
  }

  // Main dashboard view
  return (
    <>
      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <h1 className="header-title">{getPageTitle()}</h1>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Icons.Plus />
            <span>Add Application</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="page-content">
        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input">
            <Icons.Search />
            <input
              type="text"
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="filter-select"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="Glassdoor">Glassdoor</option>
            <option value="Company">Company Website</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Jobs Grid or Empty State */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => setSelectedJob(job)}
                onStatusChange={(status) => handleUpdate(job.id, { status })}
                onDelete={() => handleDelete(job.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icons.Briefcase />
            <h3>No applications yet</h3>
            <p>
              {searchQuery || statusFilter || platformFilter
                ? "No applications match your filters. Try adjusting your search criteria."
                : "Start tracking your job search by adding your first application."}
            </p>
            {!searchQuery && !statusFilter && !platformFilter && (
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Icons.Plus />
                <span>Add Your First Application</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <JobModal
          onClose={() => {
            setShowAddModal(false);
            onNavigate("dashboard");
          }}
          onSubmit={handleCreate}
        />
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default Dashboard;
