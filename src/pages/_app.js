import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"
import "../styles/global.css"
import PropTypes from "prop-types"

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}

App.propTypes = {
  Component: PropTypes.any,
  pageProps: PropTypes.object,
}
