import nextConnect from "next-connect"
import fetch from "isomorphic-unfetch"
import jwt from "jsonwebtoken"
import Web3 from "web3"
import abiDecoder from "abi-decoder"
import { DEFAULT_JSON_RESPONSE } from "../../common/utils/constants"

const handler = nextConnect()

const validateEthTx = (tx, fromAddress, nonce, amount, ticket) => {
  const { XFUND_ABI, XFUND_CONTRACT_ADDRESS } = process.env

  const valRes = {
    valid: false,
    error: "",
  }

  try {
    if (Web3.utils.toChecksumAddress(tx.from) !== Web3.utils.toChecksumAddress(fromAddress)) {
      valRes.error = `tx is not from ${fromAddress}`
      return valRes
    }

    if (Web3.utils.toChecksumAddress(tx.to) !== Web3.utils.toChecksumAddress(XFUND_CONTRACT_ADDRESS)) {
      valRes.error = `tx is not to smart contract ${XFUND_CONTRACT_ADDRESS}`
      return valRes
    }

    abiDecoder.addABI(JSON.parse(XFUND_ABI))
    const decodedTxInput = abiDecoder.decodeMethod(tx.input)

    if (decodedTxInput.name !== "claim") {
      valRes.error = "tx is not to claim function"
      return valRes
    }

    for (let i = 0; i < decodedTxInput.params.length; i += 1) {
      const param = decodedTxInput.params[i]
      switch (param.name) {
        case "amount":
          if (parseInt(param.value, 10) !== amount) {
            valRes.error = `tx param mismatch - amount ${param.value} != ${amount}`
            return valRes
          }
          break
        case "nonce":
          if (parseInt(param.value, 10) !== nonce) {
            valRes.error = `tx param mismatch - nonce ${param.value} != ${nonce}`
            return valRes
          }
          break
        case "ticket":
          if (param.value !== ticket) {
            valRes.error = `tx param mismatch - ticket ${param.value} != ${ticket}`
            return valRes
          }
          break
        default:
          break
      }
    }
  } catch (err) {
    valRes.error = err.toString()
    return valRes
  }

  valRes.valid = true
  return valRes
}

handler.post(async (req, res) => {
  const { mainchain_tx, eth_address, eth_tx, nonce, amount, ticket } = req.body
  const { JWT_SHARED_SECRET, ETH_PROVIDER } = process.env
  let result = { ...DEFAULT_JSON_RESPONSE }

  const web3 = new Web3(Web3.givenProvider || ETH_PROVIDER)
  const tx = await web3.eth.getTransaction(eth_tx)

  const isValid = validateEthTx(tx, eth_address, nonce, amount, ticket)

  if (isValid.valid) {
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

    result = await oraclRes.json()
  } else {
    result.error = isValid.error
  }

  res.json(result)
})

export default handler
