// client/src/api/authApi.js
import axiosClient from "./axiosClient";

export const register = async (email, password) => {
  const res = await axiosClient.post("/auth/register", { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", { email, password });
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axiosClient.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await axiosClient.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return res.data;
};
