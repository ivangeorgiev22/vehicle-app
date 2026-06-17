import { Injectable } from "@nestjs/common";
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Job } from "../jobs/interfaces/job.interface";

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
              Data: `
                <body style= "background-color: #f0f2f5; padding: 20px; border-radius: 10px">
                  <div style="max-width: 500px; background-color: #ffffff; border-radius: 10px">
                    <div style="background-color: #a0a0a3; padding: 1px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                      <h2 style="color: #ffffff; margin-left: 10px;";>New Mission Created</h2>
                    </div>
                    <div style="padding: 15px;">
                      <table style="width: 60%;">
                        <tr>
                          <td style="padding: 6px; color: #888;">Type:</td>
                          <td style="padding: 6px; font-weight: bold;">${missionType}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px; color: #888;">Mission ID:</td>
                          <td style="padding: 6px; font-weight: bold;">${missionId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px; color: #888;">Jobs Created:</td>
                          <td style="padding: 6px; font-weight: bold;">${jobsCount}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px; color: #888;">Tasks Created:</td>
                          <td style="padding: 6px; font-weight: bold;">${tasksCount}</td>
                        </tr>
                      </table>
                      <p style="color: #454546;">
                        Please log in to the app to view and accept available jobs and tasks.
                      </p>
                    </div>
                  </div>
                </body>
              `
            }
          }
        }
      }));
    } catch (error) {
      console.log('Error sending email', error);
    }
  }
}