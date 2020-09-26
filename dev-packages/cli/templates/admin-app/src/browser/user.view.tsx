import * as React from 'react';
import { View } from '@malagu/react';
import { RpcUtil } from '@malagu/rpc';
import { DataTable } from 'grommet';
import { UserService, User } from '../common';

function Users() {

    const [ data, setData ] = React.useState<User[]>([]);

    React.useEffect(() => {
        const userService = RpcUtil.get<UserService>(UserService);
        userService.list().then(users => setData(users))

    }, [])
    
    return (
        <DataTable
            margin={{ vertical: 'medium' }}
            columns={[
                {
                    property: 'name',
                    header: 'Name',
                    primary: true
                },
                {
                    property: 'age',
                    header: 'Age'
                }
            ]}
            data={data}
        >

        </DataTable>
    );
}

@View({ component: Users})
export default class {}
