import express from "express";
import morgan from "morgan";
import { join } from "path";
import { getServerConfig } from "./lib/config";
import { authenticatedBuckets } from "./lib/consts";

console.log("Starting media server...");

const config = getServerConfig();
const PORT: number = parseInt(config.port.toString(), 10);
const app = express();
const mediaPath = join(process.cwd(), "..", "data-storage");

const auth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const folder = req.path.split("/")[1];
  if (authenticatedBuckets.includes(String(folder))) {
    console.warn("Authenticated buckets not configured: ", folder);
    return res.sendStatus(400);
  }

  return express.static(mediaPath, { fallthrough: false })(req, res, next);
};

app.use(morgan("dev"));
app.use(auth);

const server = app.listen(PORT, async () => {
  console.log(`Media server started on port ${PORT}`);
});

export default server;
