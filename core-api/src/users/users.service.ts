import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { User, CreatedUser } from "./interfaces/user-interface";
import { DynamoDBService } from "../database/dynamodb.service";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

@Injectable()
export class UsersService {
  constructor(private dbService: DynamoDBService) {}

  //business logic for user registration
  async create(req: CreateUserDto): Promise<CreatedUser | undefined> {
    const db = this.dbService.getDb();
    const hashedPassword = await bcrypt.hash(req.password, 10);
    const id = randomUUID();

    await db.send(new PutCommand({
      TableName: this.dbService.getUsersTable(),
      Item: {
        id,
        username: req.firstName,
        password: hashedPassword,
        firstName: req.firstName,
        lastName: req.lastName,
        email: req.email,
        role: 'ADMIN'
      }
    }));
    return {id, username: req.username};
  }

  async validateUser (username: string, password: string): Promise<User | null> {
    const db = this.dbService.getDb();

    const res = await db.send(new QueryCommand({
      TableName: this.dbService.getUsersTable(),
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }));
    console.log('res', JSON.stringify(res));
    const user = res.Items?.[0]

    if (!user) {
      return null;
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return null;
    }
    const {password: _, ...userWithoutPassword} = user;

    return userWithoutPassword as User;
  }
}