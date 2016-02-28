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



##Step 3: Post a Transaction to the POYNT Bridge and Initialize the Payment Device to start the payment flow
The POYNT Device is activated by the POYNT Cloud Messaging Bridge (not through direct access from the POS).  The POYNT Cloud receives the POST from the below endpoint and triggers the POYNT reader to start the payment flow interaction (CC payment, etc.).

When you POST to the POYNT Cloud Bridge, you will receive an immediate response object.  Only when the payment flow has completed will you then receive the resulting data packet about the transaction posted.  This is basically a callback process, where we provide the callback destination endpoint to POYNT.

I am using a site call http://requestb.in to test the callback functionality and to inspect the data packet(works very well).

A note on the format of the request body; dollar amounts should be written as follows: 100 = 1.00, 1200 = 12.00, etc.

Endpoint:  POST localhost:3000/api/transaction
{
    "businessId":"YOUR BIZ ID FROM POYNT DASHBOARD",
    "storeId": "OUR STORE ID ID FROM POYNT DASHBOARD",
    "deviceId": "urn:tid:4a3e0f28-f8d7-3a4a-aa24-43d76bd54dae", =>>get this from Store teminal list on poynt dashboard
    "tenderType": "authorize",
    "purchaseAmt": 1256,
    "tipAmt": 150,
    "transId":"11323123",
    "refId":"someglobalId",
    "callback": "http://requestb.in/12andiw1",
    "accessToken": "TOKEN FROM STEP ONE"
}

Response(s):
The response if “ACCEPTED”
{
  "status": 202,
  "statusMessage": "Accepted"
}

The response will be the following if the token is invalid/expired:
{
  "status": 401,
  "statusMessage": "INVALID_TOKEN"
}

Callback Response:
If payment flow is cancelled by hitting Cancel on the POYNT device, the resulting callback will send: 

{"referenceId":"someglobalId","status":"CANCELED”}


If a transaction is completed (not cancelled), the resulting callback will similar to this:

{"referenceId":"someglobalId","status":"PROCESSED","transactions":[{"action":"AUTHORIZE","amounts":{"cashbackAmount":0,"currency":"USD","orderAmount":1256,"tipAmount":0,"transactionAmount":1256},"authOnly":true,"context":{"businessId":"022667c0-4a05-4b6b-bb84-d291eddf850c","businessType":"TEST_MERCHANT","employeeUserId":1566638,"mcc":"5812","source":"INSTORE","storeDeviceId":"urn:tid:4a3e0f28-f8d7-3a4a-aa24-43d76bd54dae","storeId":"934d8145-71c0-4978-9eb5-b701b2390419","transmissionAtLocal":"2016-02-11T19:53:39Z"},"createdAt":"2016-02-11T19:53:39Z","customerUserId":1566639,"fundingSource":{"card":{"cardHolderFirstName":"AMEX","cardHolderFullName":"CARD/AMEX","cardHolderLastName":"CARD","encrypted":false,"expirationMonth":12,"expirationYear":2019,"id":56033,"keySerialNumber":"000003F01A600011","numberFirst6":"340000","numberLast4":"0009","numberMasked":"340000******0009","type":"AMERICAN_EXPRESS"},"emvData":{"emvTags":{"0x5F20":"434152442F414D455820"}},"entryDetails":{"customerPresenceStatus":"PRESENT","entryMode":"KEYED"},"type":"CREDIT_DEBIT"},"id":"4e97f3c4-6631-4ffb-9231-c7e12edb6969","processorResponse":{"acquirer":"FIRST_DATA","approvalCode":"757EFC","approvedAmount":1256,"avsResult":{},"emvTags":{},"processor":"CREDITCALL","status":"Successful","statusCode":"1","transactionId":"317ba324-f9d0-e511-bb26-0050569228c2"},"references":[{"customType":"referenceId","id":"someglobalId","type":"CUSTOM"}],"status":"AUTHORIZED","updatedAt":"2016-02-11T19:53:39Z"}]}

