import React from "react"
import Head from "next/head"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Link from "next/link"
import { ToastContainer } from "react-toastify"
import PropTypes from "prop-types"

export const siteTitle = "xFUND Portal"

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="description" content={siteTitle} />
        <title>{siteTitle}</title>
      </Head>
      <Container fluid>
        <ToastContainer style={{ width: "80%" }} />
        <Row>
          <Col>
            <h1>
              <Link href="/">
                <a>{siteTitle}</a>
              </Link>{" "}
              ({process.env.MAINCHAIN_CHAIN_ID})
            </h1>
          </Col>
        </Row>
        <Row>
          <Col>{children}</Col>
        </Row>
        <Row>
          <Col>
            <p>
              xFUND Contract Address:&nbsp;
              <Link
                href={`${process.env.ETH_EXPLORER}/address/${process.env.XFUND_CONTRACT_ADDRESS}`}
                as={`${process.env.ETH_EXPLORER}/address/${process.env.XFUND_CONTRACT_ADDRESS}`}
              >
                <a target="_blank">{process.env.XFUND_CONTRACT_ADDRESS}</a>
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.object,
}
