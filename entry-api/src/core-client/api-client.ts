//communication with core api
import { Injectable } from "@nestjs/common";
import axios from "axios";
import FormData from "form-data";
import { Mission, MissionWithJobs } from "../missions/interfaces/missions-interface";
import { Job } from "../jobs/interfaces/job-interface";
import { User } from "../auth/interfaces/auth-interface";

@Injectable()
export class ApiClient {
  private baseUrl = process.env.BASE_URL;

  async validateUser (username: string, password: string): Promise<User> {
    const res = await axios.post(`${this.baseUrl}/api/users/validate`, {username, password});
    return res.data;
  }

  async createMission(mission_type: string): Promise<Mission> {
    const res = await axios.post(`${this.baseUrl}/api/missions`, {mission_type});
    return res.data;
  }

  async getMission(id: string): Promise<MissionWithJobs> {
    const res = await axios.get(`${this.baseUrl}/api/missions/${id}`);
    return res.data;
  }

  async updateMissionStatus(id: string, mission_status: string): Promise<Mission | null> {
    const res = await axios.patch(`${this.baseUrl}/api/missions/${id}/status`, {mission_status});
    return res.data;
  }

  async updateJobStatus(id: string, job_status: string): Promise<Job | null> {
    const res = await axios.patch(`${this.baseUrl}/api/jobs/${id}/status`, {job_status});
    return res.data;
  }

  async updateTaskStatus(id: string, key: string, task_status: string): Promise<Job | null> {
    const res = await axios.patch(`${this.baseUrl}/api/jobs/${id}/task/${key}/status`, {task_status});
    return res.data;
  }

  async getBacklogJobs(): Promise<Job[]> {
    const res = await axios.get(`${this.baseUrl}/api/jobs`);
    return res.data;
  }

  async getJobById(id: string): Promise<Job | null> {
    const res = await axios.get(`${this.baseUrl}/api/jobs/${id}`);
    return res.data;
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<{image_url: string}> {
    const formData = new FormData(); //create a new formData instance
    
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    })
    const res = await axios.post(`${this.baseUrl}/api/users/${id}/image`, formData, {
      headers: { ...formData.getHeaders()}
    });
    return res.data;
  }

  async getImage (id: string): Promise<{image_url: string | null}> {
    const res = await axios.get(`${this.baseUrl}/api/users/${id}/image`);
    return res.data;
  }
}