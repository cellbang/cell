import { getConnection as _getConnection } from 'typeorm';

export async function getConnection(name?: string) {
    const conn = _getConnection(name);
    if (!conn.isConnected) {
        await conn.connect();
    }
    return conn;
}
