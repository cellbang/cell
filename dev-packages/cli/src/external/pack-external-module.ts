import { remove, isEmpty, get, isNil, pick, uniq, defaults, now } from 'lodash';
import { join, dirname, relative } from 'path';
import { ConfigurationContext } from '../context';
import { getPackager } from '../packager';
import { BACKEND_TARGET } from '../constants';
import { writeJSONSync, pathExists, readJSON, readJSONSync } from 'fs-extra';
const isBuiltinModule = require('is-builtin-module');
import * as webpack from 'webpack';

function rebaseFileReferences(pathToPackageRoot: string, moduleVersion: string): string {
    if (/^(?:file:[^/]{2}|\.\/|\.\.\/)/.test(moduleVersion)) {
        const filePath = moduleVersion.replace(/^file:/, '');
        return `${moduleVersion.startsWith('file:') ? 'file:' : ''}${pathToPackageRoot}/${filePath}`.replace(/\\/g, '/');
    }

    return moduleVersion;
}

/**
 * Add the given modules to a package json's dependencies.
 */
function addModulesToPackageJson(externalModules: string[], packageJson: any, pathToPackageRoot: string): void {
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
function removeExcludedModules(modules: string[], packageForceExcludes: string[], log: boolean): void {
    const excludedModules = remove(modules, externalModule => {
        const splitModule = externalModule.split('@');
        // If we have a scoped module we have to re-add the @
        if (externalModule.startsWith('@')) {
            splitModule.splice(0, 1);
            splitModule[0] = '@' + splitModule[0];
        }
        const moduleName = splitModule[0];
        return packageForceExcludes.indexOf((moduleName)) !== -1;
    });

    if (log && excludedModules.length > 0) {
        console.log(`Excluding external modules: ${excludedModules.join(', ')}`);
    }
}

/**
 * Resolve the needed versions of production dependencies for external modules.
 * @this - The active plugin instance
 */
function getProdModules(externalModules: any[], packagePath: string, dependencyGraph: any, forceExcludes: string[]): any[] {
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
                    dirname(join(process.cwd(), packagePath)),
                    'node_modules',
                    module.external,
                    'package.json'
                );
                const peerDependencies = readJSONSync(modulePackagePath).peerDependencies;
                if (!isEmpty(peerDependencies)) {
                    console.log(`Adding explicit peers for dependency ${module.external}`);
                    const peerModules = getProdModules(
                        Object.keys(peerDependencies).map(value => ({ external: value })),
                        packagePath,
                        dependencyGraph,
                        forceExcludes
                    );
                    prodModules.push(...peerModules);
                }
            } catch (e) {
                console.log(`WARNING: Could not check for peer dependencies of ${module.external}`);
            }
        } else {
            if (!packageJson.devDependencies || !packageJson.devDependencies[module.external]) {
                // Add transient dependencies if they appear not in the service's dev dependencies
                const originInfo = get(dependencyGraph, 'dependencies', {})[module.origin] || {};
                moduleVersion = get(get(originInfo, 'dependencies', {})[module.external], 'version');
                if (!moduleVersion) {
                    console.log(`WARNING: Could not determine version of module ${module.external}`);
                }
                prodModules.push(moduleVersion ? `${module.external}@${moduleVersion}` : module.external);
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
                    throw new Error(`Serverless-webpack dependency error: ${module.external}.`);
                }
                console.log(
                    `INFO: Runtime dependency '${module.external}' found in devDependencies. It has been excluded automatically.`
                );
            }
        }
    }
    return prodModules;
}

function getExternalModuleName(module: any): string {
    const path = /^external "(.*)"$/.exec(module.identifier())![1];
    const pathComponents = path.split('/');
    const main = pathComponents[0];

    // this is a package within a namespace
    if (main.charAt(0) === '@') {
        return `${main}/${pathComponents[1]}`;
    }

    return main;
}

function isExternalModule(module: any): boolean {
    return module.identifier().startsWith('external ') && !isBuiltinModule(getExternalModuleName(module));
}

/**
 * Find the original module that required the transient dependency. Returns
 * undefined if the module is a first level dependency.
 * @param {Object} issuer - Module issuer
 */
function findExternalOrigin(issuer: any): any {
    if (!isNil(issuer) && issuer.rawRequest.startsWith('./')) {
        return findExternalOrigin(issuer.issuer);
    }
    return issuer;
}

function getExternalModules(stats: any): any[] {
    if (!stats.compilation.chunks) {
        return [];
    }
    const externals = new Set();
    for (const chunk of stats.compilation.chunks) {
        if (!chunk.modulesIterable) {
            continue;
        }

        // Explore each module within the chunk (built inputs):
        for (const module of chunk.modulesIterable) {
            if (isExternalModule(module)) {
                externals.add({
                    origin: get(findExternalOrigin(module.issuer), 'rawRequest'),
                    external: getExternalModuleName(module)
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
export async function packExternalModules(context: ConfigurationContext, stats: webpack.Stats): Promise<void> {
    const verbose = false;
    const pkg = context.pkg;
    const config = pkg.backendConfig.malagu;
    const configuration = ConfigurationContext.getConfiguration(BACKEND_TARGET, context.configurations);
    const packagerId = config.packager;
    const includes = config.includeModules;
    const packagerOptions = config.packagerOptions || {};
    const scripts: any[] = packagerOptions.scripts || [];

    if (!includes || !configuration) {
        return;
    }

    const outputPath = configuration!.output!.path!;

    // Read plugin configuration
    const packageForceIncludes = includes.forceInclude || [];
    const packageForceExcludes = includes.forceExclude || [];
    const packagePath = includes.packagePath && join(pkg.projectPath, includes.packagePath) || pkg.packagePath;
    const packageScripts = scripts.reduce((accumulator, script, index) => {
        accumulator[`script${index}`] = script;
        return accumulator;
    },
    {}
    );

    const packager = getPackager(packagerId);

    const sectionNames = packager.copyPackageSectionNames;
    const packageJson = await readJSON(packagePath);
    const packageSections = pick(packageJson, sectionNames);
    if (!isEmpty(packageSections)) {
        console.log(`Using package.json sections ${Object.keys(packageSections).join(', ')}`);
    }

    const dependencyGraph = await packager.getProdDependencies(pkg.projectPath, 1);

    const problems = dependencyGraph.problems || [];
    if (verbose && !isEmpty(problems)) {
        console.log(`Ignoring ${problems.length} NPM errors:`);
        problems.forEach((problem: any) => {
            console.log(`=> ${problem}`);
        });
    }

    // (1) Generate dependency composition
    const externalModules = getExternalModules(stats).concat(packageForceIncludes.map((whitelistedPackage: string) => ({
        external: whitelistedPackage
    })));
    const compositeModules = uniq(getProdModules(externalModules, packagePath, dependencyGraph, packageForceExcludes));
    removeExcludedModules(compositeModules, packageForceExcludes, true);

    if (isEmpty(compositeModules)) {
        // The compiled code does not reference any external modules at all
        console.log('No external modules needed');
        return;
    }

    // (1.a) Install all needed modules
    const compositeModulePath = outputPath;
    const compositePackageJson = join(compositeModulePath, 'package.json');

    // (1.a.1) Create a package.json
    const compositePackage = defaults(
        {
            name: pkg.pkg.name,
            version: pkg.pkg.version,
            description: `Packaged externals for ${pkg.pkg.name}`,
            private: true,
            scripts: packageScripts
        },
        packageSections
    );
    const relPath = relative(compositeModulePath, dirname(packagePath));
    addModulesToPackageJson(compositeModules, compositePackage, relPath);
    writeJSONSync(compositePackageJson, compositePackage, { spaces: 2 });

    // (1.a.2) Copy package-lock.json if it exists, to prevent unwanted upgrades
    const packageLockPath = join(dirname(packagePath), packager.lockfileName);
    const hasPackageLock = await pathExists(packageLockPath);
    if (hasPackageLock) {
        console.log('Package lock found - Using locked versions');
        try {
            let packageLockFile = await packager.readLockfile(packageLockPath);
            packageLockFile = packager.rebaseLockfile(relPath, packageLockFile);
            await packager.writeLockfile(join(compositeModulePath, packager.lockfileName), packageLockFile);
        } catch (err) {
            console.warn(`Warning: Could not read lock file: ${err.message}`);
        }
    }

    const start = now();
    console.log('Packing external modules: ' + compositeModules.join(', '));
    await packager.install(compositeModulePath, packagerOptions);
    if (verbose) {
        console.log(`Package took [${now() - start} ms]`);
    }

    // Prune extraneous packages - removes not needed ones
    const startPrune = now();
    await packager.prune(compositeModulePath, packagerOptions);
    if (verbose) {
        console.log(`Prune: ${compositeModulePath} [${now() - startPrune} ms]`);
    }

    // Prune extraneous packages - removes not needed ones
    const startRunScripts = now();
    await packager.runScripts(compositeModulePath, Object.keys(packageScripts));
    if (verbose) {
        console.log(`Run scripts: ${compositeModulePath} [${now() - startRunScripts} ms]`);
    }
}
