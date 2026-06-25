import { Injectable } from "@nestjs/common";
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Job } from "../jobs/interfaces/job.interface";
import { emailTemplate } from "./email-template";

@Injectable()
export class EmailService {
  private ses = new SESClient();
  private senderEmail = process.env.SENDER_EMAIL!;

  async sendEmail(missionType: string, missionId: string, jobs: Job[]): Promise<void> {
    const jobsCount = jobs.length;
    const tasksCount = jobs.reduce((sum, job) => {
      const tasks = Array.isArray(job.tasks) ? job.tasks : JSON.parse(job.tasks);
      return sum + tasks.length;
    },0);
    try {
      await this.ses.send(new SendEmailCommand({
        Source: this.senderEmail,
        Destination: {
          ToAddresses: [this.senderEmail]
        },
        Message: {
          Subject: {
            Data: `New Mission: ${missionType}`
          },
          Body: {
            Html: {
              Data: emailTemplate(missionType, missionId, jobsCount, tasksCount)
            }
          }
        }
      }));
    } catch (error) {
      console.log('Error sending email', error);
    }
  }
}