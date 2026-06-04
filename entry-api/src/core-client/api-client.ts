//communication with core api
import { Injectable } from "@nestjs/common";
import axios from "axios";
import FormData from "form-data";

@Injectable()
export class ApiClient {
  // core api url
  private baseUrl = process.env.BASE_URL;
  //send a request to core api to validate user
  async validateUser (username: string, password: string) {
    const res = await axios.post(`${this.baseUrl}/users/validate`, {username, password});
    return res.data;
  }

  async createMission(mission_type: string) {
    const res = await axios.post(`${this.baseUrl}/missions`, {mission_type});
    return res.data;
  }

  async getMission(id: number) {
    const res = await axios.get(`${this.baseUrl}/missions/${id}`);
    return res.data;
  }

  async updateMissionStatus(id: number, mission_status: string) {
    const res = await axios.patch(`${this.baseUrl}/missions/${id}/status`, {mission_status});
    return res.data;
  }

  async updateJobStatus(id: number, job_status: string) {
    const res = await axios.patch(`${this.baseUrl}/jobs/${id}/status`, {job_status});
    return res.data;
  }

  async updateTaskStatus(id: number, key: string, task_status: string) {
    const res = await axios.patch(`${this.baseUrl}/jobs/${id}/task/${key}/status`, {task_status});
    return res.data;
  }

  async getBacklogJobs() {
    const res = await axios.get(`${this.baseUrl}/jobs`);
    return res.data;
  }

  async getJobById(id: number) {
    const res = await axios.get(`${this.baseUrl}/jobs/${id}`);
    return res.data;
  }

  async uploadImage(id: number, file: Express.Multer.File): Promise<{image_url: string}> {
    const formData = new FormData(); //create a new formData instance
    
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    })
    const res = await axios.post(`${this.baseUrl}/users/${id}/image`, formData, {
      headers: { ...formData.getHeaders()}
    });
    return res.data;
  }

  async getImage (id: number): Promise<{image_url: string | null}> {
    const res = await axios.get(`${this.baseUrl}/users/${id}/image`);
    return res.data;
  }
}