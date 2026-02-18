export function logout() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.replace("/login");
}
