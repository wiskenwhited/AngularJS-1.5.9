module.exports  = function (req, res, next) {
    res.sseSetup = function() {
        res.writeHead(200, {
            'Content-Type':'text/event-stream',
            'Cache-Control' : 'no-cache',
            'Connection': 'keep-alive'
        })
    }

    res.sseSend = function(data) {
        console.log("Server Send Event");
        res.write("data:" + JSON.stringify(data) + "\n\n");
    }
    next();

}