const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("Gymstructor");
    const profileCollections = database.collection("profile");
    const classCollections = database.collection("class");

    // Create new class API
    app.post("/api/classes", async (req, res) => {
      const myClass = req.body;

      const newClass = {
        ...myClass,

        status: "pending",
        createdAt: new Date(),
      };

      const result = await classCollections.insertOne(newClass);
      res.send(result);
    });

    // Get trainer's own classes
    app.get("/api/classes/trainer/:trainerId", async (req, res) => {
      const trainerId = req.params.trainerId;

      const query = {
        trainerId: trainerId,
      };

      const result = await classCollections.find(query).toArray();

      res.send(result);
    });

    // Get single class API
    app.get("/api/classes/single/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid class id" });
      }

      const result = await classCollections.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    // Update class:
    app.patch("/api/classes/:id", async (req, res) => {
      const { id } = req.params;

      const updateClass = req.body;

      const result = await classCollections.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateClass,
        },
      );

      res.send(result);
    });
    // Delete Class

    app.delete("/api/classes/:id", async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = classCollections.deleteOne(query);
      res.send(result);
    });
    app.get("/api/categories", async (req, res) => {
      try {
        const categories = await classCollections
          .aggregate([
            {
              $group: {
                _id: "$category",
              },
            },
            {
              $project: {
                _id: 0,
                name: "$_id",
              },
            },
          ])
          .toArray();

        res.send(categories);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch categories" });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Gystructor");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
