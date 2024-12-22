const express = require("express");
const mysql = require("mysql");

const app = express();

const PORT = 3000;

const connectionConfig = {
  host: "db",
  database: "db",
  user: "root",
  password: "root",
};

app.use(express.json());

function execute(sql, values) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(connectionConfig);

    connection.query(sql, values, (err, results) => {
      connection.end();

      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

app.get("/", async (_req, res) => {
  const title = "<h1>Full Cycle rocks!</h1>";

  const query = "select * from people";
  const people = await execute(query);

  const names = people.map((person) => `<li>${person.name}</li>`);

  const list = `<ul>${names.join("")}</ul>`;

  const content = `${title}${list}`;

  res.send(content);
});

app.post("/people", async (req, res) => {
  const name = req.body.name || "Luiz";

  const query = "insert into people (name) values (?)";

  try {
    await execute(query, [name]);
    res.status(201).send("Pessoa criada com sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro ao criar a pessoa!");
  }
});

app.listen(PORT, () => {
  console.info(`Server running at port ${PORT}...`);
});
