import { getCookie } from "../cookies";

async function sendFriendRequest(
  to: number,
  setLoading: (newValue: boolean) => void,
  setError: (newValue: string | null) => void,
): Promise<void> {
  setLoading(true);
  setError(null);
  await fetch(`/api/users/${to}/friend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${getCookie(".frameworksession")}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        setLoading(false);
      } else {
        setError(res.message || "Unknown error");
      }
    })
    .catch((err) => {
      setError(err.message || "Unknown error");
    })
    .finally(() => {
      setLoading(false);
    });
}

export {
  sendFriendRequest,
};