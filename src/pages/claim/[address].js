import fetch from "isomorphic-unfetch"
import Button from "react-bootstrap/Button"
import Link from "next/link"
import React from "react"
import PropTypes from "prop-types"
import EthereumWrapper from "../../components/ethereum/EthereumWrapper"
import Layout from "../../components/layout"

export async function getServerSideProps(context) {
  let validatorExists = false
  let validator = {}
  let queryAddress = ""
  let queryMcTx = null
  if ("address" in context.params) {
    if (context.params.address.length > 0) {
      queryAddress = context.params.address
    }
  }

  if ("mctx" in context.query) {
    if (context.query.mctx.length > 0) {
      queryMcTx = context.query.mctx
    }
  }

  let res
  let valData
  let issued = null
  let claimed = false
  if (queryMcTx) {
    res = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/address/${queryAddress}/mctx/${queryMcTx}`)
    valData = await res.json()
    if (valData.result.length > 0) {
      if (parseInt(valData.result[0].claim_status, 10) === 2) {
        claimed = true
      }
    }
  } else {
    res = await fetch(`${process.env.ORACLE_BACKEND_API}/emissions/unclaimed/address/${queryAddress}`)
    valData = await res.json()

    const issuedRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/address/${queryAddress}/status/1`)
    const issuedNotClaimed = await issuedRes.json()
    if (issuedNotClaimed.success && issuedNotClaimed.status === 200) {
      if (issuedNotClaimed.result.length > 0) {
        issued = issuedNotClaimed.result[0]
      }
    }
  }

  if (valData.status === 200 && valData.success) {
    if (valData.result.length > 0) {
      validator = valData.result[0]
      validatorExists = true
    }
  }

  return {
    props: {
      validator,
      validatorExists,
      mcTx: queryMcTx,
      issued,
      claimed,
    },
  }
}

export default function Claim({ validator, validatorExists, mcTx, issued, claimed }) {
  if (validatorExists) {
    if(claimed) {
      return (
        <Layout>
          <section>
            <div>
              <p>
                Already claimed in Ethereum Tx:&nbsp;
                <Link
                  href={`${process.env.ETH_EXPLORER}/tx/${validator.ethereum_tx}`}
                  as={`${process.env.ETH_EXPLORER}/tx/${validator.ethereum_tx}`}
                >
                  <a target="_blank">{validator.ethereum_tx}</a>
                </Link>
              </p>
            </div>
          </section>
        </Layout>
      )
    } else {
      if(issued) {
        return (
          <Layout>
            <section>
              <div>
                <p>
                  Warning: you have an incomplete claim - please complete this before beginning a new claim
                </p>
                <ul>
                  <li>Node: {issued.moniker}</li>
                  <li>Date Issued: {issued.created}</li>
                  <li>Amount: {issued.amount} xFUND</li>
                  <li>Operator: {issued.operator_address}</li>
                  <li>Address: {issued.self_delegate_address}</li>
                  <li>Ethereum Address: {issued.eth_address}</li>
                  <li>Mainchain Tx: {issued.mainchain_tx}</li>
                </ul>
                <Link
                  href={`/claim/[address]?mctx=${issued.mainchain_tx}`}
                  as={`/claim/${issued.self_delegate_address}?mctx=${issued.mainchain_tx}`}
                >
                  <Button>Complete Claim</Button>
                </Link>
              </div>
            </section>
          </Layout>
        )
      } else {
        return (
          <Layout>
            <section>
              <div>
                <EthereumWrapper validator={validator} mcTx={mcTx} />
              </div>
            </section>
          </Layout>
        )
      }
    }
  } else {
    return (
      <Layout>
        <section>
          <p>{validator.self_delegate_address} does not exist or currently no unclaimed xFUND</p>
        </section>
      </Layout>
    )
  }
}

Claim.propTypes = {
  validator: PropTypes.object,
  validatorExists: PropTypes.bool,
  mcTx: PropTypes.string,
  issued: PropTypes.object,
}
