export default function ExclaimIcon({ color = "white" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <g clipPath="url(#clip0_13_6)">
        <path
          fill={color}
          fillOpacity="0.85"
          d="M9.96 19.922c5.45 0 9.962-4.522 9.962-9.961C19.922 4.51 15.4 0 9.952 0 4.511 0 0 4.512 0 9.96c0 5.44 4.521 9.962 9.96 9.962zm0-8.145c-.507 0-.79-.283-.8-.8l-.127-5.323c-.01-.517.371-.888.918-.888.537 0 .938.38.928.898l-.137 5.313c-.01.527-.293.8-.781.8zm0 3.272c-.585 0-1.093-.469-1.093-1.045s.498-1.055 1.094-1.055c.596 0 1.094.469 1.094 1.055s-.508 1.045-1.094 1.045z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_13_6">
          <path fill={color} d="M0 0H19.922V19.932H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
