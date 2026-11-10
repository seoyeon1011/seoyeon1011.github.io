// 구조화 데이터(JSON-LD). </script> 가 끼어들지 않도록 < 를 이스케이프한다
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2).replace(/</g, '\\u003c') }} />;
}
