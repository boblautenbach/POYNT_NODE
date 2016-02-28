var Token = require("./token.js");
var Transaction = require("./transaction.js");

module.exports = function(router){
    
    // Provide all routes here, this is for Home page.
    router.get("/",function(req,res){
    res.json({"message" : "No functionality available at this level"});
    });

    //Get a valid poynt token used for all other api calls
    //param: appid (poynt cloud appId)
    //Would pass the base64 key in in the body
    router.post("/token",function(req,res, next){
    var token = Token();
    
    token.getToken(req.body)
        .then(function(data){
            res.json(data);
        })
        .catch(next);
    });

    //POST a transaction to Poynt Cloud
    //object: businessId, storeId, accessToken, deviceId (returned from .getDeviceId above),
    //purchaseAmt (num), tipAmt (num), refId, transId, callback, tenderType (authorize, sale, etc)
    router.post("/transaction",function(req,res, next){
        var payment = Transaction();
        
        payment.postTransaction(req.body)
            .then(function(data){
                res.json(data);
            })
            .catch(next); 
    });

}