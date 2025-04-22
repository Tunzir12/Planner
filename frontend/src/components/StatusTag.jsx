import React, { useState } from 'react'

const tagStyle = "rounded p-2"
const tags = [
  { label: "Not Started", color: "text-gray-400" },
  { label: "Started", color: "text-yellow-400" },
  { label: "Completed", color: "text-green-400" },
  { label: "Blocked", color: "text-red-400" },
]

const StatusTag = ({ statusId, changeable = true }) => {

  const [selectedOption, setSelectedOption] = useState(statusId);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const selectStyle = tagStyle + " " + tags[selectedOption].color;

  if (!changeable)
    return (
      <div className={selectStyle}>{tags[statusId].label}</div>
    )

  return (
    <div className=''>
      <select className={selectStyle} defaultValue={statusId} onChange={handleChange}>
        {tags.map((tag, index) => (
          <option value={index}>{tag.label}</option>
        ))}
      </select>
    </div>
  )
}

export default StatusTag;
