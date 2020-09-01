import React from "react"
import PropTypes from "prop-types"

export default function DateTime({ datetime }) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(datetime))
  return <span>{formatted}</span>
}

DateTime.propTypes = {
  datetime: PropTypes.string.isRequired,
}
