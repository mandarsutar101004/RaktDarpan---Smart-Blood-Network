// components/ScrollLink.jsx
import { Link } from "react-router-dom";

const ScrollLink = ({ to, children, ...props }) => {
  const handleClick = (e) => {
    e.preventDefault();
    const element = document.getElementById(to);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Link to={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default ScrollLink;
