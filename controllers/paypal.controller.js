var config  = require('config');
var express = require('express');
var paypal  = require('paypal-rest-sdk');
var nodemailer = require('nodemailer');
var router  = express.Router();
var openIdConnect = paypal.openIdConnect;

var paypalService = require('../services/paypal.service');

router.get('/balance/:id', getBalance);
router.get('/emailConfirm/:user_id', emailConfirm);
router.get('/getChargeHistory/:user_id', getChargeHistory);
router.post('/createPayment', createPayment);
router.post('/executePayment', executePayment);
router.post('/balance', setBalance);
router.post('/history/:user_id', rechargeHistory);

module.exports = router;
 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AVvkTTWrEfclkAMz9IJt3FS8tdbw1fzL5843myAMorUu6PR1J_ViI6XbHCFew7xBJ8dVYXZ2KvF9E8x7',
    'client_secret': 'EErvUfRiiBsKuF9cV1vOJxdkqzFu6k1Syd3g_IjvxxauTyQ5m7E6oDj8AsZHYtoXJZZJ3cXVf35boi0a',
    'headers' : {
		'custom': 'header'
    }});

function getChargeHistory(req, res) {
    var userID = req.params.user_id;
    paypalService.getChargeHistory(userID)
        .then(result => res.status(200).send(result))
        .catch(err => req.status(400).send(err));
}

function emailConfirm(req, res) {
    var userID = req.params.user_id;
    paypalService.getUserInfo(userID)
        .then(function(info) {
            // info = JSON.stringify(info);
            var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth   : {
                        user  : 'apple930108@gmail.com',
                        pass  : 'Ajgkfwjfwkeaj108'
                    }
                });
                var validationEmail = config.host + ':4000' ;
                var mailOptions = {
                    from    : 'Hollywood Telecom Inc',
                    to      : info.email,
                    subject : 'Hollywood Telecom Inc',
                    html    : '<p><b>Hi ' + info.name +
                            '</b><br/><br/>Welcome to Hollywood Telecom Inc ' +
                            '<p>We have recently received your payment via Paypal account. <br/><a href="' + validationEmail +'">Hollywood Telecom Inc</a></p>',
                 
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) res.status(400).send(error);
                    if (info) {
                        res.status(200).send(info);
                    }
                });
        })
        .catch(err => req.status(400).send(err));
    
}

function getBalance(req, res) {
    paypalService.getBalance(req.params.id)
        .then(
            response => res.status(200).send(response)
        )
        .catch( err => res.status(400).send(err));
}

function setBalance(req, res) {
    paypalService.setBalance(req.body)
        .then(
            response => res.status(200).send(response.toString())
        );
}
    
function rechargeHistory(req, res) {
    var userID = req.params.user_id;
    paypalService.rechargeHistory(req.body, userID)
        .then(
            response => res.status(200).send(response)
        )
        .catch( err => res.status(400).send(err));
}

function createPayment(req, res) {
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:4000/auth/paypal/callback",
                "cancel_url": "http://localhost:4000/auth/paypal/failure"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "item",
                        "sku": "item",
                        "price": "30.00",
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": "30.00"
                },
                "description": "Sandbox paypal REST API test"
            }]
        };
        var payment_id = req.body.payment_id;
        paypal.payment.create(create_payment_json, function(error, payment) {
            if (error) {
                console.log('\n', error);
                throw error;
            } else {
                 for (var index = 0; index < payment.links.length; index++) {
                    //Redirect user to this endpoint for redirect url
                        if (payment.links[index].rel === 'approval_url') {
                            console.log(payment.links[index].href);
                        }
                }
                console.log('\n');
                console.log("paypal payment create instance", payment);
                res.status(200).send(payment);
            }
        });
}

function executePayment(req, res) {
    console.log("Here is exec function of the paypal controller\n", req.body);
    var payment_id = req.body.paymentID;
    var payer_id   = req.body.payerID;
    var execute_payment_json = {
        "payer_id": payer_id,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "30.00"
            }
        }]
    };
    paypal.payment.execute(payment_id, execute_payment_json, function(error, payment){
        console.log("Here is a paypal exec area\n");
        if (error) {
            console.log("Payment execute error", error);
            throw error;
        } else {
            console.log("Get payment response:: ", payment);
            res.status(200).send(payment);
        }
    });
}

function openID() {
      console.log(openIdConnect.authorizeUrl({'scope': 'openid profile'}));

        // With Authorizatiion code
        openIdConnect.tokeninfo.create("Basic QVZ2a1RUV3JFZmNsa0FNejlJSnQzRlM4dGRidzFmekw1ODQzbXlBTW9yVXU2UFIxSl9WaUk2WGJIQ0Zldzd4Qko4ZFZZWFoyS3ZGOUU4eDc6RUVydlVmUmlpQnNLdUY5Y1Yxdk9KeGRrcXpGdTZrMVN5ZDNnX0lqdnh4YXVUeVE1bTdFNm9EajhBc1pIWXRvWEpaWkozY1hWZjM1Ym9pMGE", function (error, tokeninfo) {
            if (error) {
                throw error;
            } else {
                openIdConnect.userinfo.get(tokeninfo.access_token, function (error, userinfo) {
                    if (error) {
                        throw error;
                    } else {
                        console.log(tokeninfo + '\n');
                        console.log(userinfo + '\n');
                        // Logout url
                        console.log(openIdConnect.logoutUrl({ 'id_token': tokeninfo.id_token }));
                    }
                });
            }
        });

        // With Refresh token
        openIdConnect.tokeninfo.refresh("Replace with refresh_token", function (error, tokeninfo) {
            if (error) {
                console.log(error);
        
            } else {
                openIdConnect.userinfo.get(tokeninfo.access_token, function (error, userinfo) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(tokeninfo);
                        console.log(userinfo);
                       
                    }
                });
            }
        });
}