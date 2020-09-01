import nextConnect from "next-connect"
import fetch from "isomorphic-unfetch"
import jwt from "jsonwebtoken"

const handler = nextConnect()

handler.post(async (req, res) => {
  const { mainchain_tx, eth_address, eth_tx } = req.body
  const { JWT_SHARED_SECRET } = process.env

  const jwtPayload = {
    mainchain_tx,
    eth_address,
    eth_tx,
  }

  const jwtData = jwt.sign(jwtPayload, JWT_SHARED_SECRET)

  const postData = {
    payload: jwtData,
  }

  const oraclRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/ethtx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  res.json(await oraclRes.json())
})

export default handler
