'use strict';
const {configuration}=require('../lib/article-comments/runtime.cjs');
const {createSubscriptionHandler}=require('../lib/article-comments/subscription.cjs');
const { reviewResponse } = require('../lib/preview-safety.cjs');
module.exports=(req,res)=>{
  if (reviewResponse(req,res,'article-subscription')) return;
  return createSubscriptionHandler(configuration())(req,res);
};
