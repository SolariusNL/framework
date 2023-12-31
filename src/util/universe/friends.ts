import { NonUser } from "@/util/prisma-types";
import { getCookie } from "cookies-next";

const apiUrl = "/api/users";

async function fetchData(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      Authorization: String(getCookie(".frameworksession")),
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (data.success) {
    return data;
  } else {
    throw new Error("Failed to fetch data");
  }
}

async function getMyFriends(
  page: number = 1,
  search?: string
): Promise<NonUser[]> {
  const data = await fetchData(
    `${apiUrl}/@me/friends/${page}?${new URLSearchParams({
      search: search ?? "",
    }).toString()}`
  );
  return data.friends;
}

async function getFollowing(uid: number, page: number = 1): Promise<NonUser[]> {
  const data = await fetchData(`${apiUrl}/${uid}/following/${page}`);
  return data.following;
}

async function getFollowers(uid: number, page: number = 1): Promise<NonUser[]> {
  const data = await fetchData(`${apiUrl}/${uid}/followers/${page}`);
  return data.followers;
}

async function getFriendsPages(): Promise<number> {
  const data = await fetchData(`${apiUrl}/@me/pages/friends`);
  return data.pages;
}

async function getFollowingPages(uid: number): Promise<number> {
  const data = await fetchData(`${apiUrl}/${uid}/pages/following`);
  return data.pages;
}

async function getFollowersPages(uid: number): Promise<number> {
  const data = await fetchData(`${apiUrl}/${uid}/pages/followers`);
  return data.pages;
}

export {
  getFollowers,
  getFollowersPages,
  getFollowing,
  getFollowingPages,
  getFriendsPages,
  getMyFriends,
};
