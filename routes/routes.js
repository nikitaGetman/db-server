const dbDriver = require("../db.js");

const router = app => {
  app.get("/", (request, response) => {
    dbDriver
      .fetchUsers()
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.log(error);
      });

    response.send({
      message: "Node.js and Express REST API"
    });
  });

  app.get("/create", (request, response) => {
    dbDriver
      .createUser("Niktia", "1234")
      .then(data => {
        console.log("User created: ", data);
      })
      .catch(error => {
        console.log("ERROR: ", error);
      });

    response.send("ok");
  });

  app.get("/login", (request, response) => {
    dbDriver
      .getUser("Niktia", "1234")
      .then(data => {
        console.log("User: ", data);
      })
      .catch(error => {
        console.log("ERROR: ", error);
      });

    response.send("ok");
  });
};

// Export the router
module.exports = router;
