// Polyfill onhashchange
(function (window) {

    // Exit if the browser implements that event
    if ("onhashchange" in window.document.body) {
        return;
    }

    var location = window.location,
        oldURL = location.href,
        oldHash = location.hash;

    // Check the location hash on a 100ms interval
    setInterval(function () {
        var newURL = location.href,
            newHash = location.hash;

        // If the hash has changed and a handler has been bound...
        if (newHash != oldHash && typeof window.onhashchange === "function") {
            // Execute the handler
            window.onhashchange({
                type: "hashchange",
                oldURL: oldURL,
                newURL: newURL
            });

            oldURL = newURL;
            oldHash = newHash;
        }
    }, window.noticeableSettings.iframe.pageChangeCheckInterval || 100);

})(window);

(function () {
    window.noticeableSettings.iframe.singlePageApp =
        window.noticeableSettings.iframe.singlePageApp === undefined ||
        window.noticeableSettings.iframe.singlePageApp === null ?
            true :
            window.noticeableSettings.iframe.singlePageApp;

    function noticeableIframeInit() {
        if ('complete' === document.readyState || 'interactive' === document.readyState) {
            noticeableIframeStart();
        } else {
            document.addEventListener('DOMContentLoaded', function (event) {
                noticeableIframeStart();
            });
        }
    }

    function noticeableIframeStart() {
        noticeableIframeDebug('Starting iframe handling');

        if (!noticeableIframeCheckSettings()) {
            return;
        }

        var iframe = document.querySelector(window.noticeableSettings.iframe.selector);
        iframe.onload = function () {
            iframe.style.visibility = 'visible';
        };


        if (!iframe) {
            console.log('Iframe not found on the current page with selector', selector);
            return;
        }

        iframe.setAttribute('scrolling', 'no');
        iframe.style.height = iframe.parentElement ? iframe.parentElement.scrollHeight + 'px' : '900px';

        window.addEventListener('message', function (event) {
            try {
                var data = JSON.parse(event.data);
            } catch (e) {
                // Payloads that cannot be parsed are not sent by Noticeable
            }

            if (data) {
                if (data.type === 'noticeable-timeline-location') {
                    noticeableIframeDebug('Received new timeline location', data);
                    var path;

                    if (noticeableStartWith(window.noticeableSettings.iframe.timelineUrl, 'https://timeline.noticeable.io/')) {
                        path = noticeableStripProjectId(data.path);
                    } else {
                        path = data.path;
                    }

                    if (window.location.hash && window.location.hash.substr(1) === path) {
                        noticeableIframeDebug('Skip location update event since new path is the same');
                    } else {
                        noticeableIframeDebug('Setting hash location to', path);

                        if (path) {
                            window.location.hash = path;
                        } else {
                            window.location.hash = '';
                        }
                    }
                } else if (data.type === 'noticeable-timeline-dimensions') {
                    noticeableIframeDebug('New iframe dimensions received', data);
                    iframe.style.height = data.height + 'px';
                }
            }
        }, false);

        if (window.noticeableSettings.iframe.singlePageApp) {
            window.onhashchange = function () {
                noticeableIframeDebug('Location change detected', window.location.href);
                noticeableIframeLoad(window.noticeableSettings.iframe.selector, window.noticeableSettings.iframe.timelineUrl);
            };
        }

        noticeableIframeLoad(window.noticeableSettings.iframe.selector, window.noticeableSettings.iframe.timelineUrl);
    }

    function noticeableIframeCheckSettings() {
        var selector = window.noticeableSettings.iframe.selector;
        var timelineUrl = window.noticeableSettings.iframe.timelineUrl;

        noticeableIframeDebug('Noticeable iframe settings', window.noticeableSettings.iframe);

        if (!selector) {
            console.error('Missing iframe selector definition.');
            return false;
        }

        if (!timelineUrl) {
            console.error('Missing timeline URL definition.');
            return false;
        }

        return true;
    }

    function noticeableIframeLoad(selector, timelineUrl) {
        var iframe = document.querySelector(selector);

        if (window.location.hash) {
            var newTimelineUrl = noticeableIframeBuildUrl(timelineUrl);
            noticeableIframeDebug('Updating timeline URL from hash', newTimelineUrl);
            if (newTimelineUrl !== iframe.src) {
                iframe.style.visibility = 'hidden';
                iframe.src = newTimelineUrl;
            } else {
                noticeableIframeDebug('Not updating iframe since URL is the same');
            }
        } else {
            noticeableIframeDebug('Updating timeline URL using root', timelineUrl);
            iframe.style.visibility = 'hidden';
            iframe.src = timelineUrl;
        }
    }

    function noticeableIframeDebug(message, object) {
        if (window.noticeableSettings.iframe && window.noticeableSettings.iframe.debug) {
            if (object) {
                console.log('[DEBUG] ' + message, object);
            } else {
                console.log('[DEBUG] ' + message);
            }
        }
    }

    function noticeableIframeBuildUrl(timelineUrl) {
        var timelineUrlChunks = timelineUrl.split('?');
        var newTimelineUrl = timelineUrlChunks[0] + window.location.hash.replace('#', '/');
        if (timelineUrlChunks.length > 1) {
            newTimelineUrl += '?' + timelineUrlChunks[1];
        }
        return newTimelineUrl;
    }

    function noticeableStripProjectId(path) {
        var index = 0;

        if (path.indexOf('/') === 0) {
            index = 1;
        }

        index = path.indexOf('/', index);

        if (index > -1) {
            return path.substr(index + 1);
        } else {
            return '';
        }
    }

    function noticeableStartWith(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    }

    noticeableIframeInit();
})();
