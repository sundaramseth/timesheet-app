const API_URL = "/api/gas";

export const api = {
  async request(action, data = {}) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        ...data
      })
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", e);
      return { error: "Invalid JSON" };
    }
  },

  loginUser(data){
    return this.request("loginUser",data);
  },

  getEmployees() {
    return this.request("getEmployees");
  },

  getTimesheets() {
    return this.request("getTimesheets");
  },

  addEmployee(data) {
    return this.request("addEmployee", data);
  },

  deleteEmployee(id) {
    return this.request("deleteEmployee", { id });
  },

  updateEmployee(data) {
    return this.request("updateEmployee", data);
  },

  createTimesheet(data) {
    return this.request("createTimesheet", data);
  },

  downloadPaystub(data) {
    return this.request("downloadPaystub", data);
  },

  previewPaystub(data) {
    return this.request("previewPaystub", data);
  },

  sendPaystubEmail(data) {
    return this.request("sendPaystubEmail", data);
  },

  clockIn(data) {
  return this.request("clockIn", data);
},

clockOut(data) {
  return this.request("clockOut", data);
},

getEmployeeTimesheet(data) {
  return this.request("getEmployeeTimesheet", data);
}
};