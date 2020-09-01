import nextConnect from "next-connect"
import fetch from "isomorphic-unfetch"
import jwt from "jsonwebtoken"

const handler = nextConnect()

handler.post(async (req, res) => {
  const { eth_address, self_delegate_address } = req.body
  const { JWT_SHARED_SECRET } = process.env

  const jwtPayload = {
    eth_address,
    self_delegate_address,
  }

  const jwtData = jwt.sign(jwtPayload, JWT_SHARED_SECRET)

  const postData = {
    payload: jwtData,
  }

  const oraclRes = await fetch(`${process.env.ORACLE_BACKEND_API}/claims/memo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  res.json(await oraclRes.json())
})

export default handler
