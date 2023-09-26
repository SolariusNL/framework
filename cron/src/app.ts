import { FwCronClient } from "./classes";
import giveawayJob from "./jobs/giveaways";
import serverJob from "./jobs/servers";

const client = new FwCronClient()
  .register(giveawayJob, true)
  .register(serverJob, true);
client.start();
