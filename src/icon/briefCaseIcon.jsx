import * as React from "react";
const BriefCaseIcon = (props) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width={44} height={44} rx={10} fill={props.fill || "#FFF1C6"} />
    <path
      d="M31 23.2554C28.2207 24.3805 25.1827 25 22 25C18.8173 25 15.7793 24.3805 13 23.2554M26 16V14C26 12.8954 25.1046 12 24 12H20C18.8954 12 18 12.8954 18 14V16M22 22H22.01M15 30H29C30.1046 30 31 29.1046 31 28V18C31 16.8954 30.1046 16 29 16H15C13.8954 16 13 16.8954 13 18V28C13 29.1046 13.8954 30 15 30Z"
      stroke="#495057"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default BriefCaseIcon;
