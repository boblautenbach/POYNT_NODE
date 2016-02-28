var constants = require("./constants.js");
var uuid = require('uuid4');
var request = require('request');
var rp = require('bluebird');
var ph =require("./poyntheader.js");

function Transaction() {

   var postTransaction = function(req){
        return new Promise(function(resolve, reject){
            
            var cloudMessage = {
                ttl: 500,
                businessId: req.businessId,
                storeId: req.storeId,
                data: "{'deviceId':'" + req.deviceId + "','action':'" + req.tenderType + "', 'purchaseAmount': " + req.purchaseAmt + ", 'tipAmount': " + req.tipAmt + ", 'currency':'USD', 'transactionId':'" + req.transId + "','referenceId':'" + req.refId + "', 'callbackUrl':'" + encodeURIComponent(req.callback) + "'}"
            };	

            request({
                url: constants.POYNT_URL + '/cloudMessages',
                method: 'POST',
                json:true,
                body: cloudMessage,
                headers: ph().getSecuredHeader(req.accessToken)
            }, function (error, response, body){
                if(error){
                    console.log(error);
                    reject(error);
                }else{
                    var transResponse = {
                        status : '',
                        statusMessage : ''                
                    };
                    transResponse.status = response.statusCode;
                    transResponse.statusMessage = response.statusMessage;                        
                    if(response.statusCode == '401'){//bad/invalid/expired accesscode
                        transResponse.statusMessage = 'INVALID_TOKEN';
                    }
                    resolve(transResponse);  
                }
            });
        });
   }
   
  return {
    postTransaction: postTransaction
  }
}

module.exports = Transaction;

