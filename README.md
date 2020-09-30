# Vidar for Node

Sometimes it's useful to use [Vidar] in Node. This package is a wrapper of Vidar that serves that purpose.

## Usage

```js
vidarNode(() => {
  // You can access inputs as html elements and pass them to Vidar as usual.
  const image = document.getElementById('input1') // <img> element
  ...
  movie.exportRaw()
    .then(window.done)
// Tell Vidar Node what inputs to load with { id: path }
}, { input1: 'path/to/image.png' }, 'output.mp4')
```

## Documentation

**vidarNode(vidarFunction, inputSources, resultCallbackOrPath[, page])**

- `vidarFunction` ([string]) - Function to run in the puppeteer page. vd and done are exposed as globals (accessed as properties of window)
  - `window.done(exportedBytes)` - Process the exported movie (resolved value of Movie#exportRaw), by either writing to resultCallbackOrPath if it's a string or executing it if it's a function
- `inputSources` ([Object]&lt;[string], &lt;[string]|[Object]&gt;&gt;) - the input assets, mapped from id to path or raw data. If the input is provided as raw data, it should be an object with the following properties:
  - `type` ([string]) - the MIME type of the input source
  - `data` ([Buffer])
- `resultCallbackOrPath` ([function]|[string]) - Determines what to do when window.done is alled in vidarFunction. If it's a string, it is treated as a path and the movie is written to it. If it's a function, it is called with one argument exportedBytes.
- `page` ([Page]) - the puppeteer Page to use. Defaults to a page created by a new browser.

Runs `vidarFunction` in a puppeteer page. Each input source is converted to an html element (`<img>`, `<audio>` or `<video>`). The output is either written to the path or the callback is executed, depending on the type of `resultCallbackOrPath`.

## Changelog

### [0.1.0] - 2020-09-30
**Added**:
- `vidarNode` - the vidar wrapper
- `Movie#recordRaw` - a convenience method for recording in the vidar wrapper

[0.1.0]: https://github.com/clabe45/vidar-node/releases/tag/v0.1.0

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[GPLv3](https://choosealicense.com/licenses/gpl-3.0/)

[Vidar]: https://github.com/clabe45/vidar
[Object]: https://developer.mozilla.org/en-US/docs/Glossary/Object
[string]: https://developer.mozilla.org/en-US/docs/Glossary/String
[function]: https://developer.mozilla.org/en-US/docs/Glossary/Function
[Buffer]: https://nodejs.org/api/buffer.html#buffer_buffer
[Page]: https://github.com/puppeteer/puppeteer/blob/v1.19.0/docs/api.md#class-page
