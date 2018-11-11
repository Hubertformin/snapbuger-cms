//server
const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const server = express();
server.use(bodyParser.json());

const pubicVapidkey = 'BKB0Z0hU9xINKZvdJEgySp5mLXsgRP8tA9ewqUmoVSlwA74c1pnxJni8fv42bg4Vji4qu4T8TfH_WQ0XRxTVQGA';
const privateVapidKey = 'nHQeZw57ld4jAkLmIvFU7Ai26nyMA74PclmWGGpTl1E';

webpush.setVapidDetails('mailto:snap@snapburger17', pubicVapidkey, privateVapidKey);
//subscribe route
server.post('subscribe',(req,res)=>{
    const subscribtion = req.body;
    //send 201 status :resource created
    res.status(201).json({})
    //creare payload
    const payload = JSON.stringify({title:"Push Test"});

    webpush.sendNotification(subscribtion, payload)
    .catch(err=>{
        console.log(err);
    })
})
//
server.listen(5000,()=>{
    console.log("server started on port: 5000");
})