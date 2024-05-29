async function init_matchmaking_socket() {
    const exampleSocket = new WebSocket('wss://localhost:8000/cupidon/matchmaking/ws/');
    const Id = g_userId;
    
    exampleSocket.onopen = function(event) {
        console.log("Mathcmaking socket opened in the front");
        sendPlayerData("playerData");
    };
    
    exampleSocket.onclose = function() {
        console.log("Matchmaking socket closed in the front");
        sendData("Leaving");
    }
    
    exampleSocket.onerror = function(event) {
        console.log("Socket error");
    }
    
    exampleSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === "redirect") {
            init_socket("test")
        }
    };
    
    console.log(Id)
    
    function sendPlayerData(type) {
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        const data = {
            type: type,
            id: Id, // A recuperer depuis la db
            elo: 500, // A recuperer depuis la db, le back va le recuperer
        };
      
        // Send the msg object as a JSON-formatted string.
        exampleSocket.send(JSON.stringify(data));
    }
    
    function sendData(type) {
        const data = {
            type: type,
        };
    
        exampleSocket.send(JSON.stringify(data));
    }
    
    function ping() {
        sendData('ping');
    }
    
    exampleSocket.addEventListener('open', (event) => {
        const intervalID = setInterval(ping, 10000); // Juste envoyer sendData('ping') ?
    });
}

