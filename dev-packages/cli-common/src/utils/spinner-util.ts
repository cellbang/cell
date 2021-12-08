import * as ora from 'ora';

export namespace SpinnerUtil {

    export async function start(options: string | ora.Options | undefined, cb: () => any, successText?: string, failText?: string) {
        let opts: any = options;
        if (typeof options === 'string') {
            opts = { text: options, discardStdin: false };
        } else {
            opts.discardStdin = false;
        }
        const s = ora(opts).start();
        try {
            const ret = await cb();
            if (ret && ret.successText) {
                s.succeed(ret.successText);
            } else {
                s.succeed(successText);
            }
            return ret;
        } catch (error) {
            s.fail(failText);
            throw error;
        }
    }
}
