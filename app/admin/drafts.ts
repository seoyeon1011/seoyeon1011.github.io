// 임시저장 (IndexedDB, 이미지 Blob 포함). 기존 관리자 화면과 같은 저장소 이름을 써서 예전 임시저장도 불러온다.
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('ref-admin', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('drafts'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction('drafts', mode);
    const req = fn(tx.objectStore('drafts'));
    tx.oncomplete = () => res(req.result);
    tx.onerror = () => rej(tx.error);
  });
}

export const putDraft = (key: string, data: unknown) => run('readwrite', (s) => s.put(data, key)).then(() => undefined);
export const draftKeys = () => run('readonly', (s) => s.getAllKeys()).then((k) => k.map(String));
export const getDraft = <T,>(key: string) => run<T | undefined>('readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
