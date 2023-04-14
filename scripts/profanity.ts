import { isRestricted } from "../src/data/reconsiderWords";

console.log(isRestricted(process.argv.slice(2).join(" ")));
