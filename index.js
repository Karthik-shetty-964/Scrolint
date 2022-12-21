import express from 'express'; 
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from './controllers/auth.js';
import {createPost} from "./controllers/posts.js";
import {verifyToken} from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts} from "./data/index.js";
import * as path from 'path';//for hosting on cyclic

//static files => to hosting on CYCLIC 
app.use(express.static(path.join(__dirname,'./client/build')));

app.get('*', function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'));
});

/* CONFIGURATIONS */
const PORT = process.env.PORT || 3000;  //If 3001 doesn't work, then it will make use of 3000
const __filename  = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: 'cross-origin'}));
app.use(morgan("common"));
app.use(bodyParser.json({limit : "30mb" , extended : true}));
app.use(bodyParser.urlencoded({limit : "30mb" , extended : true}));
app.use(cors());
app.use("/assets",express.static(path.join(__dirname,'public/assets')));

//FILE STORAGE
/*This is to store any files that is uploaded to our website in 'pulic/assets' folder. */
// All the below code will be present in the multer github repo.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
/*This will help us save the file. we will use the below variable whenever we need to store file.*/
const upload = multer({storage});


/*ROUTES WITH FILES */
app.post("/auth/register", upload.single('picture'), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/*ROUTES */
app.use("/auth",authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);



/*MONGOOSE SETUP */
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD THIS ONE TIME : IF WE SAVE IT AGAIN, IT'S GOING TO CREATE DUBPLICATE DATA. */
    // User.insertMany(users);
    // Post.insertMany(posts);
})
.catch((error) => console.log(`${error} : did not connect`));
