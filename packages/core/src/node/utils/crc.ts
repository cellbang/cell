import { createHash } from 'node:crypto';

export function crc32(text: string) {
  const _crc32 = createHash('crc32');
  _crc32.update(text, 'utf8');
  return _crc32.digest('hex');
}
