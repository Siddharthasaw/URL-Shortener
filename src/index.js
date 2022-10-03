const express = require("express");
const mongoose = require("mongoose");
const route = require("./routes/route");

const app = express();


app.use(express.json());


mongoose.connect("mongodb+srv://project4_urlshortner:UoRrmlJM7gch0SMz@cluster0.juqiop2.mongodb.net/group15_DB?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log(">> Database connected successfully.."))
    .catch(err => console.log(err))




app.use("/",route)

app.listen(process.env.PORT||3000,function(){
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})
