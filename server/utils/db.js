import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dbHHHHHHH",
  password: "tong007",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error acquiring client", err.stack);
  });

export default pool;
