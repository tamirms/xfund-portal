import Button from "react-bootstrap/Button"
import Link from "next/link"
import React from "react"
import PropTypes from "prop-types"
import Table from "react-bootstrap/Table"

export default function UnclaimedXfund({ unclaimedData }) {
  return (
    <div>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Moniker</th>
            <th>Operator Address</th>
            <th>Self Delegator Address</th>
            <th>Unclaimed xFUND</th>
            <th>Incomplete*</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {unclaimedData.map(
            ({ moniker, operator_address, self_delegate_address, total_unclaimed, total_incomplete }) => (
              <tr key={operator_address}>
                <td>{moniker}</td>
                <td>
                  <Link
                    href={`${process.env.MAINCHAIN_EXPLORER}/validator/${operator_address}`}
                    as={`${process.env.MAINCHAIN_EXPLORER}/validator/${operator_address}`}
                  >
                    <a target="_blank">{operator_address}</a>
                  </Link>
                </td>
                <td>
                  <Link
                    href={`${process.env.MAINCHAIN_EXPLORER}/account/${self_delegate_address}`}
                    as={`${process.env.MAINCHAIN_EXPLORER}/account/${self_delegate_address}`}
                  >
                    <a target="_blank">{self_delegate_address}</a>
                  </Link>
                </td>
                <td>{total_unclaimed}</td>
                <td>{total_incomplete}</td>
                <td>
                  <Link href="/history/[address]" as={`/history/${self_delegate_address}`}>
                    <Button>Claim History</Button>
                  </Link>
                </td>
                <td>
                  {total_unclaimed > 0 && (
                    <Link href="/claim/[address]" as={`/claim/${self_delegate_address}`}>
                      <Button>Claim</Button>
                    </Link>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </Table>
      <p>
        <strong>*</strong> Claims that have been initialised but are incomplete. Click "Claim History" button
        for further details and to complete the claim. New claims cannot be initialised until previous claims
        have been completed.
      </p>
    </div>
  )
}

UnclaimedXfund.propTypes = {
  unclaimedData: PropTypes.array,
}
