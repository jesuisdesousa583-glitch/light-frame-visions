// Mock API shim for cloned pages.
// The original project used a FastAPI/Mongo backend at REACT_APP_BACKEND_URL.
// In this Lovable Cloud port we don't have that backend yet, so we return
// safe empty responses to keep all pages rendering. Future: replace with
// Supabase queries / Edge Functions per feature.
import axios from "axios";

const noopAdapter = (config) => {
  const url = config.url || "";
  // Return shape expected by most pages
  let data = {};
  if (/\/auth\/(login|register)/.test(url)) {
    data = {
      token: "mock-token",
      user: { id: "mock", email: "demo@local", name: "Demo User", role: "admin" },
    };
  } else if (/list|all|\?|s$/i.test(url)) {
    data = [];
  }
  return Promise.resolve({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    request: {},
  });
};

export const API = "/mock-api";
export const api = axios.create({ baseURL: API, adapter: noopAdapter });
