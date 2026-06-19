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

    const classCollections = database.collection("class");
    const forumCollections = database.collection("forums");
    const favoritesCollections = database.collection("favorites");
    const forumVotesCollections = database.collection("vote");

    // All Classess APi's
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
    // Get all classes:
    app.get("/api/classes", async (req, res) => {
      const result = await classCollections
        .find({ status: { $regex: /^pending$/i } })
        .toArray();
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

    //All Forums API's:
    // Create new Forum
    app.post("/api/forums", async (req, res) => {
      const forum = req.body;
      const newFOrum = {
        ...forum,
        createdAt: new Date(),
      };

      const result = await forumCollections.insertOne(newFOrum);
      res.send(result);
    });

    // Get all classes:
    app.get("/api/forums", async (req, res) => {
      const result = await forumCollections.find().toArray();
      res.send(result);
    });
    // Get own forum posts:
    app.get("/api/forums/author/:authorId", async (req, res) => {
      const authorId = req.params.authorId;

      const query = {
        authorId: authorId,
      };

      const result = await forumCollections.find(query).toArray();

      res.send(result);
    });
    // Get single forum
    app.get("/api/forums/single/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid forum id" });
      }

      const result = await forumCollections.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    // Update forum:
    app.patch("/api/forums/:id", async (req, res) => {
      const { id } = req.params;

      const updateForum = req.body;

      const result = await forumCollections.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateForum,
        },
      );

      res.send(result);
    });
    // Delete forum post
    app.delete("/api/forums/:id", async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = forumCollections.deleteOne(query);
      res.send(result);
    });

    // Favorite APi:
    app.post("/api/favorites/toggle", async (req, res) => {
      try {
        const { userId, classId } = req.body;

        // ✅ validation
        if (!userId || !classId) {
          return res.status(400).send({ message: "Missing userId or classId" });
        }

        // ✅ convert to ObjectId (VERY IMPORTANT)
        const query = {
          userId: new ObjectId(userId),
          classId: new ObjectId(classId),
        };

        const existing = await favoritesCollections.findOne(query);

        if (existing) {
          await favoritesCollections.deleteOne(query);
          return res.send({ favorite: false });
        }

        await favoritesCollections.insertOne({
          userId: new ObjectId(userId),
          classId: new ObjectId(classId),
          createdAt: new Date(),
        });

        return res.send({ favorite: true });
      } catch (error) {
        console.error("Toggle favorite error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });
    // Forum post vote api
    app.post("/api/forums/vote", async (req, res) => {
      try {
        const { userId, forumId, vote } = req.body;

        if (!userId || !forumId || !vote) {
          return res.status(400).send({ message: "Missing fields" });
        }

        const existing = await forumVotesCollections.findOne({
          userId,
          forumId,
        });

        if (existing) {
          return res.status(400).send({
            message: "You have already voted",
          });
        }

        await forumVotesCollections.insertOne({
          userId,
          forumId,
          vote, // "like" or "dislike"
          createdAt: new Date(),
        });

        res.send({ success: true, vote });
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Favorite api
    app.get("/api/favorites/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const favorites = await favoritesCollections.find({}).toArray();

        const filtered = favorites.filter(
          (f) => String(f.userId) === String(userId),
        );

        const classIds = filtered.map((f) => f.classId);

        const classes = await classCollections
          .find({
            _id: { $in: classIds.map((id) => new ObjectId(id)) },
          })
          .toArray();

        res.send(classes);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
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
