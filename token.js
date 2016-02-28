var constants = require("./constants.js");
var jwt = require('jwt-simple');
var uuid = require('uuid4');
var request = require('request');
var rp = require('bluebird');
var fs = require('fs')
var ph =require("./poyntheader.js");
var base64 = require("base64-js");
var moment = require("moment");
function Token() {

   var getToken = function(req){
        return new Promise(function(resolve, reject){
            
            var payload = {
                'exp': Math.round(+new Date().setMinutes(300)/1000),
                'iat': Date.now(),
                'iss': req.appId,
                'sub': req.appId,
                'aud': constants.POYNT_URL,
                'jti': uuid().toString()
            }
            //read the private key..would store in DB as base 64 string and decode as utf8 for use here
            fs.readFile(constants.KEY_PATH_AND_NAME, 'utf8', function(err, contents){            

                // var c = new Buffer(contents).toString('base64');
                
                // var b = new Buffer(c, 'base64').toString('utf8');

                // encode and sign
                var token = jwt.encode(payload, contents, 'RS256');
                //console.log(token); //=> { foo: 'bar' } 

                // decode as a test
                //var decoded = jwt.decode(token, contents, 'RS256');
                //console.log(decoded); //=> { foo: 'bar' } 
                var postdata; 
                if(req.refreshTokenCode){
                    postdata = {'grantType':'REFRESH_TOKEN', 'refreshToken':req.refreshTokenCode};
                }else{
                    postdata = {'grantType':'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion':token};
                }
                
                request({
                    url: constants.POYNT_URL + '/token',
                    method: 'POST',
                    body: require('querystring').stringify(postdata),
                    headers: ph().getTokenHeader()
                    }, function (error, response, body){
                            if (error) {
                                console.log(error);
                                reject(error);
                            } else {
                                var tokenResp;
                                try{
                                    tokenResp = JSON.parse(body); 
                                    var poyntToken = {};
                                    
                                    var poyntJWT = jwt.decode(tokenResp.accessToken, token, 'RS256');
                                    var day = moment.unix(poyntJWT.exp);
                                    
                                    poyntToken.accessToken = tokenResp.accessToken;
                                    poyntToken.GMTExpiration =day.utc().format();
                                    poyntToken.refreshTokenCode =  tokenResp.refreshToken;                                    
                                }catch(e)
                                {
                                    console.log(error);
                                    reject(error);                                
                                }
                                resolve(poyntToken);
                            }
                    });
            
            });

        });
   }
   
  return {
    getToken: getToken
  }
}

module.exports = Token;

