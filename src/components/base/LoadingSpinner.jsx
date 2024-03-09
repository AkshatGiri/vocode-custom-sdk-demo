export default function LoadingSpinner({ size = 20 }) {
  return (
    <div
      style={{
        border: "3px solid rgba(255, 255, 255, 0.3)",
        borderTop: "3px solid #ffffff",
        borderRadius: "50%",
        width: size,
        height: size,
        animation: "spin 2s linear infinite",
      }}
    ></div>
  );
}
