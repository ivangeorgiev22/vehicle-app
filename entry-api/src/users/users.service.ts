import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";

@Injectable()
export class UsersService {
  constructor( private coreApi: ApiClient) {}

  uploadImage(id: string, file: Express.Multer.File): Promise<{imageUrl: string}> {
    return this.coreApi.uploadImage(id,file);;
  }

  getImage(id: string): Promise<{imageUrl: string | null}> {
    return this.coreApi.getImage(id);
  }
}