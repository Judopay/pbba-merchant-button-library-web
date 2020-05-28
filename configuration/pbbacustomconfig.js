
/** Copyright 2016 IPCO 2012 Limited

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

/*
 * This configuration file is used to define and override variables and functions for the Pay By Bank App Branded or Custom Web Merchant Button.
 *
 * As a default implementation, this file contains the Branded Web Merchant Button implementation.
 *
 * If you want to implement the custom web merchant button, then copy the contents of pbbacustomconfig_custom.template into this file.
 *
 * If you want to implement the branded web merchant button, then copy the contents of pbbacustomconfig_branded.template into this file.
 *
 */


/* Define the PBBA variables */

var zappVersion = "3.1.1"; // Current web merchant button library version.
var cookieManagementUrl = "https://paybybankappcookie.mastercard.co.uk/static/cookie-management/pbba-3550ce7763041531b9214e9e23986b37/" // Cookie management URL for PayConnect.
var merchantPollInterval = 2000; // Default merchant poll interval of 5 seconds to poll the merchant server for payment notification.
var cfiLogosURL = "https://paybybankappcdn.mastercard.co.uk/static/ml/pbba-3550ce7763041531b9214e9e23986b37/merchant-lib/banks.json"; // CDN location to fetch the CFI logos
var orderId = null;
var paymentToken = null;

/* Initialize PayConnect. */

window.onload = function () {
	setupPayConnect(cookieManagementUrl, document);

}

/* Override the pay() and notify() functions.  */

zapp.load(zappVersion, {
	pay: function (data, callback) {

		let merchantRequestToPayPostData = data.saleRequest
		let paymentToken = data.paymentToken
		merchantRequestToPayPostData.payConnectID = null

		if (typeof data.pcid !== "undefined")
			merchantRequestToPayPostData.payConnectID = data.pcid; //Merchant specific JSON object merchantRequestToPayPostData.payConnectID

		window.judo.invokePaymentWithPBBA(paymentToken, merchantRequestToPayPostData).then(response => {
			var merchantRequestToPayResponseObject = {
				secureToken: response.secureToken,
				pbbaCode: response.pbbaCode,
				retrievalTimeOutPeriod: 60,
				confirmationTimeoutPeriod: 120,
				cookieSentStatus: "1",
				bankName: "PBBABANK"
			}

			this.orderId = response.orderId;
			this.paymentToken = paymentToken;

			var response = new zapppopup.response.payment({
				success: true, // Leave it as is
				secureToken: merchantRequestToPayResponseObject.secureToken,
				brn: merchantRequestToPayResponseObject.pbbaCode,
				retrievalExpiryInterval: merchantRequestToPayResponseObject.retrievalTimeOutPeriod,
				confirmationExpiryInterval: merchantRequestToPayResponseObject.confirmationTimeoutPeriod,
				notificationSent: merchantRequestToPayResponseObject.cookieSentStatus,
				pcid: null, // Leave it as is
				cfiShortName: merchantRequestToPayResponseObject.bankName
			});
			callback(response);
		})
			.catch(error => {

				var response = new zapppopup.response.payment({
					success: false, // Leave it as is
					data: error // MerchantErrorJSONObject is assumed to be merchant naming for their error object
				});
				callback(response);




				var response = new zapppopup.response.payment({
					success: true, // Leave it as is
					secureToken: merchantRequestToPayResponseObject.secureToken,
					brn: merchantRequestToPayResponseObject.pbbaCode,
					retrievalExpiryInterval: merchantRequestToPayResponseObject.retrievalTimeOutPeriod,
					confirmationExpiryInterval: merchantRequestToPayResponseObject.confirmationTimeoutPeriod,
					notificationSent: merchantRequestToPayResponseObject.cookieSentStatus,
					pcid: null, // Leave it as is
					cfiShortName: merchantRequestToPayResponseObject.bankName
				});
				callback(response);
			})



	},
	notify: function (secureToken, callback) {
		window.judo.startPBBAPolling(this.orderId, this.paymentToken)
			.then(response => {
				var pollinggResponse = new zapppopup.response.notify({ success: false });
				// response.orderDetails.orderStatus = "SUCCESS"		
				if (response.orderDetails.orderStatus === "SUCCESS") {
					pollinggResponse.success = true
					document.getElementById("brnIframe").remove()
					//SEND MESSAGE WITH SUCCES 
				}
				callback(pollinggResponse)
			})
			.catch(error => {
				var pollinggResponse = new zapppopup.response.notify({ success: true });
				callback(pollinggResponse)
			})
	},


	error: function (errors) {
		console.log("ERROR HANDLING METHOD")
	},
	cookieManagementUrl: cookieManagementUrl,
	merchantPollInterval: merchantPollInterval,
	cfiLogosURL: cfiLogosURL
});