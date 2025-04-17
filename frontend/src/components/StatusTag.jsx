import React from 'react'

const Tag = ({ label, color }) => (
  <div class={"rounded " + color}>{label}</div>
)

const StatusTag = ({ statusId }) => {
  return (
    tags[statusId]
  )
}

const tags = [
  <Tag label="Not Started" color={"text-gray-400"} />,
  <Tag label="Started" color={"text-yellow-400"} />,
  <Tag label="Completed" color={"text-green-400"} />,
  <Tag label="Blocked" color={"text-red-400"} />,
]

export default StatusTag;
