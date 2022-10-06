const redis = require("redis");
const { promisify } = require("util");


//================================== connecting to redis =================================================
const redisClient = redis.createClient(
    15497,                                                                // port number 
    "redis-15497.c212.ap-south-1-1.ec2.cloud.redislabs.com",              //endpoint
    { no_ready_check: true }
);


redisClient.auth("a8a7S4xBS4YORJDXv9RzqxqPCD3nWRPR", function (err) {      // authentication of password
    if (err) {
        console.log(err)
    };
});


redisClient.on("connect", async function () {                                // port listener
    console.log("Connected to Redis..on port 15497");
});



//====================== connecting setup for redis using get and set method ===============================

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)  //set function of redis
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)  // get function of redis
// const DEL_ASYNC = promisify(redisClient.DEL).bind(redisClient)  // delete function of redis



module.exports = {SET_ASYNC,GET_ASYNC}