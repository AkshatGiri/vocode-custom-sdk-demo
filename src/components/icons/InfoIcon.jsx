import React from "react";

export default function InfoIcon({ color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <g clipPath="url(#clip0_15_22)">
        <path
          fill={color}
          fillOpacity="0.85"
          d="M9.96 19.922c5.45 0 9.962-4.522 9.962-9.961C19.922 4.51 15.4 0 9.952 0 4.511 0 0 4.512 0 9.96c0 5.44 4.521 9.962 9.96 9.962zm-1.757-4.307c-.42 0-.742-.303-.742-.722 0-.391.322-.713.742-.713h1.24V9.59H8.37a.711.711 0 01-.732-.723c0-.39.322-.713.732-.713h1.895c.517 0 .79.371.79.918v5.108h1.24c.42 0 .743.322.743.713 0 .42-.322.722-.742.722H8.203zm1.67-9.12a1.315 1.315 0 01-1.318-1.329c0-.742.586-1.328 1.318-1.328.732 0 1.309.586 1.309 1.328 0 .742-.577 1.328-1.309 1.328z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_15_22">
          <path fill={color} d="M0 0H19.922V19.932H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
