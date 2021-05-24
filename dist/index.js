(() => {
  // src/index.js
  var url = window.location.href;
  var timestamp = new Date();
  var API_URL = "https://api-perf-analytics.herokuapp.com/metrics";
  var sendRequest = (ttfb, domLoad, windowLoadEvents, resources) => {
    const request = setInterval(() => {
      let data = {
        url,
        ttfb,
        fcp,
        domLoad,
        windowLoadEvents,
        timestamp: timestamp.toISOString(),
        resources
      };
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(() => console.log("Successfully saved metrics.")).catch((err) => console.error(err));
      clearInterval(request);
    }, 500);
  };
  var millisToSeconds = (ms) => ms / 1e3;
  var measurePerformance = () => {
    const { responseStart, navigationStart, domContentLoadedEventEnd } = window.performance.toJSON().timing;
    const ttfb = millisToSeconds(responseStart - navigationStart);
    const domLoad = millisToSeconds(domContentLoadedEventEnd - navigationStart);
    const windowLoadEvents = millisToSeconds(timestamp - navigationStart);
    const resourceEntries = window.performance.getEntriesByType("resource");
    const resources = resourceEntries.map((entry) => {
      return {
        type: entry.initiatorType,
        source: entry.name,
        responseTime: millisToSeconds(entry.responseEnd - entry.responseStart),
        executionTime: millisToSeconds(entry.responseEnd - entry.fetchStart),
        fetchTime: millisToSeconds(entry.responseEnd - entry.fetchStart)
      };
    });
    sendRequest(ttfb, domLoad, windowLoadEvents, resources);
  };
  window.addEventListener("load", () => {
    if ("performance" in window && "PerformanceObserver" in window) {
      let perfObserver = new PerformanceObserver((entryList) => {
        fcp = millisToSeconds(entryList.getEntriesByName("first-contentful-paint")[0].startTime);
      });
      perfObserver.observe({ type: "paint", buffered: true });
      measurePerformance();
    } else {
      console.error("Error: Browser is not supported currently.");
    }
  });
})();
