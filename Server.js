import morgan from "morgan";
import express from "express";
import Api from "./Api.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

const app = express();


app.use(express.json());
app.use('/uploads', express.static('uploads'));

var whitelist = [ 
  'https://airfront.vercel.app','http://localhost:3000','https://airback.onrender.com'
];

var corsOptions = {
  origin: function (origin, callback) {
    console.log("origin:", origin);

    // Allow undefined origins (for local development tools like Postman)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));


mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });


app.use("/airdeal", Api);


app.use(morgan("common"));


// app.get("/", (req, res) => {
//   res.json({ lol: "123" });
// });

app.options("*", cors(corsOptions));
app.listen(9999, () => {
  console.log("Server is running on port 9999");
});

export default app;
