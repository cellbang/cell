import { join, dirname, relative } from 'path';
import { ConfigurationContext } from '../context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { getPackager } from '@celljs/cli-common/lib/packager/utils';
import { writeJSONSync, pathExists, readJSON, readJSONSync } from 'fs-extra';
import { Stats, Module, ExternalModule } from 'webpack';
const isBuiltinModule = require('is-builtin-module');

function pick(obj: any, props: string[]): any {
    const newObj: any = {};
    props.forEach(prop => {
        let objProp = obj;
        let newObjProp = newObj;
        const keys: string[] = prop.split('.');
        keys.forEach((key, index) => {
            if (objProp) {
                objProp = objProp[key];
                if (index === keys.length - 1) {
                    newObjProp[key] = objProp;
                } else {
                    newObjProp[key] = newObjProp[key] || {};
                    newObjProp = newObjProp[key];
                }
            }
        });
    });
    return newObj;
}

function rebaseFileReferences(
    pathToPackageRoot: string,
    moduleVersion: string
): string {
    if (/^(?:file:[^/]{2}|\.\/|\.\.\/)/.test(moduleVersion)) {
        const filePath = moduleVersion.replace(/^file:/, '');
        return `${
            moduleVersion.startsWith('file:') ? 'file:' : ''
        }${pathToPackageRoot}/${filePath}`.replace(/\\/g, '/');
    }

    return moduleVersion;
}

/**
 * Add the given modules to a package json's dependencies.
 */
function addModulesToPackageJson(
    externalModules: string[],
    packageJson: any,
    pathToPackageRoot: string
): void {
    externalModules.forEach(externalModule => {
        const splitModule = externalModule.split('@');
        // If we have a scoped module we have to re-add the @
        if (externalModule.startsWith('@')) {
            splitModule.splice(0, 1);
            splitModule[0] = '@' + splitModule[0];
        }
        let moduleVersion = splitModule.slice(1).join('@');
        // We have to rebase file references to the target package.json
        moduleVersion = rebaseFileReferences(pathToPackageRoot, moduleVersion);
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies[splitModule[0]] = moduleVersion;
    });
}

/**
 * Remove a given list of excluded modules from a module list
 * @this - The active plugin instance
 */
function removeExcludedModules(
    modules: string[],
    packageForceExcludes: string[],
    log: boolean
): void {
    const excludedModules = modules.filter(externalModule => {
        const splitModule = externalModule.split('@');
        // If we have a scoped module we have to re-add the @
        if (externalModule.startsWith('@')) {
            splitModule.splice(0, 1);
            splitModule[0] = '@' + splitModule[0];
        }
        const moduleName = splitModule[0];
        return packageForceExcludes.indexOf(moduleName) === -1;
    });

    if (log && excludedModules.length > 0) {
        console.log(
            `Excluding external modules: ${excludedModules.join(', ')}`
        );
    }
}

/**
 * Resolve the needed versions of production dependencies for external modules.
 * @this - The active plugin instance
 */
function getProdModules(
    externalModules: any[],
    packagePath: string,
    dependencyGraph: any = {},
    forceExcludes: string[],
    runtime?: string
): any[] {
    const packageJson = readJSONSync(packagePath);
    const prodModules: string[] = [];

    // only process the module stated in dependencies section
    if (!packageJson.dependencies) {
        return [];
    }

    // Get versions of all transient modules

    for (const module of externalModules) {
        let moduleVersion = packageJson.dependencies[module.external];
        if (moduleVersion) {
            prodModules.push(`${module.external}@${moduleVersion}`);
            // Check if the module has any peer dependencies and include them too
            try {
                const modulePackagePath = join(
                    dirname(packagePath),
                    'node_modules',
                    module.external,
                    'package.json'
                );
                const { peerDependencies = {}, peerDependenciesMeta = {} } =
                    readJSONSync(modulePackagePath);

                for (const key of Object.keys(peerDependencies)) {
                    if (peerDependenciesMeta[key]?.optional === true) {
                        delete peerDependencies[key];
                    }
                }

                const peerModules = getProdModules(
                    Object.keys(peerDependencies).map(value => ({
                        external: value,
                    })),
                    packagePath,
                    dependencyGraph,
                    forceExcludes,
                    runtime
                );
                prodModules.push(...peerModules);
            } catch (e) {
                console.log(
                    `WARNING: Could not check for peer dependencies of ${module.external}`
                );
            }
        } else {
            if (
                !packageJson.devDependencies ||
                !packageJson.devDependencies[module.external]
            ) {
                // Add transient dependencies if they appear not in the service's dev dependencies
                const originInfo =
                    dependencyGraph.dependencies?.[module.origin] ?? {};
                moduleVersion =
                    originInfo.dependencies?.[module.external]?.version;
                if (typeof moduleVersion === 'object') {
                    moduleVersion = moduleVersion.optional;
                }
                if (!moduleVersion) {
                    moduleVersion =
                        dependencyGraph.dependencies?.[module.external]
                            ?.version;
                    if (!moduleVersion) {
                        console.log(
                            `WARNING: Could not determine version of module ${module.external}`
                        );
                    }
                }
                prodModules.push(
                    moduleVersion
                        ? `${module.external}@${moduleVersion}`
                        : module.external
                );
            } else if (
                packageJson.devDependencies &&
                packageJson.devDependencies[module.external] &&
                !(forceExcludes.indexOf(module.external) !== -1)
            ) {
                // To minimize the chance of breaking setups we whitelist packages available on AWS here. These are due to the previously missing check
                // most likely set in devDependencies and should not lead to an error now.
                const ignoredDevDependencies = ['aws-sdk'];

                if (ignoredDevDependencies.indexOf(module.external) !== -1) {
                    // Runtime dependency found in devDependencies but not forcefully excluded
                    console.error(
                        `ERROR: Runtime dependency '${module.external}' found in devDependencies. Move it to dependencies or use forceExclude to explicitly exclude it.`
                    );
                    throw new Error(
                        `Serverless-webpack dependency error: ${module.external}.`
                    );
                }
                console.log(
                    `INFO: Runtime dependency '${module.external}' found in devDependencies. It has been excluded automatically.`
                );
            }
        }
    }
    return prodModules;
}

function getExternalModuleName(module: ExternalModule): string {
    const names = module.userRequest.split('/');

    if (names[0].startsWith('@') && names[1]) {
        return `${names[0]}/${names[1]}`;
    } else {
        return names[0];
    }
}

function isExternalModule(module: Module): boolean {
    return (
        module.identifier().startsWith('external ') &&
        !isBuiltinModule(getExternalModuleName(module as ExternalModule))
    );
}

/**
 * Find the original module that required the transient dependency. Returns
 * undefined if the module is a first level dependency.
 * @param {Object} issuer - Module issuer
 */
// eslint-disable-next-line no-null/no-null
function findExternalOrigin(stats: Stats, issuer: Module | null): any {
    if ((issuer as any)?.rawRequest.startsWith('./')) {
        return findExternalOrigin(
            stats,
            stats.compilation.moduleGraph.getIssuer(issuer!)
        );
    }
    return issuer;
}

function getExternalModules(stats: Stats | undefined): any[] {
    if (!stats?.compilation.chunks) {
        return [];
    }
    const externals = new Set();
    for (const chunk of stats.compilation.chunks) {
        const modules = stats.compilation.chunkGraph.getChunkModules(chunk);
        if (!modules) {
            continue;
        }

        // Explore each module within the chunk (built inputs):
        for (const module of modules) {
            if (isExternalModule(module)) {
                externals.add({
                    origin: findExternalOrigin(
                        stats,
                        stats.compilation.moduleGraph.getIssuer(module)
                    )?.rawRequest,
                    external: getExternalModuleName(module as ExternalModule),
                });
            }
        }
    }
    return Array.from(externals);
}

/**
 * We need a performant algorithm to install the packages for each single
 * function (in case we package individually).
 * (1) We fetch ALL packages needed by ALL functions in a first step
 * and use this as a base npm checkout. The checkout will be done to a
 * separate temporary directory with a package.json that contains everything.
 * (2) For each single compile we copy the whole node_modules to the compile
 * directory and create a (function) compile specific package.json and store
 * it in the compile directory. Now we start npm again there, and npm will just
 * remove the superfluous packages and optimize the remaining dependencies.
 * This will utilize the npm cache at its best and give us the needed results
 * and performance.
 */
export async function packExternalModules(
    context: ConfigurationContext,
    stats: Stats | undefined
): Promise<void> {
    const verbose = false;
    const { cfg, pkg, runtime } = context;
    const config = ConfigUtil.getCellConfig(cfg, BACKEND_TARGET);
    const configuration = ConfigurationContext.getConfiguration(
        BACKEND_TARGET,
        context.configurations
    );
    const includes = config.includeModules;
    const packagerOptions = {
        nonInteractive: true,
        ignoreOptional: true,
        ...config.packagerOptions,
    };
    const scripts: any[] = packagerOptions.scripts || [];

    if (!includes || Object.keys(includes).length === 0 || !configuration) {
        return;
    }

    const outputPath = configuration.output.get('path');

    // Read plugin configuration
    const packageForceIncludes = includes.forceInclude || [];
    const packageForceExcludes = includes.forceExclude || [];
    const packageForceIncludeAll = includes.forceIncludeAll;
    const packagePath =
        (includes.packagePath && join(process.cwd(), includes.packagePath)) ||
        join(process.cwd(), 'package.json');
    if (!(await pathExists(packagePath))) {
        return;
    }
    const packageScripts = scripts.reduce((accumulator, script, index) => {
        accumulator[`script${index}`] = script;
        return accumulator;
    }, {});

    const packager = getPackager(
        context.cfg.rootConfig.packager,
        process.cwd()
    );

    const sectionNames = packager.copyPackageSectionNames;
    const packageJson = (await readJSON(packagePath)) ?? {};
    if (packageForceIncludeAll) {
        for (const d of Object.keys(packageJson.dependencies)) {
            if (!packageForceIncludes.includes(d)) {
                packageForceIncludes.push(d);
            }
        }
    }
    const packageSections = pick(packageJson, sectionNames);
    if (Object.keys(packageSections).length) {
        console.log(
            `Using package.json sections ${Object.keys(packageSections).join(
                ', '
            )}`
        );
    }

    const dependencyGraph = await packager.getProdDependencies(1);

    const problems = dependencyGraph.problems || [];
    if (verbose && problems.length > 0) {
        console.log(`Ignoring ${problems.length} NPM errors:`);
        problems.forEach((problem: any) => {
            console.log(`=> ${problem}`);
        });
    }

    // (1) Generate dependency composition
    const externalModules = getExternalModules(stats).concat(
        packageForceIncludes.map((whitelistedPackage: string) => ({
            external: whitelistedPackage,
        }))
    );
    const compositeModules = new Set(
        getProdModules(
            [...new Set(externalModules)],
            packagePath,
            dependencyGraph,
            packageForceExcludes,
            runtime
        )
    );
    removeExcludedModules([...compositeModules], packageForceExcludes, true);

    if (compositeModules.size === 0) {
        // The compiled code does not reference any external modules at all
        console.log('No external modules needed');
        return;
    }

    // (1.a) Install all needed modules
    const compositeModulePath = outputPath;
    const compositePackageJson = join(compositeModulePath, 'package.json');

    // (1.a.1) Create a package.json
    const compositePackage = {
        ...{
            name: pkg.pkg.name,
            version: pkg.pkg.version,
            description: `Packaged externals for ${pkg.pkg.name}`,
            private: true,
            scripts: packageScripts,
        },
        ...packageSections,
    };

    const relPath = relative(compositeModulePath, dirname(packagePath));
    addModulesToPackageJson([...compositeModules], compositePackage, relPath);
    writeJSONSync(compositePackageJson, compositePackage, { spaces: 2 });

    // (1.a.2) Copy package-lock.json if it exists, to prevent unwanted upgrades
    const packageLockPath = join(dirname(packagePath), packager.lockfileName);
    const hasPackageLock = await pathExists(packageLockPath);
    if (hasPackageLock) {
        console.log('🔒  cell package lock found - Using locked versions');
        try {
            let packageLockFile = await packager.readLockfile(packageLockPath);
            packageLockFile = packager.rebaseLockfile(relPath, packageLockFile);
            await packager.writeLockfile(
                join(compositeModulePath, packager.lockfileName),
                packageLockFile
            );
        } catch (err) {
            console.warn(`Warning: Could not read lock file: ${err.message}`);
        }
    }

    const start = Date.now();
    for (const compositeModule of compositeModules) {
        console.log(`📦  cell external modules - ${compositeModule}`);
    }
    await packager.install(packagerOptions, compositeModulePath);
    if (verbose) {
        console.log(`Package took [${Date.now() - start} ms]`);
    }

    // Prune extraneous packages - removes not needed ones
    const startPrune = Date.now();
    await packager.prune(packagerOptions, compositeModulePath);
    if (verbose) {
        console.log(
            `Prune: ${compositeModulePath} [${Date.now() - startPrune} ms]`
        );
    }

    // Prune extraneous packages - removes not needed ones
    const startRunScripts = Date.now();
    await packager.runScripts(Object.keys(packageScripts), compositeModulePath);
    if (verbose) {
        console.log(
            `Run scripts: ${compositeModulePath} [${
                Date.now() - startRunScripts
            } ms]`
        );
    }
}
