import React from "react"
import PropTypes from "prop-types"
import ListGroup from "react-bootstrap/ListGroup"
import Link from "next/link"
import { toast } from "react-toastify"

export default function MetaMaskCheck({ ethereum, currentAccount, metaMaskLoading, xFundBalance }) {
  if (metaMaskLoading) {
    return <div>MetaMask loading...</div>
  }
  if (ethereum) {
    if (parseInt(ethereum.chainId, 16) !== parseInt(process.env.ETH_NETWORK_ID, 10)) {
      toast.error(`Unexpected Ethereum network. Please connect to ${process.env.ETH_NETWORK_NAME}`, {
        position: toast.POSITION.TOP_CENTER,
      })
    } else {
      toast.success(`Connected to Ethereum network ${process.env.ETH_NETWORK_NAME}`, {
        position: toast.POSITION.TOP_CENTER,
      })
    }

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
      correct Ethereum network ({process.env.ETH_NETWORK_NAME})
    </div>
  )
}

MetaMaskCheck.propTypes = {
  ethereum: PropTypes.object,
  currentAccount: PropTypes.string,
  metaMaskLoading: PropTypes.bool,
  xFundBalance: PropTypes.number,
}
