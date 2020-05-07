const util = require('util')
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const mime = require('mime')

const redirectConsoleOutput = page => {
  // Redirect page's console output and errors to terminal
  page.on('console', consoleObj => {
    if (consoleObj.type() in console) {
      console[consoleObj.type()](consoleObj.text())
    } else {
      console.log(consoleObj.text())
    }
  })
  page.on('pageerror', error => {
    throw util.inspect(error)
  })
}

var exec = require('child_process').exec;

/**
 * Retrieve the URL and type of a media source
 * @param {string|RawSource} source
 */
const getMetadata = async (page, id, source) => {
  let data
  let type
  if (typeof source === 'string') {
    // Source is a path. Read into a new buffer.
    data = fs.readFileSync(source, 'base64')
    const extension = source.substring(source.indexOf('.') + 1)
    type = mime.getType(extension)
  } else {
    // Source is an object of the form {type: string, data: Buffer}
    data = source.data.toString('base64')
    type = source.type
  }
  // Prepend base64 header
  url = `data:${type};base64,${data}`
  return { url, type }
}

/**
 * Runs vidarFunction in a browser with inputSources loaded as html elements.
 * @param {function} vidarFunction
 * @param {Object.<string, <string|RawSource>>} inputSources - the input assets, mapped from id to path or raw data
 * @param {string|function} resultCallbackOrPath the - output path or callback
 * @param {Page} [page] - an existing puppeteer page to use
 * @return {Promise} a promise that resolves after the exported video has been written or processed
 *
 * @typedef {Object} RawSource
 * @property {string} type - the MIME type of the media
 * @property {Buffer} data
 */
const vidarNode = async (vidarFunction, inputSources, resultCallbackOrPath, page=undefined) => {
  // Set up page
  let browser
  if (!page) {
    browser = await puppeteer.launch()
    page = page || await browser.newPage()
  }
  redirectConsoleOutput(page)
  await page.goto(`file://${path.join(__dirname, 'page.html')}`)
  await page.evaluate(() => {
    window._doneExporting = false
  })

  // Send assets using data urls
  for (let id in inputSources) {
    const source = inputSources[id]
    const { url, type } = await getMetadata(page, id, source)
    await page.evaluate(async (id, type, url) => {
      const waitUntilLoaded = () => new Promise((resolve, reject) => {
        let tagname = type.substring(0, type.indexOf('/'))
        if (tagname === 'image')
          tagname = 'img'
        const el = document.createElement(tagname)
        el.id = id
        el.src = url
        if (el instanceof window.HTMLMediaElement)
          el.onloadeddata = resolve
        else if (el instanceof window.HTMLImageElement)
          el.onload = resolve
        else
          reject(`unhandled asset type: ${el.tagName}`)
        document.body.appendChild(el)
      })
      await waitUntilLoaded().catch(e => {
        throw e
      })
    }, id, type, url)
  }

  // Define `done` function (to be called when the video is done exporting)
  // I wish I could avoid using globals for this, but I don't know how to pass it to vidarFunction 
  // correctly (without causing problems).
  await page.exposeFunction('done', byteArray => {
    const buffer = Buffer.from(byteArray)
    if (typeof resultCallbackOrPath === 'function')
      resultCallbackOrPath(buffer)
    else
      fs.writeFileSync(resultCallbackOrPath, buffer, { encoding: 'binary' })
    page.evaluate(() => {
      window._doneExporting = true
    })
  })

  await page.evaluate(vidarFunction)
  await page.waitFor(() => window._doneExporting, { timeout: 0 })
  if (browser)
    await browser.close()
}

module.exports = vidarNode
