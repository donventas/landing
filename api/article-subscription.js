'use strict';
const {configuration}=require('../lib/article-comments/runtime.cjs');
const {createSubscriptionHandler}=require('../lib/article-comments/subscription.cjs');
module.exports=(req,res)=>createSubscriptionHandler(configuration())(req,res);
