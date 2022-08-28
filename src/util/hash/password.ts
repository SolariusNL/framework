import { hashSync, compareSync } from "bcrypt";

async function hashPass(password: string) {
  return await hashSync(password, 10);
}

async function isSamePass(password: string, hash: string) {
  return await compareSync(password, hash);
}

export { hashPass, isSamePass };
