const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;

// middleware
// const corsConfig = {
//   origin: '',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))
// const corsConfig = {
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
// app.use("", cors(corsConfig))
// app.options("", cors(corsConfig))
app.use(cors());
app.use(express());
app.use(express.json())
app.use(bodyParser.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bioniru.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //  client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("toysDB");
    const toysCollection = database.collection("carToys");

    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toys" };
    // await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/toys", async (req, res) => {
      const result = await toysCollection?.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/toys/:text", async (req, res) => {
      const searchText = req.params.text;

      const result = await toysCollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { sub_category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.post("/addToy", async (req, res) => {
      const body = req.body;
      // if(!body){
      //     return res.status(404).send({message: 'Request Invalid'})
      // }
      const result = await toysCollection.insertOne(body);
      console.log(result);
      res.send(result);
    });
    app.get("/myToys/:email", async (req, res) => {
      const email = req.params.email;
      const { sort } = req.query; // Get the sort parameter from query

  // Build the sorting options based on the sort parameter
  const sortOptions = {};
  if (sort === 'asc') {
    sortOptions.price = 1; // Sort by name in ascending order
  } else if (sort === 'desc') {
    sortOptions.price = -1; // Sort by name in descending order
  }
      const result = await toysCollection
        .find({ seller_email: email })
        .sort(sortOptions)
        .toArray();
      res.send(result);
    });
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(filter);
      res.send(result);
    });
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: body.name,
          price: body.price,
          available_quantity: body.available_quantity,
          picture_url: body.picture_url,
          seller_email: body.seller_email,
          sub_category: body.sub_category,
        },
      };
      const result = await toysCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Toy Server Running");
});
app.listen(port, () => {
  console.log(`Server Running on Port: ${port}`);
});
