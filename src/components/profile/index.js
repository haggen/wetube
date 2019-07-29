import React from "react";

import style from "./style.module.css";

export function Profile({ onChange, user }) {
  const handleNameChange = e => {
    onChange({ ...user, name: e.target.value });
  };

  const handleColorChange = e => {
    onChange({ ...user, color: e.target.value });
  };

  return (
    <div className={style.layout}>
      <input
        className={style.name}
        type="text"
        value={user.name}
        onChange={e => handleNameChange(e)}
        placeholder="Your name, e.g. John Doe"
      />
      <input
        className={style.color}
        type="color"
        value={user.color}
        onChange={e => handleColorChange(e)}
      />
    </div>
  );
}
