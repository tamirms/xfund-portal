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

  const unclaimedData = []

  if (valData.status === 200 && unclaimedDataRes.status === 200) {
    for (let i = 0; i < valData.result.length; i += 1) {
      const v = valData.result[i]
      v.total_unclaimed = "0"
      for (let j = 0; j < unclaimedDataRes.result.length; j += 1) {
        if (v.operator_address === unclaimedDataRes.result[j].operator_address) {
          v.total_unclaimed = unclaimedDataRes.result[j].total_unclaimed
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
