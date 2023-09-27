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
    const schoolInformationCollection = client
      .db("school-management")
      .collection("school-info");

    const teachersCollection = client
      .db("school-management")
      .collection("teachers");

    const headmasterCollection = client
      .db("school-management")
      .collection("headmaster");
    const headmasterBaniCollection = client
      .db("school-management")
      .collection("headmaster-bani");

    const stuffsCollection = client
      .db("school-management")
      .collection("stuffs");

    const presidentCollection = client
      .db("school-management")
      .collection("president");

    const committeeCollection = client
      .db("school-management")
      .collection("committee");

    const sovapotireBaniCollection = client
      .db("school-management")
      .collection("sovapoti");

    const instituteInfoCollection = client
      .db("school-management")
      .collection("instituteinformation");
    const instituteImagesCollection = client
      .db("school-management")
      .collection("institute-images");
    const classInformationCollection = client
      .db("school-management")
      .collection("class-information");

    const instituteCommunicationCollection = client
      .db("school-management")
      .collection("institute-communication");

    const importantLinkCollection = client
      .db("school-management")
      .collection("important-links");

    const achievementCollection = client
      .db("school-management")
      .collection("achievements");

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
      try {
        const result = await routinesCollection
          .find()

          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
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
    /*                              HEADMASTER ROUTES                             */
    /* -------------------------------------------------------------------------- */
    //TODO: ADD TEACHER INFORMATION ROUTE
    app.post("/add-headmaster", upload.single("image"), async (req, res) => {
      try {
        const { filename } = req.file;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const headmaster = req.body;
        const result = await headmasterCollection.insertOne({
          ...headmaster,
          image: filename ? filename : "",
          createdAt: Date.now(),
        });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET HEADMASTER'S ALL INFORMATION ROUTE
    app.get("/all-headmasterinformation", async (req, res) => {
      try {
        const result = await headmasterCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE HEADMASTER ROUTE
    app.get("/single-headmaster/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await headmasterCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE HEADMASTER ROUTE
    app.delete("/delete-headmaster/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log({ id });
        const query = { _id: new ObjectId(id) };

        const result = await headmasterCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE HEADMASTER INFO ROUTE
    app.patch(
      "/update-headmasterinformation/:id",
      upload.single("image"),
      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;
          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const options = {
            upsert: true,
          };

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await headmasterCollection.updateOne(
            filter,
            updateDoc,
            options
          );
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    // TODO: ADD HEADMASTER MESSAGE
    app.post("/add-headmasterbani", async (req, res) => {
      try {
        const message = req.body;
        const bani = {
          ...message,
          createdAt: Date.now(),
        };

        const result = await headmasterBaniCollection.insertOne(bani);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE HEADMASTER MESSAGE ROUTE
    app.patch("/update-headmasterbani/:id", async (req, res) => {
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

        const result = await headmasterBaniCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: DELETE SOVAPOTIR BANI ROUTE
    app.delete("/delete-headmasterbani/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await headmasterBaniCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET HEADMASTER MESSAGE DATA ROUTE
    app.get("/headmasterbani", async (req, res) => {
      try {
        const result = await headmasterBaniCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });
    // TODO: GET SINGLE HEADMASTERBANI DATA ROUTE
    app.get("/single-headmasterbani/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await headmasterBaniCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
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
    app.patch(
      "/update-teacherinformation/:id",
      upload.single("image"),
      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await teachersCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    //TODO: ADD STUFF INFORMATION ROUTE
    app.post("/add-stuff", upload.single("image"), async (req, res) => {
      try {
        const { filename } = req.file;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const stuffs = req.body;
        const result = await stuffsCollection.insertOne({
          ...stuffs,
          image: filename ? filename : "",
        });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET ALL STUFF ROUTE
    app.get("/all-stuff", async (req, res) => {
      try {
        const result = await stuffsCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE STUFF ROUTE
    app.get("/single-stuff/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await stuffsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE STUFF ROUTE
    app.delete("/delete-stuff/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await stuffsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE STUFF INFO ROUTE
    app.patch("/update-stuff/:id", upload.single("image"), async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;

        // Remove undefined or empty string values from the updated object
        Object.keys(updated).forEach((key) =>
          updated[key] === undefined || updated[key] === ""
            ? delete updated[key]
            : null
        );

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updated,
          },
        };

        const result = await stuffsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //TODO: ADD SCHOOL INFORMATION ROUTE
    app.post(
      "/add-school-information",
      upload.single("image"),
      async (req, res) => {
        try {
          const { filename } = req.file;
          if (!req.file) {
            return res.send("File Not found ");
          }
          const schoolInfo = req.body;
          const result = await schoolInformationCollection.insertOne({
            ...schoolInfo,
            image: filename ? filename : "",
          });

          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    // TODO: GET ALL SCHOOL INFORMATION ROUTE
    app.get("/all-school-information", async (req, res) => {
      try {
        const result = await schoolInformationCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE SCHOOL INFORMATION ROUTE
    app.get("/single-school-information/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await schoolInformationCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE SCHOOL INFORMATION ROUTE
    app.delete("/delete-school-information/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log({ id });
        const query = { _id: new ObjectId(id) };

        const result = await schoolInformationCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE SCHOOL INFORMATION INFO ROUTE
    app.patch(
      "/update-school-information/:id",
      upload.single("image"),
      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await schoolInformationCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    /* ------------------------- TODO: PRESIDENT ------------------------- */
    //TODO: ADD PRESIDENT INFORMATION ROUTE
    app.post("/add-president", upload.single("image"), async (req, res) => {
      try {
        const { filename } = req.file;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const president = req.body;
        const result = await presidentCollection.insertOne({
          ...president,
          image: filename ? filename : "",
        });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET ALL president ROUTE
    app.get("/all-president", async (req, res) => {
      try {
        const result = await presidentCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE president ROUTE
    app.get("/single-president/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await presidentCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE president ROUTE
    app.delete("/delete-president/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await presidentCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE president INFO ROUTE
    app.patch(
      "/update-president/:id",
      upload.single("image"),
      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await presidentCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );

    /* -----------------------TODO: INSTITUTE COMMITTEE MEMBER ----------------------- */
    /* ------------------------- TODO: committee ------------------------- */
    //TODO: ADD committee INFORMATION ROUTE
    app.post("/add-committee", upload.single("image"), async (req, res) => {
      try {
        const { filename } = req.file;
        if (!req.file) {
          return res.send("File Not found ");
        }
        const committee = req.body;
        const result = await committeeCollection.insertOne({
          ...committee,
          image: filename ? filename : "",
        });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // TODO: GET ALL committee ROUTE
    app.get("/all-committee", async (req, res) => {
      try {
        const result = await committeeCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE committee ROUTE
    app.get("/single-committee/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await committeeCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE committee ROUTE
    app.delete("/delete-committee/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await committeeCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE committee INFO ROUTE
    app.patch(
      "/update-committee/:id",
      upload.single("image"),
      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await committeeCollection.updateOne(filter, updateDoc);
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
        const bani = {
          ...message,
          createdAt: Date.now(),
        };

        const result = await sovapotireBaniCollection.insertOne(bani);
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
        const result = await sovapotireBaniCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
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

    // TODO: ADD INSTITUTE IMAGES
    app.post(
      "/add-instituteimages",
      upload.array("images"),
      async (req, res) => {
        try {
          const uploadedFiles = req.files.map((file) => {
            return {
              filename: file.filename,
            };
          });

          const information = {
            image: uploadedFiles,
            createAt: Date.now(),
          };
          const result = await instituteImagesCollection.insertOne(information);
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error");
        }
      }
    );

    // TODO: GET INSTITUTE IMAGES
    app.get("/instituteimages", async (req, res) => {
      try {
        const result = await instituteImagesCollection
          .find()
          .sort({ createAt: -1 })
          .limit(1)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    app.post("/add-instituteinfo", upload.array("images"), async (req, res) => {
      try {
        const { message } = req.body;

        const result = await instituteInfoCollection.insertOne(message);
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
          .limit(1)
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });

    /* -------------------------------------------------------------------------- */
    /*                       TODO: CLASS INFORMATION ROUTES                       */
    /* -------------------------------------------------------------------------- */
    app.post("/classinfo", async (req, res) => {
      try {
        const classes = req.body;
        const classInfo = {
          ...classes,
          createdAt: Date.now(),
        };
        const result = await classInformationCollection.insertOne(classInfo);
        res.send(result);
      } catch (error) {}
    });

    app.get("/all-classinfo", async (req, res) => {
      try {
        const result = await classInformationCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });

    // TODO: UPDATE CLASS INFO ROUTE
    app.patch(
      "/update-classinfo/:id",

      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await classInformationCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error ");
        }
      }
    );

    // TODO: GET SINGLE CLASS INFO
    app.get("/single-classinfo/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await classInformationCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });
    // TODO: GET SINGLE CLASS INFO
    app.delete("/delete-classinfo/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await classInformationCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error ");
      }
    });

    /* ------------------ TODO: INSTITUTE COMMUNICATION ROUTES ------------------ */

    // TODO: ADD COMMUNICATION
    app.post("/add-communication", async (req, res) => {
      try {
        const data = req.body;
        const communication = {
          ...data,
          createdAt: Date.now(),
        };

        const result = await instituteCommunicationCollection.insertOne(
          communication
        );
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE COMMUNICATION
    app.delete("/delete-communication/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await instituteCommunicationCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE COMMUNICATION
    app.patch(
      "/update-communication/:id",

      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await instituteCommunicationCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error ");
        }
      }
    );

    // TODO: GET COMMUNICATION
    app.get("/communication", async (req, res) => {
      try {
        const result = await instituteCommunicationCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE COMMUNICATION
    app.get("/single-communication/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await instituteCommunicationCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    /* ------------------ TODO: IMPORTANT LINKS ROUTES ------------------ */

    // TODO: ADD IMPORTANT LINKS
    app.post("/add-importantlinks", async (req, res) => {
      try {
        const data = req.body;
        const communication = {
          ...data,
          createdAt: Date.now(),
        };

        const result = await importantLinkCollection.insertOne(communication);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE IMPORTANT LINKS
    app.delete("/delete-importantlinks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await importantLinkCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE IMPORTANT LINKS
    app.patch(
      "/update-importantlinks/:id",

      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await importantLinkCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error ");
        }
      }
    );

    // TODO: GET IMPORTANT LINKS
    app.get("/importantlinks", async (req, res) => {
      try {
        const result = await importantLinkCollection
          .find()
          .sort({ createdAt: -1 })

          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE IMPORTANT LINKS
    app.get("/single-importantlinks/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await importantLinkCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    /* ------------------ TODO: ACHIEVEMENT ROUTES ------------------ */

    // TODO: ADD IMPORTANT LINKS
    app.post("/add-achievement", async (req, res) => {
      try {
        const data = req.body;
        const achievement = {
          ...data,
          createdAt: Date.now(),
        };

        const result = await achievementCollection.insertOne(achievement);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: DELETE IMPORTANT LINKS
    app.delete("/delete-achievement/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await achievementCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: UPDATE IMPORTANT LINKS
    app.patch(
      "/update-achievement/:id",

      async (req, res) => {
        try {
          const id = req.params.id;
          const updated = req.body;

          // Remove undefined or empty string values from the updated object
          Object.keys(updated).forEach((key) =>
            updated[key] === undefined || updated[key] === ""
              ? delete updated[key]
              : null
          );

          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              ...updated,
            },
          };

          const result = await achievementCollection.updateOne(
            filter,
            updateDoc
          );
          res.send(result);
        } catch (error) {
          console.log(error);
          res.send("There was a server side error ");
        }
      }
    );

    // TODO: GET IMPORTANT LINKS
    app.get("/achievement", async (req, res) => {
      try {
        const result = await achievementCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    // TODO: GET SINGLE IMPORTANT LINKS
    app.get("/single-achievement/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await achievementCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send("There was a server side error");
      }
    });

    app.get("/all-important-links", async (req, res) => {
      try {
        // Use the aggregation pipeline to reshape the data
        const pipeline = [
          {
            $project: {
              _id: 0, // Exclude _id field
              item: {
                id: "$_id",
                name: "$name",
                http: "$http",
              },
            },
          },
        ];

        const result = await importantLinkCollection
          .aggregate(pipeline)
          .toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
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
  res.send("Institute management system  is running!");
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
