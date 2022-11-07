const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
//gitignor
require("dotenv").config();
const port = process.env.PORT || 5000;

// used Middleware
app.use(cors());
// backend to client data sent
app.use(express.json());

// Connact With MongoDb Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2vi6qur.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Create a async fucntion to all others activity
async function run() {
  try {
    await client.connect();
    const foodCollection = client.db("foodCollection").collection("food");

    app.get("/", async (req, res) => {
      const foods = await foodCollection.find({}).limit(3).toArray();
      res.send({
        success: true,
        data: foods,
      });
    });
    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find({}).toArray();
      res.send({
        success: true,
        data: foods,
      });
    });
    app.get("/foods/:id", async (req, res) => {
      const id= req.params.id;
      const findFood = await foodCollection.findOne({_id:ObjectId(id)});
      console.log(findFood);
      res.send({
        success: true,
        data: findFood,
      });
    });
  } catch (error) {
    console.log(error.name, error.message);
  }
}

// Call the fuction you decleare abobe
run().catch(console.dir);

// Root Api to cheack activity

app.listen(port, () => console.log(`Server up and running ${port}`));
