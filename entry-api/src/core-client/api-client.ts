//communication with core api
import { Injectable } from "@nestjs/common";
import axios from "axios";

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
}