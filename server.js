/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/

'use strict';

const express = require("express");
const http = require('http');
const socketio = require('socket.io');
const cluster = require('cluster');
const socketEvents = require('./web/socket'); 
const routes = require('./web/routes'); 
const appConfig = require('./config/app-config');
const sticky = require('sticky-session');


class Server{

    constructor(){
        this.app = express();
        this.http = http.Server(this.app);   // = server
        this.socket = socketio(this.http);   // = io
        this.app.get('/login', function (req, res) {
            console.log('send message by worker: ' + cluster.worker.id);
            res.send('Socket.io on Cluster! You work on cluster worker id='+cluster.worker.id);
        });
    }

    appConfig(){        
        new appConfig(this.app).includeConfig();
    }

    /* Including app Routes starts*/
    includeRoutes(){
        new routes(this.app).routesConfig();
        new socketEvents(this.socket).socketConfig();
    }
    /* Including app Routes ends*/  

    appExecute(){
        this.appConfig();
        this.includeRoutes();

        const port =  process.env.PORT || 4000;
        const host = process.env.HOST || `localhost`;

        /*this.http.listen(port, host, pingInterval, pingTimeout, () => {
            console.log(`Listening on http://${host}:${port}`);
        });*/

        if(!sticky.listen(this.http,port))
        {
            this.http.once('listening', function() {
                console.log('Server started on port '+port);
            });

            if (cluster.isMaster) {
                console.log('Master server started on port '+port);
            }
        }
        else
            {
            console.log('- Child server started on port '+port+' case worker id='+cluster.worker.id);
        }

    }

}
    
const app = new Server();
app.appExecute();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
