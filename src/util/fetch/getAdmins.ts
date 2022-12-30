import { getCookie } from "cookies-next";

async function getAdmins() {
  const res = await fetch("/api/admin/admins", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: String(getCookie(".frameworksession")),
    },
  });
  const data = await res.json();
  return data;
}

export default getAdmins;
