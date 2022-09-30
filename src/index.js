const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const route = require("./routes/route");
const PORT = process.env.PORT || 3000;

const app = express();


app.use(express.json());
app.use(cors());


mongoose.connect("mongodb+srv://project4_urlshortner:UoRrmlJM7gch0SMz@cluster0.juqiop2.mongodb.net/group15_DB?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log(">> Database connected successfully.."))
    .catch(err => console.log(err))


app.use("/", route)

app.listen(PORT, () => { console.log(`>> Express app running on port: ${PORT}...`) });