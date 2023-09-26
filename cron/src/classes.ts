import cron from "node-cron";
import logMsg from "./log";

class FwCronJob {
  public task: () => Promise<void>;
  public id: string;
  private schedule: string;

  constructor(schedule: string, id: string, task: () => Promise<void>) {
    this.schedule = schedule;
    this.task = task;
    this.id = id;
    this.init();
  }

  private init() {
    cron.schedule(this.schedule, this.execute.bind(this));
  }

  private async execute() {
    try {
      await this.task();
      logMsg("info", `Task ${this.id} completed successfully.`);
    } catch (error) {
      logMsg("error", `Error in task ${this.id}: ${error}`);
    }
  }
}

class FwCronClient {
  private jobs: FwCronJob[] = [];

  register(job: FwCronJob, runOnStart?: boolean) {
    if (runOnStart) {
      job.task();
      logMsg("info", `Ran job ${job.id} on start`);
    }
    this.jobs.push(job);
    return this;
  }

  start() {
    this.jobs.forEach((job, index) => {
      logMsg("info", `Registered cron job ${job.id} (#${index + 1})`);
    });
  }
}

export { FwCronClient, FwCronJob };
