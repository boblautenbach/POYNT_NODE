var constants = require("./constants");
var uuid = require('uuid4');

function PoyntHeader (){
    
    var getTokenHeader = function(){
        return  {'content-type':'application/x-www-form-urlencoded','api-version':constants.API_VER,'User-Agent': constants.USER_AGENT,'Poynt-Request-Id': uuid() };
    }
    
    var getSecuredHeader = function(token){
        return  {'Content-Type':'application/json;charset=UTF-8','api-version':constants.API_VER,'User-Agent': constants.USER_AGENT ,'Poynt-Request-Id': uuid(), 'Authorization': 'BEARER ' + token };
    }     
    
    return{
        getTokenHeader : getTokenHeader,
        getSecuredHeader : getSecuredHeader
     }
 }
 
 module.exports = PoyntHeader;