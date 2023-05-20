const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Toy Server Running");
});

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.bioniru.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("toysDB");
    const toysCollection = database.collection("carToys");

    const indexKeys = {name:1}
    const indexOptions = {name: 'toys'}
    await toysCollection.createIndex(indexKeys, indexOptions)

    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });
    
    app.get("/toys/:text", async(req, res) => {
        const searchText = req.params.text;
        
        const result = await toysCollection.find({
            $or: [
                
                {name: { $regex: searchText, $options: 'i'}},
                {sub_category:{ $regex: searchText, $options: 'i'}}
        
        ]
        }).toArray();
        res.send(result)

    });

    app.post('/addToy', async(req, res) => {
        const body = req.body;
        // if(!body){
        //     return res.status(404).send({message: 'Request Invalid'})
        // }
        const result = await toysCollection.insertOne(body)
        console.log(result)
        res.send(result)
    })
    app.get('/myToys/:email', async(req, res) => {
        const email = req.params.email
        const result = await toysCollection.find({seller_email: email}).toArray()
        res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server Running on Port: ${port}`);
});
