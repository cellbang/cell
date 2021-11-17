export const frameworks = [
    {
        name: 'create-react-app',
        outputDir: 'build',
        detectors: {
            some: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"react-scripts":\\s*".+?"[^}]*}',
                },
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"react-dev-utils":\\s*".+?"[^}]*}',
                },
            ]
        }
    },
    {
        name: 'vue',
        outputDir: 'dist',
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"@vue\\/cli-service":\\s*".+?"[^}]*}',
                }
            ]
        }
    },
    {
        name: 'angular',
        outputDir: 'dist',
        detectors: {
            every: [
                {
                    path: 'package.json',
                    matchContent:
                        '"(dev)?(d|D)ependencies":\\s*{[^}]*"@angular\\/cli":\\s*".+?"[^}]*}',
                }
            ]
        }
    }
];
