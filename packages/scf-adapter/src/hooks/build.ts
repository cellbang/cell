import { BuildContext, getHomePath } from '@malagu/cli-service';
import { join } from 'path';
import { writeFile } from 'fs-extra';

export default async (context: BuildContext) => {
    const { pkg } = context;
    const destDir = join(getHomePath(pkg), 'index.js');
    await writeFile(destDir, `const code = require('./backend/dist');
module.exports.handler = (event, context) => {
    return code.handler(event, context);
}`, { mode: 0o755 });

};
