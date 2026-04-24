const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')

// .env dosyasını yükle (cPanel ortamında gerekli)
require('dotenv').config({ path: path.join(__dirname, '.env') })

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error:', err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> TSHF Web hazır: http://${hostname}:${port}`)
    console.log(`> Ortam: ${process.env.NODE_ENV}`)
  })
})
