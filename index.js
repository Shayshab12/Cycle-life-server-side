const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3udp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Cycle_life");
    const servicesCollection = database.collection("Services");
    const bookingsCollection = database.collection("Bookings");
    const usersCollection = database.collection("Users");
    const reviewCollection = database.collection("Reviews");

    app.get("/services", async (req, res) => {
      try {
        const cursor = servicesCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.json(err);
      }
    });
    app.get("/reviews", async (req, res) => {
      try {
        const cursor = reviewCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.json(err);
      }
    });
    app.get("/allOrders", async (req, res) => {
      try {
        const cursor = bookingsCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        res.json(err);
      }
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };

      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.json(result);
    });
    app.get("/adminDashBoard", async (req, res) => {
      const id = req.params.id;

      const cursor = bookingsCollection.find(id);
      const result = await cursor.toArray();
      console.log(result);
      res.json(result);
    });

    app.post("/addbookings", async (req, res) => {
      const appointment = req.body;
      const result = await bookingsCollection.insertOne(appointment);
      res.json(result);
    });
    app.post("/addReview", async (req, res) => {
      const appointment = req.body;
      const result = await reviewCollection.insertOne(appointment);
      res.json(result);
    });
    app.post("/addService", async (req, res) => {
      const appointment = req.body;
      const result = await servicesCollection.insertOne(appointment);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      console.log(filter);
      const updateDoc = { $set: { role: "admin" } };

      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    //UPDATE API
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await bookingsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      console.log(result);
      res.json(result);
    });
    // delete bookings
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      console.log("Del user", id);
      res.json(result);
    });
    // delete products
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      console.log("Del user", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello CycleLife portal!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
