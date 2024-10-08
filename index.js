import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: process.env.password,
  port: 5432
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Functions
async function getTasks(){

  let items = [];

  try {
    let result = await db.query("select * from tasks order by id asc");
    items = result.rows;
  } catch (err) {
    console.error("Error executing sql query for tasks." + err.stack);
  }

  return items;
  
};

async function addTask(task){

  try {
    await db.query("insert into tasks(title) values($1);", [task]);
    console.log("Task - " + task + " - successfully added.");
  } catch (err) {
    console.error("Error executing sql insert for adding task." + err.stack);
  }

};

async function deleteTask(taskId) {

  try {
    await db.query("delete from tasks t where t.id = $1;", [taskId]);
    console.log("Task with id " + taskId + " successfully removed.");
  } catch (err) {
    console.error("Error executing sql delete for removing task." + err.stack);
  }

};

async function updateTask(taskId, taskTitle){

  try {
    await db.query("update tasks set title = $1 where id = $2;", [taskTitle ,taskId]);
    console.log("Task with id " + taskId + " successfully updated.");
  } catch (err) {
    console.error("Error executing sql update for updating task." + err.stack);
  }

};

// Route handlers
app.get("/", async (req, res) => {

  const tasks = await getTasks();
  console.log(tasks);

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: tasks,
  });

});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log("New item: "+item);
  await addTask(item);

  res.redirect("/");
});

app.post("/edit", (req, res) => {
  const itemToUpdate = req.body.updatedItemId;
  const updatedItem = req.body.updatedItemTitle;

  console.log("Updating item with id " + itemToUpdate + " with task: " + updatedItem);
  updateTask(itemToUpdate, updatedItem);

  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const itemToDelete = req.body.deleteItemId;
  console.log("User wants to delete item with id: " + itemToDelete);
  deleteTask(itemToDelete);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
