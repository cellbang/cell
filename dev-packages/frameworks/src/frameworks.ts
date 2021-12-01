export const frameworks = [
    {
        name: 'create-react-app',
        useRuntime: 'default',
        useMode: [ 'static' ],
        settings: {
            outputDir: 'build',
            buildCommand: 'npx react-scripts build',
            env: {
                PUBLIC_URL: '${frontend.malagu.server.path}'
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
        useMode: [ 'static', 'vue' ],
        settings: {
            outputDir: 'dist',
            buildCommand: 'npx vue-cli-service build'
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
            buildCommand: 'npx vite build --base ${frontend.malagu.server.path}'
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
            outputDir: 'build',
            buildCommand: 'npx ng build --base-href ${frontend.malagu.server.path}'
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
    }
];
