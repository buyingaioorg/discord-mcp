import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:child_process', () => ({ execSync: vi.fn() }));
vi.mock('node:fs', () => ({ existsSync: vi.fn() }));

const { execSync } = await import('node:child_process');
const { existsSync } = await import('node:fs');
const { default: setup } = await import('../vitest.global-setup.ts');
const cliDist = fileURLToPath(new URL('../dist/cli.js', import.meta.url));
const workspaceRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)));

describe('cold-checkout test setup', () => {
  beforeEach(() => {
    vi.mocked(execSync).mockReset();
    vi.mocked(existsSync).mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { cli: false, core: false },
    { cli: true, core: false },
    { cli: false, core: true },
  ])('builds the CLI and dependencies when an artifact is missing: %j', async (artifacts) => {
    vi.mocked(existsSync).mockImplementation((path) =>
      path === cliDist ? artifacts.cli : artifacts.core,
    );
    await setup();
    expect(execSync).toHaveBeenCalledExactlyOnceWith('pnpm --filter @discord-mcp/cli... build', {
      stdio: 'inherit',
      cwd: workspaceRoot,
    });
  });

  it('does not rebuild when both artifacts exist', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    await setup();
    expect(execSync).not.toHaveBeenCalled();
  });

  it('propagates build failures', async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('build failed');
    });
    await expect(setup()).rejects.toThrow('build failed');
  });
});
