export const frameworks = [
    // frontend
    {
        name: 'create-react-app',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            compileCommand: 'npx react-scripts build',
            frontend: {
                env: {
                    PUBLIC_URL: '${malagu.server.path}'
                }
            }
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
        name: 'vue',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'dist',
            compileCommand: 'npx vue-cli-service build'
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
            frontend: {
                compileCommand: 'npx vite build --base ${malagu.server.path}'
            }
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
            frontend: {
                compileCommand: 'npx ng build --base-href ${malagu.server.path}'
            }
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
            compileCommand: 'npm run build'
        },
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent: '"(dev)?(d|D)ependencies":\\s*{[^}]*"svelte":\\s*".+?"[^}]*}',
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
            compileCommand: 'npx preact build'
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
            compileCommand: 'npx ember-cli build --environment=production'
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

    // backend
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
    // ranked last
    {
        name: 'malagu',
        useRuntime: 'default',
        useMode: [ 'auto' ],
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
    }
];
