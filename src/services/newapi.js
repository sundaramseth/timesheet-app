const BASE_URL = "/api/gas";

export const newapi = {
  getEmployees: async () => {
    const res = await fetch(`${BASE_URL}?action=getEmployees`);
    return res.json();
  },

  addEmployee: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ action: "addEmployee", ...data }),
    });
    return res.json();
  },

  createTimesheet: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ action: "createTimesheet", ...data }),
    });
    return res.json();
  },

  getTimesheets: async () => {
    const res = await fetch(`${BASE_URL}?action=getTimesheets`);
    return res.json();
  },

  sendPaystubEmail: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ action: "sendPaystubEmail", ...data }),
    });
    return res.json();
  }
};