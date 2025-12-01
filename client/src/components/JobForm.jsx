// client/src/components/JobForm.jsx
import React, { useState } from "react";

const JobForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    company: "",
    role: "",
    job_link: "",
    status: "applied",
    platform: "LinkedIn",
    notes: "",
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      company: "",
      role: "",
      job_link: "",
      status: "applied",
      platform: "LinkedIn",
      notes: "",
    });
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>Add Application</h3>
      <div className="form-row">
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
          required
        />
      </div>
      <input
        name="job_link"
        placeholder="Job link"
        value={form.job_link}
        onChange={handleChange}
        required
      />
      <div className="form-row">
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
        <select name="platform" value={form.platform} onChange={handleChange}>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Indeed">Indeed</option>
          <option value="Glassdoor">Glassdoor</option>
          <option value="Company">Company website</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <textarea
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default JobForm;
