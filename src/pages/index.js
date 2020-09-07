import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import Layout from "../components/layout"
import UnclaimedXfund from "../components/UnclaimedXfund"

export async function getServerSideProps() {
  const res = await fetch(`${process.env.ORACLE_BACKEND_API}/emissions/unclaimed`)
  const unclaimedDataRes = await res.json()

  const valRes = await fetch(`${process.env.ORACLE_BACKEND_API}/validators/info`)
  const valData = await valRes.json()

  const issuedRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/status/1`)
  const issuedData = await issuedRes.json()

  const stagedRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/status/0`)
  const stagedData = await stagedRes.json()

  const unclaimedData = []

  if (valData.status === 200 && unclaimedDataRes.status === 200) {
    for (let i = 0; i < valData.result.length; i += 1) {
      const v = valData.result[i]
      v.total_unclaimed = "0"
      v.total_incomplete = 0
      for (let j = 0; j < unclaimedDataRes.result.length; j += 1) {
        if (v.operator_address === unclaimedDataRes.result[j].operator_address) {
          v.total_unclaimed = unclaimedDataRes.result[j].total_unclaimed
        }
      }
      for (let k = 0; k < issuedData.result.length; k += 1) {
        if (v.operator_address === issuedData.result[k].operator_address) {
          v.total_incomplete += issuedData.result[k].amount
        }
      }
      for (let m = 0; m < stagedData.result.length; m += 1) {
        if (v.operator_address === stagedData.result[m].operator_address) {
          v.total_incomplete += stagedData.result[m].amount
        }
      }
      unclaimedData.push(v)
    }
  }

  unclaimedData.sort((a, b) => {
    if (parseInt(a.total_unclaimed, 10) < parseInt(b.total_unclaimed, 10)) {
      return 1
    }
    return -1
  })

  return {
    props: {
      unclaimedData,
    },
  }
}

export default function Home({ unclaimedData }) {
  return (
    <Layout>
      <section>
        <h2>Unclaimed xFUND</h2>
        <p>MetaMask is required to process your xFUND claims.</p>
        <UnclaimedXfund unclaimedData={unclaimedData} />
      </section>
    </Layout>
  )
}

Home.propTypes = {
  unclaimedData: PropTypes.array,
}
