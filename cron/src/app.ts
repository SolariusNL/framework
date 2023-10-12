import { FwCronClient } from "./classes";
import giveawayJob from "./jobs/giveaways";
import clearEmailReceiptsJob from "./jobs/receipts";
import serverJob from "./jobs/servers";

const client = new FwCronClient()
  .register(giveawayJob, true)
  .register(clearEmailReceiptsJob, true)
  .register(serverJob, true);
client.start();
