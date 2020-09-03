import nextConnect from "next-connect"
import fetch from "isomorphic-unfetch"
import jwt from "jsonwebtoken"

import { DEFAULT_JSON_RESPONSE, STATUS_CODES, TICKET_CLAIM_STATUS } from "../../common/utils/constants"

const handler = nextConnect()

handler.post(async (req, res) => {
  const { tx_hash, nonce, sig_nonce, sig } = req.body
  const { JWT_SHARED_SECRET } = process.env

  let result = { ...DEFAULT_JSON_RESPONSE }

  const jwtPayload = {
    tx_hash,
    nonce,
    sig_nonce,
    sig,
  }

  const jwtData = jwt.sign(jwtPayload, JWT_SHARED_SECRET)

  const postData = {
    payload: jwtData,
  }

  const oracleRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  const oracleData = await oracleRes.json()

  if (oracleData.success && oracleData.status === 200) {
    try {
      console.log(oracleData.result)
      if (parseInt(oracleData.result.claim_status, 10) === TICKET_CLAIM_STATUS.CLAIMED) {
        result.status = STATUS_CODES.ERR.CLAIM_TICKET
        result.error = `Ticket already claimed in Eth Tx ${oracleData.result.eth_tx}`
      } else {
        const decodedClaimTicket = jwt.verify(oracleData.result.claim_ticket, process.env.JWT_SHARED_SECRET)
        result.success = true
        result.status = STATUS_CODES.OK
        result.result = decodedClaimTicket
      }
    } catch (err) {
      result.status = STATUS_CODES.ERR.JWT
      result.error = err.toString()
    }
  } else {
    result = { ...oracleData }
  }

  res.json(result)
})

export default handler
