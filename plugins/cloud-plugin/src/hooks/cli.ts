import { CliContext, CommandUtil } from '@malagu/cli-common';
import { CloudUtils } from './utils';

export default async (context: CliContext) => {
    const { cfg } = context;
    const { name } = CloudUtils.getConfiguration(cfg);
    const command = CommandUtil.getConfigCommand(context);
    if (command) {
        command
            .option('--account-id [accountId]', `${name} account id`)
            .option('--access-key-id [accessKeyId]', `${name} access key id`)
            .option('--access-key-secret [accessKeySecret]', `${name} access key secret`)
            .option('--token [token]', `${name} access token`)
            .option('--region [region]', `${name} region`)
            .option('--logout [logout]', `logout ${name}`)
            .option('--show-profile [showProfile]', `show ${name} profile`);

    }
    
};
