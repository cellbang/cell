export interface ServeStatic {
  serveStatic: Function
  mime: any
}

export interface ServeStaticOption {
  fallthrough?: boolean
  maxage?: number
  setHeaders?: (res: any, path: string, stat: any) => void
  redirect?: boolean,
  extensions?: false | Array<string>
  dotfiles?: 'allow' | 'deny' | 'ignore'
  acceptRanges?: any
  cacheControl?: any
  immutable?: boolean
  index?: any
  lastModified?: any
  baseHref: string,
  root: string,
}
