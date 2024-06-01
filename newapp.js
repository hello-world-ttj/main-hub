const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");


const app = express();

app.use(cors());


// Create HTTP server for Express app

const httpServer = http.createServer(app);


// Map to store arrays of WebSocket servers corresponding to their identifiers

const websocketServers = new Map();

// Array to store active charging socket connections
const mysockets = []

// Function to establish connections to external WebSocket servers dynamically

function connectExternalWebSocket(identifier, url) {

    const externalWebSocket = new WebSocket(url);


    externalWebSocket.on("open", () => {

        console.log(`Connected to external WebSocket server with identifier: ${identifier}`);

        if (!websocketServers.has(identifier)) {

            websocketServers.set(identifier, []);

        }

        websocketServers.get(identifier).push(externalWebSocket); // Store WebSocket server with its identifier

    });


    externalWebSocket.on("close", () => {

        console.log(`Disconnected from external WebSocket server with identifier: ${identifier}`);

        if (websocketServers.has(identifier)) {

            websocketServers.set(

                identifier,

                websocketServers.get(identifier).filter((ws) => ws !== externalWebSocket)

            );

        }

    });


    externalWebSocket.on("error", (error) => {

        console.error(`WebSocket error with identifier ${identifier}:`, error.message);

    });


    externalWebSocket.on("message", (message) => {

        const bufferData = Buffer.from(message);

        if (bufferData.toString('utf8').split(',')[2] === `"RemoteStartTransaction"`) {
            const con = JSON.parse(bufferData.toString('utf8'))
            mysockets.push({ details: con[3], socket: externalWebSocket })
        }
        console.log(`Received from external WebSocket server (${identifier}): ${message}`);
        broadcastMessage(identifier, message);


    });

    return externalWebSocket;

}


// Function to broadcast message to clients based on identifier

function broadcastMessage(identifier, message) {



    const clients = Array.from(wss.clients).filter((client) => client.identifier === identifier);

    clients.forEach(client => {



        if (client.readyState === WebSocket.OPEN) {

            try {

                const jsonData = JSON.parse(message);

                client.send(JSON.stringify(jsonData));

            } catch (error) {

                console.error(`Error sending message to client (${client.identifier}):`, error.message);

            }

        }

    });

}


// Start the primary WebSocket server on a different port

const websocketPort = process.env.WEBSOCKET_PORT || 8080;

const wss = new WebSocket.Server({ port: websocketPort });

wss.on("connection", (ws, req) => {

    console.log("Client connected to primary WebSocket server");


    // Extract identifier from the end of the URL path (e.g., '/GOEC001')

    const identifier = req.url.split("/").pop();

    console.log(`Client connected with identifier: ${identifier}`);


    // Store the client's identifier for message filtering

    ws.identifier = identifier;

  

    // Handle incoming messages from clients

    ws.on("message", (message) => {

        if (JSON.parse(Buffer.from(message).toString('utf8'))[2] === "StartTransaction") {

            const activeSocketObj = mysockets.filter(socketObj => socketObj.details.connectorId === JSON.parse(Buffer.from(message).toString('utf8'))[3].connectorId && socketObj.details.idTag === JSON.parse(Buffer.from(message).toString('utf8'))[3].idTag)


            activeSocketObj[0].socket.send(message, error => {

                if (error) {

                    console.error("error is here", error);
                }
            })


        }

        else if (JSON.parse(Buffer.from(message).toString('utf8'))[2] === "MeterValues") {

            const meterValue = JSON.parse(Buffer.from(message).toString('utf8'))[3]
            const activeSocketObj = mysockets.filter(socketObj => socketObj.details.connectorId === meterValue.connectorId)



            if (activeSocketObj) {

                activeSocketObj[0].transactionId = meterValue.transactionId;


                activeSocketObj[0].socket.send(message, error => {

                    if (error) {

                        console.error("error is here", error);



                    }

                })


            }
        }


        /*      else if(JSON.parse(Buffer.from(message).toString('utf8'))[2] === "RemoteStopTransaction"){
        
                        console.log("Remotestoptransaction not sended")
        
                 }
        */

        else if (JSON.parse(Buffer.from(message).toString('utf8'))[2] === "StopTransaction") {

            const activeSocketObj = mysockets.filter(socketObj => socketObj.transactionId === JSON.parse(Buffer.from(message).toString('utf8'))[3].transactionId)

            activeSocketObj[0].socket.send(message, error => {

                if (error) {

                    console.error("error is here", error);



                }

            })


            mysockets = mysockets.filter(socketObj => socketObj.transactionId !== activeSocketObj[0].transactionId)




        }






        else {

            console.log(`Received from client with identifier ${ws.identifier}: ${message}`);



            // Forward the message to the corresponding external WebSocket servers

            const externalWebSockets = websocketServers.get(ws.identifier) || [];


            externalWebSockets.forEach((externalWebSocket) => {

                if (externalWebSocket.readyState === WebSocket.OPEN) {


                    externalWebSocket.send(message, (error) => {

                        if (error) {

                            console.error(

                                `Error sending message to external WebSocket (${ws.identifier}):`,

                                error.message

                            );

                        }

                    });


                }

            });

        }

    });


    // Handle client disconnection

    ws.on("close", () => {

        console.log(

            `Client disconnected from primary WebSocket server with identifier: ${ws.identifier}`

        );

    });


    ws.on("error", (error) => {

        console.error(`WebSocket error with client identifier ${ws.identifier}:`, error.message);

    });

});


// Serve your Express app

app.get("/", (req, res) => {

    res.send("HTTP Server is Running");

});


// Start the HTTP server on a different port

const httpPort = process.env.HTTP_PORT || 3000;

httpServer.listen(httpPort, () => {

    console.log(`HTTP Server started on port ${httpPort}`);

});


// Define WebSocket server configurations

const externalWebSocketConfigs = [


    { identifier: "TESTPOWERONE", url: "ws://65.0.248.79:5500/TESTPOWERONE" },

    { identifier: "TESTPOWERONE", url: "ws://goeccms.numocity.com:9033/ocpp/TESTPOWERONE" }

];


// Establish connections to external WebSocket servers dynamically

externalWebSocketConfigs.forEach((config) => {

    const { identifier, url } = config;

    const externalWebSocket = connectExternalWebSocket(identifier, url);


    // Log errors for each WebSocket connection

    externalWebSocket.on("error", (error) => {

        console.error(`Error with external WebSocket (${identifier}):`, error.message);

    });

});


console.log(`WebSocket Server started on port ${websocketPort}`);