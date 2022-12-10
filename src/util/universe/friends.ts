import { getCookie } from "cookies-next";
import { NonUser } from "../prisma-types";

const apiUrl = "/api/users";
const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

async function fetchData(url: string): Promise<any> {
  const response = await fetch(url, { headers });
  const data = await response.json();
  if (data.success) {
    return data;
  } else {
    throw new Error("Failed to fetch data");
  }
}

async function getMyFriends(page: number = 1): Promise<NonUser[]> {
  const data = await fetchData(`${apiUrl}/@me/friends/${page}`);
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
  getMyFriends,
  getFollowing,
  getFollowers,
  getFriendsPages,
  getFollowingPages,
  getFollowersPages,
};
