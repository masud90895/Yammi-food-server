const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
//git Ignore
require("dotenv").config();
const port = process.env.PORT || 5000;

// used Middleware
app.use(cors());
const jwt = require("jsonwebtoken");
// backend to client data sent
app.use(express.json());

// Connect With MongoDb Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2vi6qur.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// JWT token start
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// Create a async function to all others activity
async function run() {
  try {
    const foodCollection = client.db("foodCollection").collection("food");
    const reviewCollection = client.db("foodCollection").collection("review");

    app.get("/", async (req, res) => {
      const foods = await foodCollection
        .find({})
        .sort({ _id: -1 })
        .limit(3)
        .toArray();
      res.send({
        success: true,
        data: foods,
      });
    });
    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find({}).sort({ _id: -1 }).toArray();
      res.send({
        success: true,
        data: foods,
      });
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const findFood = await foodCollection.findOne({ _id: ObjectId(id) });
      res.send({
        success: true,
        data: findFood,
      });
    });

    app.post("/review", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      if (result.insertedId) {
        res.send({
          success: true,
          data: result,
        });
      }
    });

    app.get("/review", async (req, res) => {
      const query = req.query.name;
      const review = await reviewCollection
        .find({ category: query })
        .sort({ time: -1 })
        .toArray();
      res.send({
        success: true,
        data: review,
      });
    });

    app.get("/myReview", verifyJWT, async (req, res) => {
      const query = req?.query?.email;
      const review = await reviewCollection.find({ email: query }).toArray();
      res.send({
        success: true,
        data: review,
      });
    });
    //  handle delete
    app.delete("/review:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({ _id: ObjectId(id) });
      if (result.deletedCount) {
        res.send({
          success: true,
          data: result,
        });
      }
    });

    app.post("/services", async (req, res) => {
      const result = await foodCollection.insertOne(req.body);
      console.log(result);
      if (result.insertedId) {
        res.send({
          success: true,
          message: `successfully created the ${req.body.name} with id ${result.insertedId}}`,
        });
      }
    });

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: "1d" });
      res.send({ token });
    });

    app.get("/myReview/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send({
        success: true,
        data: result,
      });
    });

    app.put("/editReview/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: req.body }
      );
      if (result.matchedCount) {
        res.send({
          success: true,
          data: result,
        });
      }
    });
  } catch (error) {
    console.log(error.name, error.message);
  }
}

// Call the fuction you decleare abobe
run().catch(console.dir);

// Root Api to cheack activity

app.listen(port, () => console.log(`Server up and running ${port}`));
