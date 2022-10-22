import { deleteCookie, getCookie } from "cookies-next";

async function logout(token?: string, dontDeleteToken?: boolean) {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: String(token || getCookie(".frameworksession")),
    },
  })
    .then(() => {
      if (!dontDeleteToken) {
        deleteCookie(".frameworksession");
      }
    })
    .catch(() => {
      alert("An error occurred.");
    });
}

export default logout;
