// 관리자 화면용 GitHub API. 토큰은 브라우저에만 있고 GitHub API로만 보낸다.
import { SITE } from '@/lib/site';

export interface GhError extends Error { status?: number }

export interface CommitFile { path: string; content?: string; blob?: Blob }

function b64ToText(b: string): string {
  const bin = atob(b.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function blobToB64(blob: Blob): Promise<string> {
  const u = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(u.subarray(i, i + 0x8000)));
  return btoa(s);
}

export class GitHub {
  branch = 'main';
  constructor(private token: string) {}

  async api<T = any>(path: string, opts: { method?: string; body?: string } = {}): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: 'Bearer ' + this.token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    const res = await fetch('https://api.github.com' + path, { method: opts.method || 'GET', body: opts.body, headers, cache: 'no-store' });
    if (res.ok) return (res.status === 204 ? null : await res.json()) as T;
    const j = await res.json().catch(() => ({} as { message?: string }));
    const e: GhError = new Error(res.status + ' ' + (j.message || ''));
    e.status = res.status;
    throw e;
  }

  rp(p: string) { return '/repos/' + SITE.owner + '/' + SITE.repo + p; }

  async repoInfo(): Promise<{ default_branch?: string; permissions?: { push?: boolean } }> {
    const repo = await this.api(this.rp(''));
    this.branch = repo.default_branch || 'main';
    return repo;
  }

  async getFile(path: string): Promise<string | null> {
    const enc = path.split('/').map(encodeURIComponent).join('/');
    try {
      const j = await this.api<{ content: string }>(this.rp('/contents/' + enc + '?ref=' + this.branch));
      return b64ToText(j.content);
    } catch (e) {
      if ((e as GhError).status === 404) return null;
      throw e;
    }
  }

  async listDir(path: string): Promise<{ name: string }[]> {
    return this.api(this.rp('/contents/' + path + '?ref=' + this.branch));
  }

  rawUrl(repoPath: string) {
    return 'https://raw.githubusercontent.com/' + SITE.owner + '/' + SITE.repo + '/' + this.branch + '/' + repoPath;
  }

  /** 여러 파일을 커밋 하나로 올린다 */
  async commitFiles(files: CommitFile[], message: string, log: (m: string) => void): Promise<string> {
    const ref = await this.api(this.rp('/git/ref/heads/' + this.branch));
    const base = ref.object.sha;
    const baseCommit = await this.api(this.rp('/git/commits/' + base));
    const tree: object[] = [];
    for (const f of files) {
      if (f.blob) {
        log('이미지 업로드 중: ' + f.path);
        const b = await this.api(this.rp('/git/blobs'), { method: 'POST', body: JSON.stringify({ content: await blobToB64(f.blob), encoding: 'base64' }) });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha });
      } else {
        tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.content });
      }
    }
    const t = await this.api(this.rp('/git/trees'), { method: 'POST', body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }) });
    const c = await this.api(this.rp('/git/commits'), { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: [base] }) });
    await this.api(this.rp('/git/refs/heads/' + this.branch), { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
    return c.sha;
  }
}
