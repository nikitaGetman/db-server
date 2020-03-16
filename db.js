const pgp = require("pg-promise")(/* initialization options */);

const cn = {
  host: "localhost", // server name or IP address;
  port: 5432,
  database: "Test",
  user: "admin",
  password: "1235"
};

const db = pgp(cn); // database instance;

const dbDriver = {
  createUser(username, password) {
    return db.none("INSERT INTO users(username, password) VALUES($1,$2)", [
      username,
      password
    ]);
  },
  getUser(username, password) {
    return db.one("SELECT * FROM users WHERE username = $1 and password = $2", [
      username,
      password
    ]);
  }
};

module.exports = dbDriver;
