export default function WCButton({
  intent = "primary",
  size = "large",
  children,
  widthFull = false,
  ...props
}) {
  return (
    <button
      className="button"
      data-btn-intent={intent}
      data-btn-size={size}
      data-btn-width-full={widthFull}
      {...props}
    >
      {children}
    </button>
  );
}
