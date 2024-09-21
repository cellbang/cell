
import { PathUtil } from '@celljs/cli-common/lib/utils';
import { existsSync, ensureDirSync, readFileSync, writeFileSync, statSync, utimesSync, copySync, closeSync, openSync, readdirSync, symlink } from 'fs-extra';
import { resolve, join, dirname } from 'path';
import { Poetry } from './poetry';
import { deleteFiles, getStripMode, getStripCommand } from './slim';
import { buildImage, getBindPath, getDockerUid } from './docker';
import { sha256Path, getRequirementsWorkingPath, getUserCachePath, mergeCommands, getRequirementsPath } from './util';
import { PythonPluginOptions } from '../python-plugin-protocol';
import { spawnProcess } from '@celljs/cli-common/lib/packager';
import { homedir } from 'os';
const rimraf = require('rimraf');
const { quote } = require('shell-quote');

export class Pip {

    protected poetry = new Poetry();

    async install(options: PythonPluginOptions) {
        const installedAt = await this.doInstall(options);
        const symlinkPath = getRequirementsPath();
        // Only do if we didn't already do it
        if (installedAt && !existsSync(symlinkPath) && installedAt !== symlinkPath) {
            // Windows can't symlink so we have to use junction on Windows
            if (process.platform === 'win32') {
                symlink(installedAt, symlinkPath, 'junction');
            } else {
                symlink(installedAt, symlinkPath);
            }
        }
    }

    /**
     * This checks if requirements file exists.
     * @param {string} requirementsFile
     * @returns {boolean}
     */
    protected requirementsFileExists(requirementsFilePath: string) {
        return existsSync(requirementsFilePath);
    }

    protected getRequirements(sourceFile: string): string[] {
        const requirements = readFileSync(sourceFile, { encoding: 'utf-8' })
            .replace(/\\\n/g, ' ')
            .split(/\r?\n/);

        return requirements.reduce<string[]>((acc, req) => {
            req = req.trim();
            if (!req.startsWith('-r')) {
                return [...acc, req];
            }
            sourceFile = join(dirname(sourceFile), req.replace(/^-r\s+/, ''));
            return [...acc, ...this.getRequirements(sourceFile)];
        }, [] as string[]);
    }

    protected filterRequirementsFile(sourceFile: string, targetFile: string, options: PythonPluginOptions) {
        const externals = new Set(options.externals || []);
        const requirements = this.getRequirements(sourceFile);
        const prepend: string[] = [];
        const filteredRequirements = requirements.filter(req => {
            req = req.trim();
            if (req.startsWith('#')) {
                // Skip comments
                return false;
            } else if (
                req.startsWith('--') ||
                req.startsWith('-c') ||
                req.startsWith('-e') ||
                req.startsWith('-f') ||
                req.startsWith('-i') ||
                req.startsWith('-r')
            ) {
                if (req.startsWith('-e')) {
                    // strip out editable flags
                    // not required inside final archive and avoids pip bugs
                    req = req.split('-e')[1].trim();
                    console.warn(`Stripping -e flag from requirement ${req}`);
                }

                // Keep options for later
                prepend.push(req);
                return false;
            } else if (req === '') {
                return false;
            }
            return !externals.has(req.split(/[=<> \t]/)[0].trim());
        });
        filteredRequirements.sort(); // Sort remaining alphabetically
        // Then prepend any options from above in the same order
        for (const item of prepend.reverse()) {
            if (item && item.length > 0) {
                filteredRequirements.unshift(item);
            }
        }
        writeFileSync(targetFile, filteredRequirements.join('\n') + '\n');
    }

    protected generateRequirementsFile(sourceFile: string, targetFile: string, options: PythonPluginOptions) {
        if (options.usePoetry && this.poetry.isPoetryProject()) {
            this.filterRequirementsFile(targetFile, targetFile, options);
            console.info(`Parsed requirements.txt from pyproject.toml in ${targetFile}`);
        } else if (options.usePipenv && existsSync(join(process.cwd(), 'Pipfile'))) {
            const projectHomeDir = PathUtil.getProjectHomePath();

            this.filterRequirementsFile(
                join(projectHomeDir, 'requirements.txt'),
                targetFile,
                options
            );
            console.info(`Parsed requirements.txt from Pipfile in ${targetFile}`);
        } else {
            this.filterRequirementsFile(sourceFile, targetFile, options);
            console.info(`Generated requirements from ${sourceFile} in ${targetFile}`);
        }
    }

    protected copyVendors(vendorFolder: string, targetFolder: string, options: PythonPluginOptions) {
        // Create target folder if it does not exist
        ensureDirSync(targetFolder);
        console.info(`Copying vendor libraries from ${vendorFolder} to ${targetFolder}`);

        readdirSync(vendorFolder).map(file => {
            const source = join(vendorFolder, file);
            const dest = join(targetFolder, file);
            if (existsSync(dest)) {
                rimraf.sync(dest);
            }
            copySync(source, dest);
        });
    }

    protected async pipAcceptsSystem(pythonBin: string, options: PythonPluginOptions) {
        // Check if pip has Debian's --system option and set it if so
        const pipTestRes = await spawnProcess(pythonBin, ['-m', 'pip', 'help', 'install'], {});
        if (pipTestRes.stderr && pipTestRes.stderr.toString().includes('command not found')) {
            throw new Error(`${pythonBin} not found! Install it according to the poetry docs.`);
        }
        return pipTestRes.stdout && pipTestRes.stdout.toString().indexOf('--system') >= 0;
    }

    protected async installRequirements(targetFolder: string, options: PythonPluginOptions) {
        const targetRequirementsTxt = join(targetFolder, 'requirements.txt');

        console.info(`Installing requirements from ${targetRequirementsTxt} ...`);

        const dockerCmd = [];
        const pipCmd = [options.pythonBin, '-m', 'pip', 'install'];

        if (Array.isArray(options.pipCmdExtraArgs) && options.pipCmdExtraArgs.length > 0) {
            options.pipCmdExtraArgs.forEach(cmd => {
                const parts = cmd.split(/\s+/, 2);
                pipCmd.push(...parts);
            });
        }

        const pipCmds = [pipCmd];
        const postCmds = [];
        // Check if we're using the legacy --cache-dir command...
        if (Array.isArray(options.pipCmdExtraArgs) && options.pipCmdExtraArgs.indexOf('--cache-dir') > -1) {
            if (options.dockerizePip) {
                throw new Error('You cannot use --cache-dir with Docker any more, please use the new option useDownloadCache instead.');
            } else {
                console.info(
                    'You are using a deprecated --cache-dir inside\n' +
                    '            your pipCmdExtraArgs which may not work properly, please use the\n' +
                    '            useDownloadCache option instead.'
                );
            }
        }

        if (!options.dockerizePip) {
            // Push our local OS-specific paths for requirements and target directory
            pipCmd.push(
                '-t',
                this.dockerPathForWin(targetFolder),
                '-r',
                this.dockerPathForWin(targetRequirementsTxt)
            );
            // If we want a download cache...
            if (options.useDownloadCache) {
                const downloadCacheDir = join(getUserCachePath(options), 'downloadCachemlgpyc');

                console.info(`Using download cache at ${downloadCacheDir}`);
                ensureDirSync(downloadCacheDir);
                pipCmd.push('--cache-dir', downloadCacheDir);
            }

            if (await this.pipAcceptsSystem(options.pythonBin, options)) {
                pipCmd.push('--system');
            }
        }

        // If we are dockerizing pip
        if (options.dockerizePip) {
            // Push docker-specific paths for requirements and target directory
            pipCmd.push('-t', '/var/task/', '-r', '/var/task/requirements.txt');

            // Build docker image if required
            let dockerImage;
            if (options.dockerFile) {
                console.info(`Building custom docker image from ${options.dockerFile}...`);
                dockerImage = await buildImage(
                    options.dockerFile,
                    options.dockerBuildCmdExtraArgs,
                    options
                );
            } else {
                dockerImage = options.dockerImage;
            }
            console.info(`Docker Image: ${dockerImage}`);

            // Prepare bind path depending on os platform
            const bindPath = this.dockerPathForWin(await getBindPath(targetFolder, options));

            dockerCmd.push('docker', 'run', '--rm', '-v', `${bindPath}:/var/task:z`);
            if (options.dockerSsh) {
                const homePath = homedir();
                const sshKeyPath =
                    options.dockerPrivateKey || `${homePath}/.ssh/id_rsa`;

                // Mount necessary ssh files to work with private repos
                dockerCmd.push(
                    '-v',
                    `${sshKeyPath}:/root/.ssh/${sshKeyPath.split('/').splice(-1)[0]}:z`,
                    '-v',
                    `${homePath}/.ssh/known_hosts:/root/.ssh/known_hosts:z`,
                    '-v',
                    `${process.env.SSH_AUTH_SOCK}:/tmp/ssh_sock:z`,
                    '-e',
                    'SSH_AUTH_SOCK=/tmp/ssh_sock'
                );
            }

            // If we want a download cache...
            const dockerDownloadCacheDir = '/var/useDownloadCache';
            if (options.useDownloadCache) {
                const downloadCacheDir = join(getUserCachePath(options), 'downloadCacheslspyc');
                console.info(`Using download cache directory ${downloadCacheDir}`);
                ensureDirSync(downloadCacheDir);
                // This little hack is necessary because getBindPath requires something inside of it to test...
                // Ugh, this is so ugly, but someone has to fix getBindPath in some other way (eg: make it use
                // its own temp file)
                closeSync(openSync(join(downloadCacheDir, 'requirements.txt'), 'w'));
                const windowsized = await getBindPath(downloadCacheDir, options);
                // And now push it to a volume mount and to pip...
                dockerCmd.push('-v', `${windowsized}:${dockerDownloadCacheDir}:z`);
                pipCmd.push('--cache-dir', dockerDownloadCacheDir);
            }

            if (options.dockerEnv) {
                // Add environment variables to docker run cmd
                for (const key of Object.keys(options.dockerEnv)) {
                    dockerCmd.push('-e', `${key}=${options.dockerEnv[key]}`);
                }

            }

            const uid = process.getuid ? process.getuid() : 1000;
            const gid = process.getgid ? process.getgid() : 1000;

            if (process.platform === 'linux') {
                // Use same user so requirements folder is not root and so --cache-dir works
                if (options.useDownloadCache) {
                    // Set the ownership of the download cache dir to root
                    pipCmds.unshift(['chown', '-R', '0:0', dockerDownloadCacheDir]);
                }
                // Install requirements with pip
                // Set the ownership of the current folder to user
                pipCmds.push([
                    'chown',
                    '-R',
                    `${uid}:${gid}`,
                    '/var/task',
                ]);
            } else {
                // Use same user so --cache-dir works
                dockerCmd.push('-u', await getDockerUid(bindPath));
            }

            for (const path of options.dockerExtraFiles) {
                pipCmds.push(['cp', path, '/var/task/']);
            }

            if (process.platform === 'linux') {
                if (options.useDownloadCache) {
                    // Set the ownership of the download cache dir back to user
                    pipCmds.push([
                        'chown',
                        '-R',
                        `${uid}:${gid}`,
                        dockerDownloadCacheDir,
                    ]);
                }
            }

            if (Array.isArray(options.dockerRunCmdExtraArgs)) {
                dockerCmd.push(...options.dockerRunCmdExtraArgs);
            } else {
                throw new Error('dockerRunCmdExtraArgs option must be an array');
            }

            dockerCmd.push(dockerImage);
        }

        // If enabled slimming, strip so files
        switch (getStripMode(options)) {
            case 'docker':
                pipCmds.push(getStripCommand(options, '/var/task'));
                break;
            case 'direct':
                postCmds.push(getStripCommand(options, this.dockerPathForWin(targetFolder)));
                break;
        }

        const opts = { shell: true, stdio: 'inherit' };
        let mainCmds = [];
        if (dockerCmd.length) {
            dockerCmd.push(...mergeCommands(pipCmds));
            mainCmds = [dockerCmd];
        } else {
            mainCmds = pipCmds;
        }
        mainCmds.push(...postCmds);

        console.info(`Running ${quote(dockerCmd)}...`);

        for (const [cmd, ...args] of mainCmds) {
            const { stdout, stderr } = await spawnProcess(cmd, args, opts);
            if (stderr) {
                if (stderr.includes('command not found')) {
                    const advice = cmd.indexOf('python') > -1 ? 'Try the pythonBin option' : 'Please install it';
                    throw new Error(`${cmd} not found! ${advice}`);
                }
                if (cmd === 'docker') {
                    throw new Error(`Running "${cmd} ${args.join(' ')}" failed with: "${stderr.toString().trim()}"`);
                }
                console.info(`Stdout: ${stdout}`);
                console.info(`Stderr: ${stderr}`);
                throw new Error(stderr);
            }
        }
        // If enabled slimming, delete files in slimPatterns
        if (options.slim === true) {
            deleteFiles(options, targetFolder);
        }
    }

    protected dockerPathForWin(path: string) {
        if (process.platform === 'win32') {
            return path.replace(/\\/g, '/');
        } else {
            return path;
        }
    }

    protected async doInstall(options: PythonPluginOptions) {
        await this.poetry.pyprojectTomlToRequirements(options);

        const requirementsFilePath = resolve(process.cwd(), options.requirementsFile!);
        if (!this.requirementsFileExists(requirementsFilePath)) {
            return;
        }

        const projectHomeDir = PathUtil.getProjectHomePath();
        ensureDirSync(projectHomeDir);
        const projectHomeRequirementsFilePath = resolve(projectHomeDir, 'requirements.txt');

        this.generateRequirementsFile(requirementsFilePath, projectHomeRequirementsFilePath, options);

        // If no requirements file or an empty requirements file, then do nothing
        if (!existsSync(projectHomeRequirementsFilePath) || statSync(projectHomeRequirementsFilePath).size === 0) {
            console.info(`Skipping empty output requirements.txt file from ${projectHomeRequirementsFilePath}`);
            return;
        }

        const checksum = sha256Path(projectHomeRequirementsFilePath);
        // Then figure out where this cache should be, if we're caching, if we're in a module, etc
        const requirementsWorkingPath = getRequirementsWorkingPath(checksum, projectHomeDir, options);

        // Check if our static cache is present and is valid
        if (existsSync(requirementsWorkingPath)) {
            if (existsSync(join(requirementsWorkingPath, '.completed_requirements')) && requirementsWorkingPath.endsWith('_mlgpyc')) {
                console.info(`Using static cache of requirements found at ${requirementsWorkingPath}`);
                // We'll "touch" the folder, as to bring it to the start of the FIFO cache
                utimesSync(requirementsWorkingPath, new Date(), new Date());
                return requirementsWorkingPath;
            }
            // Remove our old folder if it didn't complete properly, but _just incase_ only remove it if named properly...
            if (requirementsWorkingPath.endsWith('_mlgpyc') || requirementsWorkingPath.endsWith('.requirements')) {
                rimraf.sync(requirementsWorkingPath);
            }
        }

        // Ensuring the working reqs folder exists
        ensureDirSync(requirementsWorkingPath);

        // Copy our requirements.txt into our working folder...
        copySync(projectHomeRequirementsFilePath, join(requirementsWorkingPath, 'requirements.txt'));

        // Then install our requirements from this folder
        await this.installRequirements(requirementsWorkingPath, options);

        // Copy vendor libraries to requirements folder
        if (options.vendor) {
            this.copyVendors(options.vendor, requirementsWorkingPath, options);
        }

        // Then touch our ".completed_requirements" file so we know we can use this for static cache
        if (options.useStaticCache) {
            closeSync(openSync(join(requirementsWorkingPath, '.completed_requirements'), 'w'));
        }
        return requirementsWorkingPath;

    }
}
