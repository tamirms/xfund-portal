import React from "react"
import PropTypes from "prop-types"
import ListGroup from "react-bootstrap/ListGroup"

export default function TicketContainer({ amount, nonce, address, ticket }) {
  return (
    <div>
      <p>The following details will be submitted to the xFUND smart contract (via MetaMask)</p>
      <ListGroup>
        <ListGroup.Item>Eth address: {address}</ListGroup.Item>
        <ListGroup.Item>Amount: {amount} XFUND</ListGroup.Item>
        <ListGroup.Item>Nonce: {nonce}</ListGroup.Item>
        <ListGroup.Item>Claim Ticket: {ticket}</ListGroup.Item>
      </ListGroup>
    </div>
  )
}

TicketContainer.propTypes = {
  amount: PropTypes.number,
  nonce: PropTypes.number,
  address: PropTypes.string,
  ticket: PropTypes.string,
}
