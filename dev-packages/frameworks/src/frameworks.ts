export const frameworks = [
    // frontend
    {
        name: 'qq-guild-bot',
        useRuntime: 'default',
        useMode: [ 'qq-guild-bot' ],
        settings: {},
        detectors: {
            every: [
                {
                    path: 'bot-config.json',
                    matchContent: '"appID":\\s*".+?"',
                }
            ]
        }
    },
    {
        name: 'blitzjs',
        useRuntime: 'default',
        useMode: [ 'unpackage', 'node', 'next' ],
        settings: {
            'buildCommand:before': 'npx blitz build',
            serveCommand: 'npx blitz start --port $PORT'
        },
        detectors: {
          every: [
            {
              path: 'package.json',
              matchContent:
                '"(dev)?(d|D)ependencies":\\s*{[^}]*"blitz":\\s*".+?"[^}]*}',
            }
          ]
        }
    },
    {
        name: 'nextjs',
        useRuntime: 'default',
        useMode: [ 'unpackage', 'node', 'next' ],
        settings: {
            'buildCommand:before': 'npx next build',
            serveCommand: 'npx next dev --port $PORT'
        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"next":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'ionic-react',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            serveCommand: 'npx react-scripts start',
            'buildCommand:before': 'npx react-scripts build'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"@ionic\\/react":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'gatsby',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'public',
            serveCommand: 'npx gatsby develop --port $PORT',
            'buildCommand:before': 'npx gatsby build'
        },
        detectors: {
            every: [
              {
                path: 'package.json',
                matchContent:
                  '"(dev)?(d|D)ependencies":\\s*{[^}]*"gatsby":\\s*".+?"[^}]*}',
              },
            ],
        }
    },
    {
        name: 'astro',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'npx astro dev --port $PORT',
            'buildCommand:before': 'npx astro build'

        },
        detectors: {
            every: [
              {
                path: 'package.json',
                matchContent:
                  '"(dev)?(d|D)ependencies":\\s*{[^}]*"astro":\\s*".+?"[^}]*}',
              }
            ]
          }
    },
    {
        name: 'ionic-angular',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'www',
            serveCommand: 'npx ng serve --disable-host-check --port $PORT',
            'buildCommand:before': 'npx ng build'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"@ionic\\/angular":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'create-react-app',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            serveCommand: 'npx react-scripts start',
            'buildCommand:before': 'npx react-scripts build'
        },
        detectors: {
            some: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"react-scripts":\\s*".+?"[^}]*}',
                },
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"react-dev-utils":\\s*".+?"[^}]*}',
                },
            ]
        }
    },
    {
        name: 'react-static',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'npx react-static start',
            'buildCommand:before': 'npx react-static build --staging'

        },
        detectors: {
            some: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"react-static":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'vuepress',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: '.vuepress/dist',
            serveCommand: 'npx vuepress dev --port $PORT',
            'buildCommand:before': 'npx vuepress build'

        },
        detectors: {
            some: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"vuepress":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'vue',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'npx vue-cli-service serve --port $PORT',
            'buildCommand:before': 'npx vue-cli-service build'
        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"@vue\\/cli-service":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'vite',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'npx vite --port $PORT',
            'buildCommand:before': 'npx vite build --base $PATH'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"vite":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'angular',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist/${pkg.name}',
            serveCommand: 'npx ng serve --disable-host-check --port $PORT',
            'buildCommand:before': 'npx ng build --base-href $PATH'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"@angular\\/cli":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'svelte',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'public',
            serveCommand: 'npx rollup -c -w',
            'buildCommand:before': 'npx rollup -c'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"svelte":\\s*".+?"[^}]*}',
                },
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"sirv-cli":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'preact',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            serveCommand: 'npx preact watch --port $PORT',
            'buildCommand:before': 'npx preact build'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"preact":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'ember',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'npx ember serve --port $PORT',
            'buildCommand:before': 'npx ember build --environment=production'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"ember-cli":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'hexo',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'public',
            compileCommand: 'npx hexo server --port $PORT',
            'buildCommand:before': 'npx hexo generate'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"hexo":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'eleventy',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: '_site',
            'buildCommand:before': 'npx @11ty/eleventy',
            serveCommand: 'npx @11ty/eleventy --serve --watch --port $PORT'
        },
        detectors: {
            every: [
              {
                path: 'package.json',
                matchContent:
                  '"(dev)?(d|D)ependencies":\\s*{[^}]*"@11ty\\/eleventy":\\s*".+?"[^}]*}',
              }
            ]
          }
    },
    {
        name: 'docusaurus-2',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            serveCommand: 'npx docusaurus start --port $PORT',
            'buildCommand:before': 'npx docusaurus build'

        },
        detectors: {
            every: [
              {
                path: 'package.json',
                matchContent:
                  '"(dev)?(d|D)ependencies":\\s*{[^}]*"@docusaurus\\/core":\\s*".+?"[^}]*}',
              }
            ]
          }
    },
    {
        name: 'umijs',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            serveCommand: 'umi dev --port $PORT',
            'buildCommand:before': 'npx umi build'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"umi":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'nuxtjs',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            compileCommand: 'npx nuxt',
            'buildCommand:before': 'npx nuxt generate'

        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"nuxt3?(-edge)?":\\s*".+?"[^}]*}',
                }
            ]
        }
    },

    // backend
    {
        name: 'nest',
        useRuntime: 'default',
        useMode: ['node', 'unpackage'],
        settings: {},
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"@nestjs\\/core":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'adonis',
        useRuntime: 'default',
        useMode: ['unpackage', 'node', 'adonis'],
        settings: {
            compileCommand: '${ cliContext.dev ? "" : "node ace build --production" }',
            serveCommand: 'node ace serve --watch'
        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"@adonisjs\\/core":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'express',
        useRuntime: 'default',
        useMode: [ 'node' ],
        settings: {},
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"express":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'koa',
        useRuntime: 'default',
        useMode: [ 'node' ],
        settings: {},
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"koa":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'fastify',
        useRuntime: 'default',
        useMode: [ 'node' ],
        settings: {},
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"fastify":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    // ranked last
    {
        name: 'malagu',
        useRuntime: 'default',
        useMode: [ 'malagu' ],
        settings: {},
        detectors: {
            some: [
                {
                    path: 'package.json',
                    matchContent: '"devDependencies":\\s*{[^}]*"@malagu\\/cli":\\s*".+?"[^}]*}',
                },
                {
                    path: 'package.json',
                    matchContent: '"dependencies":\\s*{[^}]*"@malagu\\/cli":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'static-site',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: '.'
        },
        detectors: {
            every: [
                {
                    path: 'index.html'
                }
            ]
        }
    }
];
