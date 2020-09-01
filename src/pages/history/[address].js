import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import Layout from "../../components/layout"
import ClaimHistory from "../../components/ClaimHistory"

export async function getServerSideProps(context) {
  let selfDelegatorAddress = null
  let history = []
  let validatorExists = false
  let moniker = null
  let operatorAddress = null
  let queryAddress = null
  if ("address" in context.params) {
    if (context.params.address.length > 0) {
      queryAddress = context.params.address
    }
  }

  const res = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/address/${queryAddress}`)
  const valData = await res.json()

  if (valData.status === 200 && valData.success) {
    if (valData.result.length > 0) {
      validatorExists = true
      selfDelegatorAddress = valData.result[0].self_delegate_address
      moniker = valData.result[0].moniker
      operatorAddress = valData.result[0].operator_address
      history = valData.result
    }
  }

  return {
    props: {
      selfDelegatorAddress,
      validatorExists,
      moniker,
      operatorAddress,
      history,
      queryAddress,
    },
  }
}

export default function History({
  selfDelegatorAddress,
  validatorExists,
  moniker,
  operatorAddress,
  history,
  queryAddress,
}) {
  if (validatorExists) {
    return (
      <Layout>
        <section>
          <h2>Claim history for {moniker}</h2>

          <ClaimHistory
            history={history}
            selfDelegatorAddress={selfDelegatorAddress}
            operatorAddress={operatorAddress}
          />
        </section>
      </Layout>
    )
  }
  return (
    <Layout>
      <section>
        <p>{queryAddress} does not exist or currently no claim history</p>
      </section>
    </Layout>
  )
}

History.propTypes = {
  selfDelegatorAddress: PropTypes.string,
  validatorExists: PropTypes.bool,
  moniker: PropTypes.string,
  operatorAddress: PropTypes.string,
  history: PropTypes.array,
  queryAddress: PropTypes.string,
}
