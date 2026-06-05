import { Injectable, OnModuleInit } from "@nestjs/common";
import sqlite3  from "sqlite3";
import { open, Database } from 'sqlite';

// injectable tells Nest that this class can be injected into other classes a.k.a dependency injection
// OnModuleInit is a Nest lifecycle hook
@Injectable()
export class DatabaseService implements OnModuleInit {
  private db!: Database;
  // called automatically when the app starts and the service is ready
  async onModuleInit() {
    // opens sqlite connection 
    this.db = await open({
      filename: './db.sqlite',
      driver: sqlite3.Database
    });
    // create required table/tables
    await this.createTables();
  }

  private async createTables() {
    await this.db!.exec(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        role TEXT
        )
      `
    )

    await this.db!.exec(
      `CREATE TABLE IF NOT EXISTS missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_type TEXT NOT NULL,
        mission_status TEXT NOT NULL DEFAULT 'Created'
        )
      `
    )

    await this.db.exec(
      `CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id INTEGER,
        job_title TEXT NOT NULL,
        job_status TEXT NOT NULL DEFAULT 'Backlog',
        tasks TEXT NOT NULL DEFAULT '[]',
        FOREIGN KEY (mission_id) REFERENCES missions(id)
        )
      `
    )
  }

  getDB() {
    return this.db;
  }
}