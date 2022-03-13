import { createServer } from 'http';
const { parse } = require('url')
const localRequire = eval('require');
const nextLibPath = localRequire.resolve('next', { paths: [process.cwd()] })
const next = localRequire(nextLibPath);
const port = parseInt(process.env.SERVER_PORT || '') || 9000;
const hostname = '0.0.0.0'
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
