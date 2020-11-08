#!/usr/bin/env node
/**
 * Copyright 2019, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const util = require('util');
const uuidv1 = require('uuid/v1');
const parseArgs = require('minimist');

const DEFAULT_ACKDEAD = 90;
const DEFAULT_MAXMSG = 300;
let ackDead;
let maxMsg;
let topicName;

/** check CLI args for sanity **/
const validateArgs = function(options) {
    if (!options._[0]) { // topic not specified
        console.error('Usage: pulltop [-m <maxMessages>] [-d <ackDeadline>] <topic-name>');
        process.exit(1);
    } else {
        topicName = options._[0];
    }
    maxMsg = options.m || DEFAULT_MAXMSG;
    ackDead = options.d || DEFAULT_ACKDEAD;
}
validateArgs(parseArgs(process.argv.slice(2)));

/** manufacture subscription name **/
const SUBNAME = (process.env.USER || 'pulltop') + '-' +
      topicName.replace(/\//gi, '-') + '-' +
      uuidv1();
let sub = undefined;

/** process signal handlers to clean up subscription **/
const handleExit = function() {
    if (sub) {
        sub.delete(function (err) {
            if (err) {
                let error = util.inspect(err);
                console.error(`WARNING: could not delete subscription ${SUBNAME}: ${error}`);
            } else {
                console.error(`Subscription ${SUBNAME} deleted`);
            }
        });
    }
}


/** register exit handlers **/
process.on('exit', handleExit);
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

/** register Pub/Sub event handlers **/
const onError = function(error) {
    console.error(util.inspect(error));
    handleExit();
    process.exit(1);
}
const onMessage = function(message) {
    console.log(`${message.data}`);
    message.ack();
}

/** create subscription, register message handler **/
pubsub.createSubscription(topicName,
                          SUBNAME,
                          {
                              flowControl: {
                                  maxMessages: maxMsg
                              },
                              ackDeadline: ackDead
                          },
                          function (err, subscription) {
                              if (!err) {
                                  sub = subscription;
                                  sub.on('message', onMessage);
                                  sub.on('error', onError);
                              } else {
                                  console.error(util.inspect(err));
                                  handleExit();
                                  process.exit(1);
                              }
                          });
