const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apkoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const servicesCollection = client.db("geniusCar").collection("service");

        app.get("/service", async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);

            const services = await cursor.toArray();

            res.send(services);
        })

        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const singleService = await servicesCollection.findOne(query);

            res.send(singleService);
        });

        app.post("/service", async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result);
        })

        app.delete("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        })
    }

    finally {

    }
}

run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Genius Car Services server is running.")
});


app.listen(port, () => {
    console.log("Server running by using port:", port);
})