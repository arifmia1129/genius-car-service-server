const express = require("express");
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


function verifyAuth(req, res, next) {
    const reqAuth = req.headers.authorization;
    if (!reqAuth) {
        res.status(401).send({ message: "Unauthorize!" })
    }
    const token = reqAuth.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: "Forbidden access" });
        }
        else {
            req.decoded = decoded;
            next();
        }
    })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apkoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const servicesCollection = client.db("geniusCar").collection("service");
        const orderCollection = client.db("geniusCar").collection("order");
        // Service
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

        // Order
        app.get("/order", verifyAuth, async (req, res) => {

            const decodedEmail = req.decoded.user;
            const email = req?.query?.email;
            if (decodedEmail === email) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }

            else {
                res.status(403).send({ message: "Forbidden access." })
            }

        })

        app.post("/order", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        app.post("/login", async (req, res) => {
            const user = req.body.address;
            const token = jwt.sign({ user }, process.env.SECRET_KEY, {
                expiresIn: "1d"
            });
            res.send({ token });
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