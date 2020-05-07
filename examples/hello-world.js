const path = require('path')
const vidarNode = require('../src/index.js')

vidarNode(() => {
  const video = document.getElementById('test')
  const canvas = document.createElement('canvas')
  const movie = new vd.Movie(canvas, { autoRefresh: false })

  movie.width = video.videoWidth
  movie.height = video.videoHeight
  movie.addLayer(new vd.layer.Video(0, video, { duration: 4 }))
  movie.recordRaw()
    .then(window.done)
}, { test: path.join(__dirname, 'assets/sample.ogv') }, path.join(__dirname, 'result.webm'))
