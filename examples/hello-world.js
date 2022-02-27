const path = require('path')
const etroNode = require('../src/index.js')

etroNode(() => {
  const video = document.getElementById('test')
  const canvas = document.createElement('canvas')
  const movie = new etro.Movie(canvas, { autoRefresh: false })

  movie.width = video.videoWidth
  movie.height = video.videoHeight
  movie.addLayer(new etro.layer.Video(0, video, { duration: 4 }))
  movie.recordRaw()
    .then(window.done)
}, { test: path.join(__dirname, 'assets/sample.ogv') }, path.join(__dirname, 'result.webm'))
