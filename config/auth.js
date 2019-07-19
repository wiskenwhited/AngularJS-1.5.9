// config/auth.js
var config = require('config');
module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here', 
        'callbackURL'   :  config.host + ':4000/auth/facebook/callback'
    },

    
    'googleAuth' : {
        'clientID'      : '627725813702-41rh8ri65rdikbmlae950n1slu673lc8.apps.googleusercontent.com',
        'clientSecret'  : 'rpDafhSI75MOyYhjLcE2ZkCR',
        'callbackURL'   :  config.host + ':4000/auth/google/callback'
    },

    'linkedin': {
        'clientID'      : '86ecdw9eyij0na',
        'clientSecret'  : 'sJOvvzk3JKo79fVR',
        'callbackURL'   :  config.host + ":4000/auth/linkedin/callback",
    },

    'paypal': {
        'clientID'      : 'AVvkTTWrEfclkAMz9IJt3FS8tdbw1fzL5843myAMorUu6PR1J_ViI6XbHCFew7xBJ8dVYXZ2KvF9E8x7',
        'clientSecret'  : 'EErvUfRiiBsKuF9cV1vOJxdkqzFu6k1Syd3g_IjvxxauTyQ5m7E6oDj8AsZHYtoXJZZJ3cXVf35boi0a',
        'callbackURL'   :  config.host + ':4000/auth/paypal/callback',
        'btnID'         : 'telecomPaypalProcess',
        'accesstoken'   : 'access_token$sandbox$pxjfkkq8bq6njj5b$de422f29243a4bb49ad554a650c60f48'
    }

};


//Button javascript build generator
/*************************************** 
<span id='telecomPaypalProcess'></span>
<script src='https://www.paypalobjects.com/js/external/api.js'></script>
<script>
paypal.use( ['login'], function (login) {
  login.render ({
    "appid":"AVvkTTWrEfclkAMz9IJt3FS8tdbw1fzL5843myAMorUu6PR1J_ViI6XbHCFew7xBJ8dVYXZ2KvF9E8x7",
    "authend":"sandbox",
    "scopes":"openid",
    "containerid":"telecomPaypalProcess",
    "locale":"en-us",
    "returnurl":"http://localhost:4000/auth/paypal/callback"
  });
});
</script>
****************************************/