# noticeable-timeline-iframe

This repository shows how to embed a Noticeable Timeline in your own pages by using an iframe.

**As of February 1, 2021, this repository is deprecated:**
https://help.noticeable.io/en-us/article/how-to-ugprade-from-legacy-embedded-timelines-2jz9mr/

## Hash-based routing

By default, an iframe is masking the browser's address bar to show a URL different than the actual URL of the web page being viewed. 
In other words, the URL in the browser's address bar is not the actual URL to the content.
                                          
Hash-based routing allows targeting each iframe page via a dedicated URL. 
It is supported via a small JavaScript code snippet to include on the page that embeds the Timeline.

Below is an example that opens a given post using hash-based routing:

https://embedded.timeline.noticeable.io/changelog/#posts/improving-customer-retention

### Setup

Add the following code in your HTML between `<head>` and `</head>`:

```html
<script type="text/javascript">
    window.noticeableSettings = {
        iframe: {
            // The selector to use for selecting the iframe HTML element on your page
            selector: '#noticeable-iframe',
            // Boolean indicating whether your page is a Single Page App or not
            singlePageApp: false,
            // The URL to the Noticeable Timeline served by the iframe
            timelineUrl: 'https://timeline.noticeable.io/FAbWKLsdrqqXxOKwNAdU'
        }
    };

    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = 'https://embedded.timeline.noticeable.io/noticeable-iframe-hash-router.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);
</script>
```

replace the timeline URL by yours, and set the correct value for `singlePageApp`. Then, place an `iframe` element in your page content:

```html
<iframe id="noticeable-iframe" width="100%" height="100%" frameborder="0" scrolling="no"/>
```

You might still need to style the `iframe` with CSS to make it match your page constraints or styles. For a complete 
sample please look at the next page:

https://github.com/noticeableapp/noticeable-timeline-iframe/blob/master/index.html
