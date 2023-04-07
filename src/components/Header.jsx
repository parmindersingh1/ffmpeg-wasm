import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <div className="header">
      <ul>
        <li>
          <NavLink to="/">Gif</NavLink>
        </li>
        <li>
          <NavLink to="/trim">Trim</NavLink>
        </li>
        <li>
          <NavLink to="/text">Text</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Header;
