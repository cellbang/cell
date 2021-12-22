import { DiskDetectorFilesystem } from '../detector/detector-filesystem';
import { Framework, FrameworkDetectionItem, DetectorFilesystem } from '../detector/detector-protocol';
import { frameworks as innerFrameworks } from '../frameworks';
import axios from 'axios';

export interface DetectOptions {
    url?: string;
    upstreamUrl?: string;
    frameworks?: Framework[];
}

export namespace FrameworkUtil {
    export async function detect(opts?: DetectOptions, fs: DetectorFilesystem = new DiskDetectorFilesystem()): Promise<Framework | undefined> {
        const frameworks = opts?.frameworks || [];
        if (opts?.url) {
            const { data } = await axios.get<Framework[]>(opts.url);
            if (data) {
                frameworks.push(...data);
            }
        }
        if (opts?.upstreamUrl) {
            const { data } = await axios.get<Framework[]>(opts.upstreamUrl);
            if (data) {
                frameworks.push(...data);
            }
        }
        if (frameworks.length === 0) {
            frameworks.push(...innerFrameworks);
        }
        for (const framework of frameworks) {
            if (await matches(framework, fs)) {
                return framework;
            }
        }
    }

    export async function matches(framework: Framework, fs: DetectorFilesystem = new DiskDetectorFilesystem()) {
        const { detectors } = framework;

        if (!detectors) {
            return false;
        }

        const { every, some } = detectors;

        if (every !== undefined && !Array.isArray(every)) {
            return false;
        }

        if (some !== undefined && !Array.isArray(some)) {
            return false;
        }

        const check = async ({ path, matchContent }: FrameworkDetectionItem) => {
            if (!path) {
                return false;
            }

            if ((await fs.hasPath(path)) === false) {
                return false;
            }

            if (matchContent) {
                if ((await fs.isFile(path)) === false) {
                    return false;
                }

                const regex = new RegExp(matchContent, 'gm');
                const content = await fs.readFile(path);

                if (!regex.test(content.toString())) {
                    return false;
                }
            }

            return true;
        };

        const result: boolean[] = [];

        if (every) {
            const everyResult = await Promise.all(every.map(item => check(item)));
            result.push(...everyResult);
        }

        if (some) {
            let someResult = false;

            for (const item of some) {
                if (await check(item)) {
                    someResult = true;
                    break;
                }
            }

            result.push(someResult);
        }

        return result.every(res => res === true);
    }

}

