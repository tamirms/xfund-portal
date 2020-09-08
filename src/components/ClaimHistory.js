import Button from "react-bootstrap/Button"
import Link from "next/link"
import React from "react"
import PropTypes from "prop-types"
import Table from "react-bootstrap/Table"
import ListGroup from "react-bootstrap/ListGroup"
import DateTime from "./DateTime"

export default function ClaimHistory({ history, selfDelegatorAddress, operatorAddress }) {
  return (
    <div>
      <p>
        <strong>Self Delegator Address: </strong> {selfDelegatorAddress}
        <br />
        <strong>Operator Address: </strong> {operatorAddress}
        <br />
      </p>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Info</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {history.map(
            ({
              claim_status_text,
              claim_status,
              mainchain_tx,
              ethereum_tx,
              created,
              amount,
              eth_address,
            }) => (
              <tr key={mainchain_tx}>
                <td>
                  <DateTime datetime={created} />
                </td>
                <td>{claim_status_text}</td>
                <td>{amount}</td>
                <td>
                  <ListGroup>
                    <ListGroup.Item>
                      Mainchain Tx:
                      <Link
                        href={`${process.env.MAINCHAIN_EXPLORER}/transactions/${mainchain_tx}`}
                        as={`${process.env.MAINCHAIN_EXPLORER}/transactions/${mainchain_tx}`}
                      >
                        <a target="_blank">{mainchain_tx}</a>
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Eth Address:
                      <Link
                        href={`${process.env.ETH_EXPLORER}/address/${eth_address}`}
                        as={`${process.env.ETH_EXPLORER}/address/${eth_address}`}
                      >
                        <a target="_blank">{eth_address}</a>
                      </Link>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Eth Tx:{" "}
                      {ethereum_tx ? (
                        <Link
                          href={`${process.env.ETH_EXPLORER}/tx/${ethereum_tx}`}
                          as={`${process.env.ETH_EXPLORER}/tx/${ethereum_tx}`}
                        >
                          <a target="_blank">{ethereum_tx}</a>
                        </Link>
                      ) : (
                        "initialised or issued but not yet claimed. Click the Complete Claim button"
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </td>
                <td>
                  {claim_status === 1 || claim_status === 0 ? (
                    <Link
                      href={`/claim/[address]?mctx=${mainchain_tx}`}
                      as={`/claim/${selfDelegatorAddress}?mctx=${mainchain_tx}`}
                    >
                      <Button>Complete Claim</Button>
                    </Link>
                  ) : (
                    <></>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </div>
  )
}

ClaimHistory.propTypes = {
  history: PropTypes.array,
  selfDelegatorAddress: PropTypes.string.isRequired,
  operatorAddress: PropTypes.string.isRequired,
}
