document.addEventListener("DOMContentLoaded", function (event) {
    var selector = window.noticeableSettings.iframe.selector;
    var timelineUrl = window.noticeableSettings.iframe.timelineUrl;

    if (!selector) {
        console.error("Missing iframe selector definition.");
        return;
    }

    if (!timelineUrl) {
        console.error("Missing timeline URL definition.");
        return;
    }

    var iframe = document.querySelector(selector);

    if (!iframe) {
        console.error('Invalid iframe selector:', selector);
        return;
    }

    if (location.hash) {
        iframe.setAttribute('src', timelineUrl + location.hash.replace('#', '/'));
    } else {
        iframe.src = timelineUrl;
    }

    window.addEventListener("message", function (event) {
        try {
            var data = JSON.parse(event.data);
        } catch (e) {
            // Payloads that cannot be parsed are not sent by Noticeable
        }

        if (data && data.type === "noticeable-timeline-location") {
            var path = stripProjectId(data.path);

            if (path) {
                location.hash = path;
            } else {
                location.hash = '';
            }
        }
    }, false);
});

function stripProjectId(path) {
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
