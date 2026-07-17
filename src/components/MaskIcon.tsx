interface MaskIconProps {
  src: string;
  className?: string;
}

/**
 * Renders an SVG icon as a CSS mask so it always takes on the current text
 * color (bg-current). This lets shared icon files be reused across active /
 * inactive / colored states without needing multiple SVG variants.
 */
export function MaskIcon({ src, className = "" }: MaskIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
