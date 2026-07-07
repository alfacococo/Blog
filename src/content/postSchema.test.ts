import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { postFrontmatterSchema } from './postSchema';

const postsDir = join(dirname(fileURLToPath(import.meta.url)), 'posts');

describe('post frontmatter', () => {
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  it('finds markdown posts to validate', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s matches the posts collection schema', (file) => {
    const raw = readFileSync(join(postsDir, file), 'utf-8');
    const { data } = matter(raw);
    const result = postFrontmatterSchema.safeParse(data);

    if (!result.success) {
      throw new Error(
        `${file} frontmatter is invalid:\n${result.error.issues
          .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
          .join('\n')}`,
      );
    }
  });
});
