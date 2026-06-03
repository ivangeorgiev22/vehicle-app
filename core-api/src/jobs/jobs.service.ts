import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { mission_templates } from "./job-templates";
import { UpdateJobStatus } from "./interfaces/UpdateJobStatus";
import { Task } from "./interfaces/job.interface";
import { Job } from "./interfaces/job.interface";


@Injectable()
export class JobsService {
  constructor (private dbService: DatabaseService) {}

  async createJob (mission_id: number, mission_type: string): Promise<void> {
    const db = this.dbService.getDB();
    const jobs = mission_templates[mission_type];

    for (const job of jobs) {
      await db.run(
        `INSERT INTO jobs (
          mission_id,
          job_title,
          tasks
          )
          VALUES (?,?,?)
        `,
        [mission_id, job.job_title, JSON.stringify(job.tasks)]
      )
    }
  }

  async updateJobStatus (id: number, req: UpdateJobStatus): Promise<Job | null | undefined> {
    const db = this.dbService.getDB();
    const job = await db.get(`SELECT * FROM jobs WHERE id = ?`, id);

    if (!job) {
      return null;
    }

    await db.run(
      `UPDATE jobs SET job_status = ? WHERE id = ?`,
      req.job_status,id
    );

    return db.get(`SELECT * FROM jobs WHERE id = ?`, id);
  }

  async updateTaskStatus(id: number, key: string, task_status: string): Promise<Job | null> {
    const db = this.dbService.getDB();
    const job = await db.get(`SELECT * FROM jobs WHERE id = ?`, id);

    if(!job) return null;

    //parsing tasks
    const tasks = JSON.parse(job.tasks);

    //finding the task we need by key
    const task = tasks.find((t: Task) => t.key === key);

    if(!task) return null;

    // updating task status
    task.task_status = task_status;

    //stringify tasks and save
    await db.run(
      `UPDATE jobs SET tasks = ? WHERE id = ?`,
      JSON.stringify(tasks),
      id
    );

    const updatedJob = await db.get(`SELECT * FROM jobs WHERE id = ?`, id);
    return {
      ...updatedJob,
      tasks: JSON.parse(updatedJob.tasks)
    }
  }

  async backlogJobs(): Promise<Job[]> {
    const db = this.dbService.getDB();
    const jobs = await db.all(`SELECT * FROM jobs WHERE job_status = 'Backlog'`);

    return jobs.map(job => ({
      ...job,
      tasks: JSON.parse(job.tasks)
    }));
  }

  async getJobById(id: number): Promise<Job | null> {
    const db = this.dbService.getDB();
    const job = await db.get(
      `SELECT * FROM jobs WHERE id = ?`, id
    )
    if (!job) return null;

    return {
      ...job,
      tasks: JSON.parse(job.tasks)
    }
  }
}

