import { Sequelize } from "sequelize";

// SQLite3
import sqlite3, { Database } from "sqlite3";

// https://sequelize.org/docs/v6/other-topics/dialect-specific-things/

export class DatabaseContextManager {

  private static instance: DatabaseContextManager | undefined;

  private dialect: string;
  private database: string;
  private databasePath: string;
  private username: string;
  private password: string;

  private sequelizeCtx: Sequelize | undefined;

  private contextCreated: boolean;

  private constructor() {
    this.dialect = "undefined";
    this.database = "undefined";
    this.databasePath = "undefined";
    this.username = "undefined";
    this.password = "undefined";

    this.contextCreated = false;
  };

  public static getInstance(): DatabaseContextManager {

    if (DatabaseContextManager.instance == undefined) {
      DatabaseContextManager.instance = new DatabaseContextManager();
    };

    return DatabaseContextManager.instance;
  };

  public configureDialect(dialect: string): DatabaseContextManager {
    this.dialect = dialect;
    return this;
  };

  public setDatabaseHandle(database: string): DatabaseContextManager {
    this.database = database;
    return this;
  };

  public setDatabasePath(databasePath: string): DatabaseContextManager {

    if (this.dialect != "sqlite") console.log(`Warning: Database path is not an applicable configuration for dialect: ${this.dialect}`);

    this.databasePath = databasePath;
    return this;
  };
  
  public configureAuthentication(username: string, password: string) {

    this.username = username;
    this.password = password;

    return this;
  };

  public createCtx(): Sequelize {

    if (this.contextCreated) throw (new Error(`Context already created for ${this.database} database`));

    this.configureDatabase();

    this.sequelizeCtx = new Sequelize(
      this.database, 
      this.username,
      this.password,
      this.configureOptions()
    );

    this.contextCreated = true;
    return this.sequelizeCtx!;
  };

  private configureOptions(): Object {
    
    let options = {};

    switch (this.dialect) {

      case "sqlite": {

        options = {
          dialect: 'sqlite',
          storage: this.databasePath,
          dialectOptions: {
            mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, //| sqlite3.OPEN_FULLMUTEX,
          },
        };

        break;
      };

    };

    return options;
  };

  private configureDatabase(): void {
    
    let db = new sqlite3.Database(this.databasePath);

    switch (this.dialect) {

      case "sqlite": {

        const fs = require('fs');

        try {
          fs.mkdirSync(`${process.cwd()}/data`);
        } catch (error) {};

        let files = fs.readdirSync(`${process.cwd()}/data`);

        let fileExits = false;
        for (let index of files) {
          if (index == `${this.database}.db`) fileExits = true;
        };

        if (!fileExits) {

          console.log(`Creating sqlite database file: ${process.cwd()}\\data\\${this.database}.db`);

          let db: Database | null;
  
          db = new sqlite3.Database(this.databasePath);
          db = null;
        };

        break;
      }; 
    };

  };


};