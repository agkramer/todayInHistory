/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, what happened this day in history?"
 *  Alexa: "On this day in the year ..."
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.38915e1b-4881-480b-86e0-777dfac6ee1e"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";



/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var request = require('./node_modules/request');
/**
 * TodayInHistory is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var TodayInHistory = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
TodayInHistory.prototype = Object.create(AlexaSkill.prototype);
TodayInHistory.prototype.constructor = TodayInHistory;

TodayInHistory.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("TodayInHistory onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

TodayInHistory.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("TodayInHistory onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleGetTodayInHistoryRequest(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
TodayInHistory.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("TodayInHistory onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

TodayInHistory.prototype.intentHandlers = {
    "GetTodayInHistoryData": function (intent, session, response) {
        handleGetTodayInHistoryRequest(response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask today in history what happened on this day in history, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleGetTodayInHistoryRequest(response) {

    var alexaResponse = response;

    request('http://history.muffinlabs.com/date', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        json = JSON.parse(body)

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var eventArray = json["data"]["Events"];

        var event = eventArray[getRandomInt(0,eventArray.length)];
        var speechOutput = "On this day in the year " + event["year"] + ", " + event["text"];
        alexaResponse.tellWithCard(speechOutput, "DayInHistory", speechOutput);
      }
    })
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the TodayInHistory skill.
    var todayInHistory = new TodayInHistory();
    todayInHistory.execute(event, context);
};
