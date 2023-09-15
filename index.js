const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// middleware
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// middleware for jwt token

// const uri = "mongodb://localhost:27017";
const uri =
  "mongodb+srv://school-management:d4VT3wbI3v1qCV7Z@cluster0.yq2vgbi.mongodb.net/";

// Mongodb template
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uetnypa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
});

async function run() {
  try {
    /* ---------------------------- TODO: COLLECTIONS --------------------------- */
    const usersCollection = client.db("school-management").collection("users");
    const noticeCollection = client
      .db("school-management")
      .collection("notices");
    const routinesCollection = client
      .db("school-management")
      .collection("routines");

    const teachersCollection = client
      .db("school-management")
      .collection("teachers");

    const sovapotireBaniCollection = client
      .db("school-management")
      .collection("sovapoti");

    const instituteInfoCollection = client
      .db("school-management")
      .collection("instituteinformation");

    /* -------------------------------------------------------------------------- */
    /*                          FILE UPLOAD FUNCTIONALITY                         */
    /* -------------------------------------------------------------------------- */

    app.use(express.static("uploads"));
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads");
      },
      filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName =
          file.originalname
            .replace(fileExt, "")
            .toLowerCase()
            .split(" ")
            .join("-") +
          "-" +
          Date.now();
        cb(null, fileName + fileExt);
      },
    });

    const upload = multer({
      storage,
      limits: {
        files: 10,
      },
    });

    /* -------------------------------------------------------------------------- */
    /*                               ROUTINE ROUTES                               */
    /* -------------------------------------------------------------------------- */

    // TODO: ADD ROUTINE ROUTE
    app.post("/upload", upload.single("pdf"), async (req, res) => {
      try {
        const { filename } = req.file;
        const { selectedClass } = req.body;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const filepath = path.join(__dirname, "uploads", filename);

        await routinesCollection.insertOne({
          filename,
          filepath,
          selectedClass,
          createdAt: new Date(),
        });

        res.status(200).json({ message: "File uploaded successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading file" });
      }
    });
    // TODO: GET ALL ROUTINE ROUTE
    app.get("/all-routine", async (req, res) => {
      const result = await routinesCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // TODO: DELETE ROUTINE ROUTE
    app.delete("/delete-routine/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await routinesCollection.deleteOne(filter);
      res.send(result);
    });

    /* -------------------------------------------------------------------------- */
    /*                                NOTICE ROUTES                               */
    /* -------------------------------------------------------------------------- */

    // TODO: ADD NOTICE ROUTE
    app.post("/upload-notice", upload.single("pdf"), async (req, res) => {
      try {
        const { filename } = req.file;
        const { noticeName } = req.body;
        if (!req.file) {
          return res.send("File Not found ");
        }

        await noticeCollection.insertOne({
          filename,
          notice: noticeName,
          createdAt: new Date(),
        });

        res.status(200).json({ message: "File uploaded successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error uploading file" });
      }
    });

    // TODO: GET ALL NOTICE ROUTE
    app.get("/all-notice", async (req, res) => {
      try {
        const result = await noticeCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server error");
      }
    });

    // TODO: DELETE NOTICE ROUTE
    app.delete("/delete-notice/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await noticeCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server error");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                               TEACHER ROUTES                               */
    /* -------------------------------------------------------------------------- */
    //TODO: ADD TEACHER INFORMATION ROUTE
    app.post("/teacherInfo", upload.single("image"), async (req, res) => {
      try {
        const { filename } = req.file;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const teachers = req.body;
        const result = await teachersCollection.insertOne({
          ...teachers,
          image: filename ? filename : "",
        });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET ALL TEACHER ROUTE
    app.get("/all-teachers", async (req, res) => {
      try {
        const result = await teachersCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE TEACHER ROUTE
    app.get("/single-teacher/:id", async (req, res) => {
      console.log(req.params.id);
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await teachersCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE TEACHER ROUTE
    app.delete("/delete-teacher/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await teachersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    
    // TODO: UPDATE TEACHER INFO ROUTE
    app.put(
      "/update-teacherinformation/:id",
      upload.single("image"),
      async (req, res) => {
        console.log(req.body);
        try {
          const id = req.params.id;
          const updated = req.body;

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              updated,
            },
          };

          const result = await teachersCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    /* --------------------------- TODO: OTHER ROUTES --------------------------- */

    // TODO: ADD SOVAPOTIR BANI
    app.post("/add-sovapotirbani", async (req, res) => {
      try {
        const message = req.body;

        const result = await sovapotireBaniCollection.insertOne(message);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE SOVAPOTIR BANI ROUTE
    app.delete("/delete-sovapotirbani/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await sovapotireBaniCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE SOVAPOTIR BANI ROUTE
    app.patch("/update-sovapotirbani/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { description } = req.body;
        console.log(description);
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            description,
          },
        };

        const result = await sovapotireBaniCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET SOVAPOTIR DATA ROUTE
    app.get("/sovapotirbani", async (req, res) => {
      try {
        const result = await sovapotireBaniCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });
    // TODO: GET SINGLE SOVAPOTIR DATA ROUTE
    app.get("/single-sovapotirbani/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await sovapotireBaniCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: ADD INSTITUTE INFORMATION
    app.post("/add-instituteinfo", upload.array("images"), async (req, res) => {
      try {
        const { message } = req.body;
        const uploadedFiles = req.files.map((file) => {
          return {
            filename: file.filename,
          };
        });

        const information = {
          description: message,
          image: uploadedFiles,
        };
        const result = await instituteInfoCollection.insertOne(information);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET INSTITUTE INFORMATION
    app.get("/instituteinfo", async (req, res) => {
      try {
        const result = await instituteInfoCollection
          .find()
          .sort({ createAt: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                             ADMIN LOGIN ROUTES                             */
    /* -------------------------------------------------------------------------- */
    /* --------------------------- TODO: SIGN UP ROUTE -------------------------- */
    app.post("/create-user", async (req, res) => {
      try {
        const { name, email, password } = req.body;
        console.log(req.body);
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
          return res.status(400).json({ error: "user already registered" });
        }
        const newUser = {
          name,
          email,
          password: hashedPassword,
        };
        const result = await usersCollection.insertOne(newUser);

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    /* ------------------------- CONFIRM LOGIN PASSWORD ------------------------- */
    /* --------------------------- TODO: SIGN IN ROUT --------------------------- */
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        console.log(req.body);
        // Find the user with the given email
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          res.status(200).send({
            message: "Login successful",
            status: 200,
            isLogin: user.isLogin,
          });
        } else {
          res.status(401).json({ error: "Incorrect password" });
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!✌️");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Review Radar is running!");
});

app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(500).send("There was a server side problem");
  }
});
app.listen(port, () => {
  console.log("Listening on port", port);
});
