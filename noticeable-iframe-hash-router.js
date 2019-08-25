(function() {
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

        window.addEventListener('message', function (event) {
            try {
                var data = JSON.parse(event.data);
            } catch (e) {
                // Payloads that cannot be parsed are not sent by Noticeable
            }

            if (data && data.type === 'noticeable-timeline-location') {
                var path = noticeableStripProjectId(data.path);

                if (path) {
                    location.hash = path;
                } else {
                    location.hash = '';
                }
            }
        }, false);

        var oldLocation = location.href;
        setInterval(function () {
            if (oldLocation && location.href !== oldLocation) {
                noticeableIframeDebug('Location change detected', location.href);
                noticeableIframeLoad(window.noticeableSettings.iframe.selector, window.noticeableSettings.iframe.timelineUrl);
                oldLocation = location.href
            }
        }, window.noticeableSettings.iframe.pageChangeCheckInterval || 240);

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

        if (!iframe) {
            noticeableIframeDebug('Iframe not found on the current page with selector', selector);
            return;
        }

        if (location.hash) {
            var newTimelineUrl = noticeableIframeBuildUrl(timelineUrl);
            noticeableIframeDebug('Updating timeline URL', newTimelineUrl);
            iframe.src = newTimelineUrl;
        } else {
            noticeableIframeDebug('Updating timeline URL', timelineUrl);
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
        var newTimelineUrl = timelineUrlChunks[0] + location.hash.replace('#', '/');
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

    noticeableIframeInit();
})();
