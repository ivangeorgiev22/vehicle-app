import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { User, CreatedUser } from "./interfaces/user-interface";

@Injectable()
export class UsersService {
  constructor(private dbService: DatabaseService) {}

  //business logic for user registration
  async create(dto: CreateUserDto): Promise<CreatedUser | undefined> {
    const db = this.dbService.getDB();
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const res = await db.run(
      `INSERT INTO users (
        username,
        password,
        firstName,
        lastName,
        email,
        role
      )
      VALUES (?,?,?,?,?,?)
      `,
      dto.username,
      hashedPassword,
      dto.firstName,
      dto.lastName,
      dto.email,
      'ADMIN'
    );

    return {
      //sqlite returns id of inserted row and the username
      id: res.lastID!,
      username: dto.username
    };
  }
  //business logic for when an existing user logs in
  async validateUser (username: string, password: string): Promise<User | null> {
    const db = this.dbService.getDB();

    const user = await db.get(`SELECT * FROM users WHERE username = ?`, username);
    // if user doesn't exist fail
    if (!user) {
      return null;
    }
    // checks entered password with the hashed one stored in the DB for that user
    const matchPassword = await bcrypt.compare(password, user.password);
    // if it's not a match fail
    if (!matchPassword) {
      return null;
    }
    // don't return hashed password to the client.
    user.password = undefined;

    return user;
  }
}