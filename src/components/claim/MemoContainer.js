import React from "react"
import PropTypes from "prop-types"
import ListGroup from "react-bootstrap/ListGroup"
import Link from "next/link"
import styles from "./MemoContainer.module.css"

export default function MemoContainer({ memo, validator, currentAccount }) {
  const cmd = `undcli tx staking edit-validator \\
  --node=${process.env.MAINCHAIN_RPC_URL} \\
  --chain-id=${process.env.MAINCHAIN_CHAIN_ID} \\
  --memo="${memo}" \\
  --gas=auto \\
  --gas-adjustment=1.5 \\
  --gas-prices=0.25nund \\
  --from [SELF_DELEGATE_ACC]`

  return (
    <div>
      <h3>Prove Ownership of Ethereum address and Validator</h3>

      <p>You are Claiming with the following information:</p>
      <ListGroup>
        <ListGroup.Item>
          Validator: {validator.moniker} ({validator.self_delegate_address})
        </ListGroup.Item>
        <ListGroup.Item>
          Ethereum Address:&nbsp;
          <Link
            href={`${process.env.ETH_EXPLORER}/address/${currentAccount}`}
            as={`${process.env.ETH_EXPLORER}/address/${currentAccount}`}
          >
            <a target="_blank">{currentAccount}</a>
          </Link>
        </ListGroup.Item>
      </ListGroup>

      <p>
        If this is correct, send an empty edit-validator transaction to Mainchain for {validator.moniker},
        with the following token in the memo:
      </p>
      <pre>
        <code>{memo}</code>
      </pre>

      <p>
        <strong>
          Note: the token is valid for 1 hour. Once it expires, you will need to regenrate a new token by
          clicking the &quot;Begin Claim&quot; button
        </strong>
      </p>

      <p>For example:</p>
      <textarea defaultValue={cmd} rows="10" cols="120" className={styles.memo_textarea} />
    </div>
  )
}

MemoContainer.propTypes = {
  currentAccount: PropTypes.string,
  memo: PropTypes.string,
  validator: PropTypes.object,
}
