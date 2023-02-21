import {Sequelize} from "sequelize";
import {DatabaseContextManager} from "./databaseContextManager";

import * as config from "../config.json";

export class SequelizeInterface {

  private static instance: SequelizeInterface | undefined;

  private databaseContextManager: DatabaseContextManager;
  private database: Sequelize | undefined;

  private constructor() {
    this.databaseContextManager = DatabaseContextManager.getInstance();
  };

  public static getInstance(): SequelizeInterface {

    if (SequelizeInterface.instance == undefined) {
      SequelizeInterface.instance = new SequelizeInterface();
    };

    return SequelizeInterface.instance;
  };

  public initializeDatabaseContext(): Sequelize {
    
    this.databaseContextManager
      .configureDialect(config.database.dialect)
      .setDatabaseHandle(config.database.authentication.db_name)
      .setDatabasePath(`${process.cwd()}/data/${config.database.authentication.db_name}.db`)
      .configureAuthentication(
        config.database.authentication.db_username,
        config.database.authentication.db_password
      );

    this.database = this.databaseContextManager.createCtx();
    
    return this.database;
  };

  public getContext(): Sequelize {
    return this.database!;
  };
};