import { NextApiRequest, NextApiResponse } from "next";

const rateLimits = new Map();

function rateLimitedResource(
  req: NextApiRequest,
  res: NextApiResponse,
  maxRequestsPerMinute: number = 750
) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const now = new Date();
  const time = now.getTime();

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, {
      requests: 0,
      last_request: time,
    });
  }

  const data = rateLimits.get(ip);

  if (time - data.last_request > 60000) {
    data.requests = 0;
    data.last_request = time;
  }

  if (data.requests > maxRequestsPerMinute) {
    res.status(429).json({
      error: "Too many requests",
      success: false,
      userFacing: {
        message:
          "You have made too many requests to the server, please try again later. Refresh the page in a few minutes.",
      },
      rate_limit: {
        remaining: 0,
        reset: time + 60000,
      },
    });
    return 0;
  }

  data.requests++;
  rateLimits.set(ip, data);

  setTimeout(() => {
    data.requests--;
  }, 60000);
}

export default rateLimitedResource;
