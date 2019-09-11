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

        if (!iframe) {
            console.log('Iframe not found on the current page with selector', selector);
            return;
        }

        iframe.setAttribute('scrolling', 'no');
        iframe.style.height = '900px';

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

                    noticeableIframeDebug('Setting hash location to', path);

                    if (path) {
                        location.hash = path;
                    } else {
                        location.hash = '';
                    }
                } else if (data.type === 'noticeable-timeline-dimensions') {
                    noticeableIframeDebug('New iframe dimensions received', data);
                    iframe.style.height = data.height + 'px';
                }
            }
        }, false);

        if (window.noticeableSettings.iframe.singlePageApp) {
            var oldLocation = location.href;
            setInterval(function () {
                if (oldLocation && location.href !== oldLocation) {
                    noticeableIframeDebug('Location change detected', location.href);
                    noticeableIframeLoad(window.noticeableSettings.iframe.selector, window.noticeableSettings.iframe.timelineUrl);
                    oldLocation = location.href
                }
            }, window.noticeableSettings.iframe.pageChangeCheckInterval || 240);
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

        if (location.hash) {
            var newTimelineUrl = noticeableIframeBuildUrl(timelineUrl);
            noticeableIframeDebug('Updating timeline URL from hash', newTimelineUrl);
            iframe.src = newTimelineUrl;
        } else {
            noticeableIframeDebug('Updating timeline URL using root', timelineUrl);
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

    function noticeableStartWith(str, word) {
        return str.lastIndexOf(word, 0) === 0;
    }

    noticeableIframeInit();
})();
