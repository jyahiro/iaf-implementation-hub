import fs from 'node:fs/promises';
import path from 'node:path';
import type {StorageProvider} from '@iaf/shared';

export class FileSystemStorageProvider implements StorageProvider {
  constructor(private readonly root = process.cwd()) {}

  async write(relativePath: string, contents: string): Promise<void> {
    const fullPath = path.join(this.root, relativePath);
    await fs.mkdir(path.dirname(fullPath), {recursive: true});
    await fs.writeFile(fullPath, contents, 'utf8');
  }

  async read(relativePath: string): Promise<string> {
    const fullPath = path.join(this.root, relativePath);
    return fs.readFile(fullPath, 'utf8');
  }

  async exists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.root, relativePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
