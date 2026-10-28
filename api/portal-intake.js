'use strict';
const {createHandler}=require('../lib/portal-intake/service.cjs');
const {configuration}=require('../lib/portal-intake/runtime.cjs');
// Fail closed unless the isolated backend is explicitly configured for production.
module.exports=createHandler(configuration());
