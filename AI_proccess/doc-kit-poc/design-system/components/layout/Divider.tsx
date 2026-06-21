/** Layout: 区切り線。orientation のみ受ける（色・太さは token）。 */
export function Divider({ orientation = "h" }: { orientation?: "h" | "v" }) {
  return (
    <hr
      className={
        orientation === "v"
          ? "ds-divider ds-divider-v"
          : "ds-divider ds-divider-h"
      }
      aria-orientation={orientation === "v" ? "vertical" : "horizontal"}
    />
  );
}
