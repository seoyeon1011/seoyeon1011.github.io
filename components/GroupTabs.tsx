'use client';
// 홈 "주제별로 보기" 탭. 처음 HTML에는 첫 탭 글이 들어 있고, 다른 탭 글도 모두 HTML에 들어 있어 검색엔진이 읽는다.
import { useState } from 'react';
import { CAT_GROUPS, type GroupKey } from '@/lib/site';
import PostCard, { type CardData } from './PostCard';

export default function GroupTabs({ groups }: { groups: { key: GroupKey; posts: CardData[]; href: string }[] }) {
  const [active, setActive] = useState<GroupKey>(groups[0]?.key ?? 'trend');
  return (
    <div className="group-tabs">
      <div className="tabs" role="tablist" aria-label="주제 선택">
        {groups.map((g) => {
          const info = CAT_GROUPS.find((x) => x.key === g.key)!;
          return (
            <button key={g.key} type="button" role="tab" id={'tab-' + g.key} aria-controls={'panel-' + g.key}
              aria-selected={active === g.key} className={'g-' + g.key} onClick={() => setActive(g.key)}>
              {info.label}<span className="tab-count">{g.posts.length}</span>
            </button>
          );
        })}
      </div>
      {groups.map((g) => {
        const info = CAT_GROUPS.find((x) => x.key === g.key)!;
        return (
          <div key={g.key} role="tabpanel" id={'panel-' + g.key} aria-labelledby={'tab-' + g.key} hidden={active !== g.key}>
            <div className="panel-head">
              <p>{info.desc}</p>
              <a href={g.href}>전체 보기</a>
            </div>
            {g.posts.length ? (
              <div className="grid">{g.posts.slice(0, 6).map((p) => <PostCard key={p.slug} post={p} />)}</div>
            ) : (
              <p className="panel-empty">첫 글을 준비하고 있습니다. 곧 이곳에서 만나요.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
