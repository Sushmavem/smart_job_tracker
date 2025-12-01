// client/src/components/JobTable.jsx
import React from "react";

const JobTable = ({ jobs, onUpdate, onDelete }) => {
  return (
    <div className="card">
      <h3>Applications</h3>
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
            <th>Platform</th>
            <th>Source</th>
            <th>Link</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{new Date(job.created_at).toLocaleDateString()}</td>
              <td>{job.company}</td>
              <td>{job.role}</td>
              <td>
                <select
                  value={job.status}
                  onChange={(e) => onUpdate(job.id, { status: e.target.value })}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
              </td>
              <td>{job.platform}</td>
              <td>{job.source}</td>
              <td>
                <a href={job.job_link} target="_blank" rel="noreferrer">
                  Open
                </a>
              </td>
              <td>
                <button onClick={() => onDelete(job.id)}>🗑</button>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan={8}>No applications yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobTable;
