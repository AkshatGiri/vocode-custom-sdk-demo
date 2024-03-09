import ExclaimIcon from "../icons/ExclaimIcon";
import InfoIcon from "../icons/InfoIcon";

// TODO: Add other types of alerts.

const ALERTS_INFO = {
  error: {
    style: {
      backgroundColor: "#FDE9E9",
    },
    icon: <ExclaimIcon color="#F37373" />,
  },
  info: {
    style: {
      backgroundColor: "#E9EFFD",
    },
    icon: <InfoIcon color="#5C8AF0" />,
  },
};

export default function Alert({ children, type = "error" }) {
  return (
    <div
      style={{
        borderRadius: "8px",
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.8rem",
        ...ALERTS_INFO[type].style,
      }}
    >
      {ALERTS_INFO[type].icon}
      {children}
    </div>
  );
}
