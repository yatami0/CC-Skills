/**
 * Display: 図画像の埋め込み（drawio 等から書き出した SVG / PNG）。
 * 座標や矢印は持たない（描画は外部ツール = drawio に委ねる）。図の中身は
 * works 側の <part>/diagram.svg に閉じ、ここは「埋め込みと light/dark 切替」だけを担う。
 *
 * テーマ追従は CSS で行う（src=ライト, srcDark=ダーク を data-theme で差し替え）。
 * srcDark を省くと 1 枚を両テーマで表示する。
 */
export type ImageProps = {
  /** ライトテーマ用の画像 URL（works 側で `import src from "./diagram.svg"`） */
  src: string;
  /** ダークテーマ用の画像 URL（あれば data-theme=dark で差し替え） */
  srcDark?: string;
  /** 代替テキスト（a11y 必須）。図の要旨を一文で。 */
  alt: string;
};

export function Image({ src, srcDark, alt }: ImageProps) {
  return (
    <span className={`ds-image${srcDark ? " ds-image--themed" : ""}`}>
      <img className="ds-image-light" src={src} alt={alt} />
      {srcDark && <img className="ds-image-dark" src={srcDark} alt={alt} />}
    </span>
  );
}
