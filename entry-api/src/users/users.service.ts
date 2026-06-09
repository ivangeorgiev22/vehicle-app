import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";

@Injectable()
export class UsersService {
  constructor( private coreApi: ApiClient) {}

  uploadImage(id: string, file: Express.Multer.File): Promise<{image_url: string}> {
    return this.coreApi.uploadImage(id,file);;
  }

  getImage(id: string): Promise<{image_url: string | null}> {
    return this.coreApi.getImage(id);
  }
}