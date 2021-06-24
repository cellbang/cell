// types
import type { ServeStatic, ServeStaticOption } from './type';
// utilities
import * as send from 'send';
import { resolve } from 'path';

const serveStatic = (root: string, opts: ServeStaticOption) => {

  const { fallthrough = true, baseHref, setHeaders, redirect } = opts;
  const onDirectory = redirect ?
  createRedirectDirectoryListener :
  createNotFoundDirectoryListener;

  opts.root = resolve(root);

  return (req: any, res: any, next: Function) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (fallthrough) {
        return next();
      }
      // method not allowed
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, HEAD');
      res.setHeader('Content-Length', '0');
      res.end();
      next();
      return;
    }

    let forwardError = !fallthrough;

    const url: URL = new URL(`${req.url.replace(baseHref, '/')}`, `http://${req.headers.host}`);

    const stream = send(req, url.pathname, opts) as any;

    stream.on('directory', onDirectory(url));

    if (setHeaders) {
      stream.on('headers', setHeaders);
    }

    if (fallthrough) {
      stream.on('file', function onFile() {
        // once file is determined, always forward error
        forwardError = true;
      });
    }

    // forward errors
    stream.on('error', function error(err: any) {
      if (forwardError || !(err.statusCode < 500)) {
        next(err);
        return;
      }

      next();
    });
    // pipe
    stream.pipe(res);
  };

  function createNotFoundDirectoryListener() {
    return function notFound() {
      // @ts-ignore
      this.error(404);
    };
  }

  function createRedirectDirectoryListener(url: URL) {
    return (res: any) => {
      // @ts-ignore
      if (this.hasTrailingSlash()) {
        // @ts-ignore
        this.error(404);
        return;
      }
      // reformat the URL
      const loc = encodeURI(url.href);
      const doc = createHtmlDocument('Redirecting', 'Redirecting to <a href="' + loc + '">' +
        loc + '</a>');

      // send redirect response
      res.statusCode = 301;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.setHeader('Content-Length', Buffer.byteLength(doc));
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Location', loc);
      res.end(doc);
    };
  }

  function createHtmlDocument(title: string, body: string) {
    return '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '<meta charset="utf-8">\n' +
      '<title>' + title + '</title>\n' +
      '</head>\n' +
      '<body>\n' +
      '<pre>' + body + '</pre>\n' +
      '</body>\n' +
      '</html>\n';
  }

};

export default {
  serveStatic,
  mime: send.mime
} as ServeStatic;

