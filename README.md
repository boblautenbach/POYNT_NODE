# POYNT Paymnet Device Node API


##Step 1: Acquire a 24hr Access Token from the POYNT API Service

To access the POYNT Bridge or API you must have a valid POYNT Access token.  The tokens expire within 24hrs.   You can refresh the access token by simple re-calling the endpoint below.  The token should be cached locally (locally could be the POS device or the Salesforce server API (using something like redis).  Also note that the private RSA Key that was created when the POYNT Cloud create must we stored/made accessible to this method to generate a JWT. I am currently storing the key in a key.pem file accessible to the Node API

Endpoint:	POST http://localhost:3000/api/token/

Request:
{
    "appId":"YOUR APP ID FROM http://poynt.net/dashboard",
    "refreshTokenCode": ""
}

refreshTokenCode: if you use the refreshTokenCode value from a previous token creation or leave it as “ ”, you will receive a new token.  

Recommend modifying the request to add the private key as a base64 string vs. pulling from a key file

Response:
{
  "accessToken": "A TOKEN FROM POYNT",
  "GMTExpiration": "2016-02-17T04:02:17.484Z",
  "refreshTokenCode": "A REFRESH TOKEN FROM POYNT"
}

GMTExpiration value is the date/time of expiration for the given token.   You need to account for the expiration and pull a new token every 20 hrs (or so) to ensure we never encounter a 401 error with POYNT.  This can be implemented on the POS device at login or on the server via some for of trigger.
If you receive only a GMTExpiration value from the request POST, there was an issue interacting with the POYNT endpoint.



##Step 2: Post a Transaction to the POYNT Bridge and Initialize the Payment Device to start the payment flow
The POYNT Device is activated by the POYNT Cloud Messaging Bridge (not through direct access from the POS).  The POYNT Cloud receives the POST from the below endpoint and triggers the POYNT reader to start the payment flow interaction (CC payment, etc.).

When you POST to the POYNT Cloud Bridge, you will receive an immediate response object.  Only when the payment flow has completed will you then receive the resulting data packet about the transaction posted.  This is basically a callback process, where we provide the callback destination endpoint to POYNT.

I am using a site call http://requestb.in to test the callback functionality and to inspect the data packet(works very well).

A note on the format of the request body; dollar amounts should be written as follows: 100 = 1.00, 1200 = 12.00, etc.

Endpoint:  POST localhost:3000/api/transaction

Request:<br>
{<BR>
    "businessId":"YOUR BIZ ID FROM POYNT DASHBOARD",<BR>
    "storeId": "OUR STORE ID ID FROM POYNT DASHBOARD",<BR>
    "deviceId": "urn:tid:4a3e0f28-f8d7-3a4a-aa24-43d76bd54dae", =>>get this from Store teminal list on poynt dashboard<BR>
    "tenderType": "authorize",<BR>
    "purchaseAmt": 1256,<BR>
    "tipAmt": 150,<BR>
    "transId":"11323123",<BR>
    "refId":"someglobalId",<BR>
    "callback": "http://requestb.in/12andiw1",<BR>
    "accessToken": "TOKEN FROM STEP ONE"<BR>
}<BR>

Response(s):<BR>
The response if “ACCEPTED”<BR>
{<BR>
  "status": 202,<BR>
  "statusMessage": "Accepted"<BR>
}<BR>

The response will be the following if the token is invalid/expired:<BR>
{<BR>
  "status": 401,<BR>
  "statusMessage": "INVALID_TOKEN"<BR>
}<BR>

Callback Response:<BR>
If payment flow is cancelled by hitting Cancel on the POYNT device, the resulting callback will send: <BR>

{"referenceId":"someglobalId","status":"CANCELED”}<BR>


If a transaction is completed (not cancelled), the resulting callback will send a json callback response.

