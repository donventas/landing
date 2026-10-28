'use strict';
const {createSubscriptionHandler}=require('../lib/portal-intake/subscription.cjs');
const {configuration}=require('../lib/portal-intake/runtime.cjs');
module.exports=createSubscriptionHandler(configuration());
