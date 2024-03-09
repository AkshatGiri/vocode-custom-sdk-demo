export default function FTNoStyleButton({ children, ...props }) {
  return (
    <button className="no-style-button" {...props}>
      {children}
    </button>
  );
}
