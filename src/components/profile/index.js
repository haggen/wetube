import React from "react";

import style from "./style.module.css";

export function Profile({ onChange, author }) {
  const handleNameChange = e => {
    onChange({ ...author, name: e.target.value });
  };

  const handleColorChange = e => {
    onChange({ ...author, color: e.target.value });
  };

  return (
    <div className={style.layout}>
      <input
        className={style.name}
        type="text"
        value={author.name}
        onChange={e => handleNameChange(e)}
        placeholder="e.g. John Doe"
      />
      <input
        className={style.color}
        type="color"
        value={author.color}
        onChange={e => handleColorChange(e)}
      />
    </div>
  );
}
