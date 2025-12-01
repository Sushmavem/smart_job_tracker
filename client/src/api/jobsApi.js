// client/src/api/jobsApi.js
import axiosClient from "./axiosClient";

export const createJob = async (job) => {
  const res = await axiosClient.post("/jobs/", job);
  return res.data;
};

export const getJobs = async (params = {}) => {
  const res = await axiosClient.get("/jobs/", { params });
  return res.data;
};

export const getStats = async () => {
  const res = await axiosClient.get("/jobs/stats");
  return res.data;
};

export const updateJob = async (id, job) => {
  const res = await axiosClient.put(`/jobs/${id}`, job);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await axiosClient.delete(`/jobs/${id}`);
  return res.data;
};
