const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ypipc9x.mongodb.net/;`;

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
    // await client.connect();

    // All Collections
    const userCollection = client.db("bloodDonation").collection("users");
    const donationReqCollection = client.db("bloodDonation").collection("donationReq");
    const districtCollection = client.db("bloodDonation").collection("districts");
    const upazilaCollection = client.db("bloodDonation").collection("upazilas");






    // middlewares
    const verifyToken = (req, res, next) => {
        if (!req.headers.authorization) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: "unauthorized access" });
          }
          req.decoded = decoded;
          next();
        });
      };
  
      // use verify admin 
      const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        const isAdmin = user?.role === "admin";
        if (!isAdmin) {
          return res.status(403).send({ message: "forbidden access" });
        }
        next();
      };
  




      // use verify volunteer 
      const verifyVolunteer = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        const isVolunteer = user?.role === "volunteer" || "admin";
        if (!isVolunteer) {
          return res.status(403).send({ message: "forbidden access" });
        }
        next();
      };
  
  
  
  
  
  
  
  
  
  
      // jwt API
      app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        res.send({ token });
      });
  
  
  
  
  
  
  
  
  // User APIs-------------------------------
  
  
      // users Get API
      app.get("/users", async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });


      // user Get By Email API
      app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const user = await userCollection.findOne(query);
        res.send(user)
      })
  
  
      // Is Admin API
      app.get('/users/admin/:email', verifyToken, async (req, res) => {
          const email = req.params.email;
    
          if (email !== req.decoded.email) {
            return res.status(403).send({ message: 'forbidden access' })
          }
    
          const query = { email: email };
          const user = await userCollection.findOne(query);
          let admin = false;
          if (user) {
            admin = user?.role === 'admin';
          }
          res.send({ admin });
        })
  
  
  
  
        //   New User Post API 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
    
    
            if (existingUser) {
              return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            console.log(result);
            res.send(result);
          });
  
    
    

            // Update a User status
            app.patch('/users/status/:id', async (req, res) => {
                const id = req.params.id;
                const status = req.body.status;
                const filter = { _id: new ObjectId(id) };
                const updatedDoc = {
                  $set: {
                    status: status
                  }
                }
                const result = await userCollection.updateOne(filter, updatedDoc);
                res.send(result);
              })
              
              
              
              
              
            // Update a User Role
              app.patch('/users/role/:id', async (req, res) => {
                  const id = req.params.id;
                  const role = req.body.role;
                  const filter = { _id: new ObjectId(id) };
                  const updatedDoc = {
                    $set: {
                      role: role
                    }
                  }
                  const result = await userCollection.updateOne(filter, updatedDoc);
                  res.send(result);
                })







           // Update User Profile------------
           app.patch('/users/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const age = req.body.age;
            const bloodGroup = req.body.bloodGroup;
            const district = req.body.district;
            const upazila = req.body.upazila;
            const image = req.body.image;
            const name = req.body.name;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
              $set: {
                name: name,
                age: age,
                bloodGroup: bloodGroup,
                district: district,
                upazila: upazila,
                image: image,
              }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
          })








          //   Delete USER API
          app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
          })
      
      
      
      
      
      



  //Donation Request APIs ---------------------



  app.get("/donationReqs", async (req, res) => {
    const result = await donationReqCollection.find().toArray();
    res.send(result);
  });




  app.get("/donationReqs/:id", async (req, res) => {
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await donationReqCollection.findOne(query);
    res.send(result);
  });





  app.get("/donationReqs/email/:email", async (req, res) => {
    const email = req.params.email
    const query = {requesterEmail: email}
    const result = await donationReqCollection.find(query).toArray();
    res.send(result);
  });


  app.delete('/donationReq/delete/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await donationReqCollection.deleteOne(query);
            res.send(result);
          })



  app.post("/addDonationReq", async(req, res)=>{
    const data = req.body;
    const result = await donationReqCollection.insertOne(data);
    res.send(result);
  })






  // Donation request satus update
  app.patch('/donationReq/done/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        status: "done"
      }
    }
    const result = await donationReqCollection.updateOne(filter, updatedDoc);
    res.send(result);
  })
  app.patch('/donationReq/canceled/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        status: "done"
      }
    }
    const result = await donationReqCollection.updateOne(filter, updatedDoc);
    res.send(result);
  })




  // Edit Req--------------------------------------
  app.patch('/donationReq/edit/:id', verifyToken, async (req, res) => {
    console.log("Hitted");
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const recipentName = req.body.recipentName
    const hospitalName = req.body.hospitalName
    const addressName = req.body.addressName
    const bloodGroup = req.body.bloodGroup
    const recipentDistrict = req.body.recipentDistrict
    const recipentUpazila = req.body.recipentUpazila
    const donationDate = req.body.donationDate
    console.log(id);
    const updatedDoc = {
      $set: {
      recipentName,
      hospitalName,
      addressName,
      bloodGroup,
      recipentDistrict,
      recipentUpazila,
      donationDate,
      }
    }
    console.log(updatedDoc);
    const result = await donationReqCollection.updateOne(filter, updatedDoc);
    res.send(result);
    console.log(result);
  })









  // District And Upazila API---------------------------------------------------

  // District API
  app.get("/districts", async (req, res) => {
    const result = await districtCollection.find().toArray();
    res.send(result);
  });





  // Upazila API
  app.get("/upazilas", async (req, res) => {
    const result = await upazilaCollection.find().toArray();
    res.send(result);
  });

      
      
      
    











  // Dashboard Menu API-----------------------------------



  app.get("/menus/:email", async(req, res) => {
        const adminmenu = [
        {
          name: "Dashboard",
          url: "/dashboard"
        },
        {
          name: "All Users",
          url: "/dashboard/all-users"
        },
        {
          name: "All Donation Request",
          url: "/dashboard/all-blood-donation-request"
        },
        {
          name: "Add Donation Request",
          url: "/dashboard/addDonationRequest"
        },
        {
          name: "Add Blog",
          url: "/dashboard/content-management"
        },
        {
          name: "Profile",
          url: "/dashboard/profile"
        }
      ]

      const volunteerMenu = [
        {
          name: "Dashboard",
          url: "/dashboard"
        },
        {
          name: "All Donation Request",
          url: "/dashboard/all-blood-donation-request"
        },
        {
          name: "Add Blog",
          url: "/dashboard/content-management"
        },
        {
          name: "Profile",
          url: "/dashboard/profile"
        }
      ]

      const donorMenu = [
        {
          name: "Dashboard",
          url: "/dashboard"
        },
        {
          name: "Add Donation Request",
          url: "/dashboard/addDonationRequest"
        },
        {
          name: "Profile",
          url: "/dashboard/profile"
        }
      ]
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        const userRole = user?.role;
        if (userRole === "admin") {
          return res.send(adminmenu)
        } else if (userRole === "volunteer") {
          return res.send(volunteerMenu)
        } else {
          return res.send(donorMenu)
        }
  })



  // User Role api--------------------------------------------------
  app.get("/users/role/:email", async(req, res)=> {
    const email = req.params.email
    const query = { email: email };
    const user = await userCollection.findOne(query);
    userRole = user?.role;
    res.send([userRole])
  })
    
    
    
    
  
  

    // // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);  

app.get("/", (req, res) => {
  res.send("Blood Donation");
});

app.listen(port, () => {
  console.log(`Blood Donation ${port}`);
});
