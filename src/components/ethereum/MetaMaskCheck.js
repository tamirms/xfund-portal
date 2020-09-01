import React from "react"
import PropTypes from "prop-types"
import ListGroup from "react-bootstrap/ListGroup"
import Link from "next/link"

export default function MetaMaskCheck({ ethereum, currentAccount, metaMaskLoading, xFundBalance }) {
  if (metaMaskLoading) {
    return <div>MetaMask loading...</div>
  }
  if (ethereum) {
    if (currentAccount) {
      return (
        <div>
          MetaMask detected.
          <ListGroup>
            <ListGroup.Item>
              Current Ethereum Address:&nbsp;
              <Link
                href={`${process.env.ETH_EXPLORER}/address/${currentAccount}`}
                as={`${process.env.ETH_EXPLORER}/address/${currentAccount}`}
              >
                <a target="_blank">{currentAccount}</a>
              </Link>
            </ListGroup.Item>
            <ListGroup.Item>Balance {xFundBalance} xFUND</ListGroup.Item>
          </ListGroup>
        </div>
      )
    }
    return <div>MetaMask locked, or no accounts linked</div>
  }
  return (
    <div>
      MetaMask required for claim functionality. Please install MetaMask, or check you are connected to the
      correct Ethereum network ({process.env.ETH_NETWORK})
    </div>
  )
}

MetaMaskCheck.propTypes = {
  ethereum: PropTypes.object,
  currentAccount: PropTypes.string,
  metaMaskLoading: PropTypes.bool,
  xFundBalance: PropTypes.number,
}
