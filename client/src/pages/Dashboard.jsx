// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { createJob, getJobs, getStats, updateJob, deleteJob } from "../api/jobsApi";
import StatsCards from "../components/StatsCards";
import JobForm from "../components/JobForm";
import JobTable from "../components/JobTable";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);

  const load = async () => {
    const [jobsRes, statsRes] = await Promise.all([getJobs(), getStats()]);
    setJobs(jobsRes);
    setStats(statsRes);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (job) => {
    await createJob(job);
    await load();
  };

  const handleUpdate = async (id, patch) => {
    await updateJob(id, patch);
    await load();
  };

  const handleDelete = async (id) => {
    await deleteJob(id);
    await load();
  };

  return (
    <div className="dashboard">
      <StatsCards stats={stats} />
      <JobForm onSubmit={handleCreate} />
      <JobTable jobs={jobs} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
};

export default Dashboard;
