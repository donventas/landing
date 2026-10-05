/* Local-only visible instrumentation. No cookies, storage, form values or identifiers. */
(function () {
  'use strict';
  if (location.hostname !== 'localhost' || location.port !== '8786') return;
  var lcp = 0, cls = 0, longTasks = [], violations = [];
  function observe(type, callback) {
    try {new PerformanceObserver(function (list) {list.getEntries().forEach(callback);}).observe({type:type,buffered:true});} catch (_) {}
  }
  observe('largest-contentful-paint', function (entry) {lcp = entry.startTime;});
  observe('layout-shift', function (entry) {if (!entry.hadRecentInput) cls += entry.value;});
  observe('longtask', function (entry) {longTasks.push({at:entry.startTime, ms:entry.duration});});
  document.addEventListener('securitypolicyviolation', function (event) {
    var origin = event.blockedURI;
    try {origin = new URL(origin).origin;} catch (_) {}
    var value = event.effectiveDirective + ': ' + origin;
    if (violations.indexOf(value)<0) violations.push(value);
  });
  document.addEventListener('DOMContentLoaded', function () {
    var panel = document.createElement('details');
    panel.id = 'qa-health';
    panel.innerHTML = '<summary>QA local: carga y CSP (no es Lighthouse ni datos de campo)</summary><pre></pre>';
    document.body.appendChild(panel);
    var output = panel.querySelector('pre');
    function update() {
      var resources = performance.getEntriesByType('resource');
      var google = resources.filter(function (r) {return /google-analytics\.com|googletagmanager\.com/.test(new URL(r.name).hostname);});
      var nav = performance.getEntriesByType('navigation')[0];
      output.textContent = JSON.stringify({
        viewport:innerWidth, lcpObservedMs:Math.round(lcp), clsObserved:Math.round(cls*10000)/10000,
        domContentLoadedMs:nav?Math.round(nav.domContentLoadedEventEnd):null,
        observationSeconds:Math.round(performance.now()/1000),
        initial10sComplete:performance.now()>=10000,
        initial10sLongTaskCount:longTasks.filter(function(e){return e.at<10000;}).length,
        initial10sBlockingMs:Math.round(longTasks.filter(function(e){return e.at<10000;}).reduce(function(s,e){return s+Math.max(0,e.ms-50);},0)),
        lifetimeLongTaskCount:longTasks.length,
        googleResources:google.map(function (r) {var u=new URL(r.name);return {origin:u.origin,path:u.pathname,ms:Math.round(r.duration)};}),
        cspViolations:violations,
        limits:'Unthrottled local browser; CLS is a sum, not the CWV session-window metric; initial 10s blocking is not Lighthouse TBT; resource presence is not GA receipt; observer adds overhead; not INP or p75.'
      },null,2);
    }
    panel.addEventListener('toggle',update);
    setInterval(update,2000);
    update();
  });
})();
