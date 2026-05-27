//communication with core api
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class ApiClient {
    // core api url
    private baseUrl = "http://localhost:3000";
    //send a request to core api to validate user
    async validateUser (username: string, password: string) {
        const res = await axios.post(`${this.baseUrl}/users/validate`, {username, password});
        return res.data;
    }
}