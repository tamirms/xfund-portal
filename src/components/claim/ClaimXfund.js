import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-unfetch"
import Button from "react-bootstrap/Button"
import { toast } from "react-toastify"
import Link from "next/link"
import MemoContainer from "./MemoContainer"
import TicketContainer from "./TicketContainer"

import { xFundSigDomain, xFundSigTxData, xFundSigDomainData } from "../../common/utils/constants"

export default class ClaimXfund extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showBeginClaim: true,
      showMemoContainer: false,
      showTxHashContainer: false,
      showClaimTicketContainer: false,
      showFinished: false,
      claimMemo: null,
      mainchainTxHash: null,
      ethTxHash: null,
      claimTicket: null,
    }

    this._getClaimMemo = this._getClaimMemo.bind(this)
    this._handleTxHashInput = this._handleTxHashInput.bind(this)
    this._handleTxHashSubmit = this._handleTxHashSubmit.bind(this)
    this._handleSendClaimToEth = this._handleSendClaimToEth.bind(this)
    this._setError = this._setError.bind(this)
    this._setSuccess = this._setSuccess.bind(this)
    this._setInfo = this._setInfo.bind(this)
    this._setWarn = this._setWarn.bind(this)
  }

  // eslint-disable-next-line class-methods-use-this
  _setError(msg) {
    toast.error(msg, {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  // eslint-disable-next-line class-methods-use-this
  _setSuccess(msg) {
    toast.success(msg, {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  // eslint-disable-next-line class-methods-use-this
  _setInfo(msg) {
    toast.info(msg, {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  // eslint-disable-next-line class-methods-use-this
  _setWarn(msg) {
    toast.warn(msg, {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  _handleTxHashInput() {
    this.setState({ mainchainTxHash: event.target.value })
  }

  async _getClaimMemo() {
    this.setState({ mainchainTxHash: "" })
    const postData = {
      eth_address: this.props.currentAccount,
      self_delegate_address: this.props.validator.self_delegate_address,
    }

    fetch(`/api/memo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.status === 200) {
          const { memo } = res.result
          this.setState({
            claimMemo: memo,
            showMemoContainer: true,
            showTxHashContainer: true,
            mainchainTxHash: "",
          })
        } else {
          this._setError(res.error)
        }
      })
      .catch((err) => {
        this._setError(err.message)
      })
  }

  async _handleTxHashSubmit() {
    const { currentAccount, contract, ethereum } = this.props
    const { mainchainTxHash } = this.state
    let nonce = 0
    let contractSigSalt
    try {
      nonce = await contract.methods.lastNonce(currentAccount).call()
      contractSigSalt = await contract.methods.sigSalt().call()
      console.log("contractSigSalt", contractSigSalt)
    } catch (err) {
      this._setError(err.message)
      return
    }

    const newNonce = parseInt(nonce, 10) + 1

    const sigNonce = Math.floor(Date.now() / 1000)

    const domain = [...xFundSigDomain]
    const txData = [...xFundSigTxData]
    const domainData = xFundSigDomainData(ethereum.chainId, contractSigSalt)
    const message = {
      tx_hash: mainchainTxHash,
      sig_nonce: sigNonce,
    }
    const msgParams = JSON.stringify({
      types: {
        EIP712Domain: domain,
        TxData: txData,
      },
      domain: domainData,
      primaryType: "TxData",
      message,
    })

    const params = [currentAccount, msgParams]

    let sigRes
    try {
      sigRes = await ethereum.request({
        method: "eth_signTypedData_v3",
        params,
        from: currentAccount,
      })
    } catch (err) {
      this._setError(err.message)
      return
    }

    const postData = {
      tx_hash: mainchainTxHash,
      nonce: newNonce,
      sig_nonce: sigNonce,
      sig: sigRes,
    }

    fetch(`/api/ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.status === 200) {
          const decodedClaimTicket = res.result
          if (decodedClaimTicket.eth === currentAccount) {
            this.setState({
              claimTicket: decodedClaimTicket,
              showMemoContainer: false,
              showBeginClaim: false,
              showTxHashContainer: false,
              showClaimTicketContainer: true,
            })
            const msg = `Success: ${mainchainTxHash} validated`
            this._setSuccess(msg)
          } else {
            const errMsg = `Current MetaMask address ${currentAccount} does not match address in claim ticket ${decodedClaimTicket.eth}`
            this._setError(errMsg)
            this.setState({
              showMemoContainer: false,
              showBeginClaim: false,
              showClaimTicketContainer: false,
            })
          }
        } else {
          this._setError(res.error)
        }
      })
      .catch((err) => {
        this._setError(err.message)
      })
  }

  async _handleSendClaimToEth() {
    const { currentAccount, contract, validator } = this.props
    const { claimTicket, mainchainTxHash } = this.state
    if (claimTicket.eth !== currentAccount) {
      const errMsg = `Current MetaMask address ${currentAccount} does not match address in claim ticket ${claimTicket.eth}`
      this._setError(errMsg)
      this.setState({
        showMemoContainer: false,
        showBeginClaim: false,
        showClaimTicketContainer: false,
      })
    } else {
      try {
        // todo - check contract event emissions for address/amount/nonce first, and update eth_tx accordingly
        const contractRes = await contract.methods
          .claim(claimTicket.abn, claimTicket.nnc, claimTicket.tkt)
          .send({ from: currentAccount })
        if (contractRes.status) {
          const ethTxHash = contractRes.transactionHash
          const postData = {
            mainchain_tx: mainchainTxHash,
            eth_address: currentAccount,
            eth_tx: ethTxHash,
            nonce: claimTicket.nnc,
            amount: claimTicket.abn,
            ticket: claimTicket.tkt,
          }
          fetch(`/api/ethtx`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success && res.status === 200) {
                this.setState({
                  showFinished: true,
                  showBeginClaim: false,
                  showMemoContainer: false,
                  showTxHashContainer: false,
                  showClaimTicketContainer: false,
                  ethTxHash,
                })

                const msg = `Success: ${validator.self_delegate_address} claimed ${claimTicket.amt} xFUND in Ethereum Tx ${ethTxHash}`
                this._setSuccess(msg)
              } else {
                this._setError(res.error)
              }
            })
            .catch((err) => {
              this._setError(err.message)
            })
        }
      } catch (err) {
        this._setError(err.message)
      }
    }
  }

  async componentDidMount() {
    if (this.props.mcTx) {
      this.setState({
        showBeginClaim: false,
        showMemoContainer: false,
        showTxHashContainer: true,
        mainchainTxHash: this.props.mcTx,
      })
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.currentAccount !== prevProps.currentAccount) {
      if (this.props.mcTx) {
        this.setState({
          showBeginClaim: false,
          showMemoContainer: false,
          showTxHashContainer: true,
          mainchainTxHash: this.props.mcTx,
        })
      } else {
        this.setState({
          showBeginClaim: true,
          showMemoContainer: false,
          showTxHashContainer: false,
          showClaimTicketContainer: false,
          showFinished: false,
          claimMemo: null,
          mainchainTxHash: null,
          ethTxHash: null,
          claimTicket: null,
        })
      }
    }
  }

  render() {
    const {
      showBeginClaim,
      showMemoContainer,
      showClaimTicketContainer,
      showTxHashContainer,
      showFinished,
      claimMemo,
      claimTicket,
      ethTxHash,
    } = this.state
    const { metaMaskLoading, ethereum, currentAccount, validator, mcTx } = this.props

    if (!metaMaskLoading) {
      if (ethereum) {
        if (currentAccount) {
          return (
            <div>
              {showBeginClaim && (
                <span>
                  Claiming {validator.total_uncalimed} xFUND for {validator.moniker} -{" "}
                  {validator.self_delegate_address}
                  <Button onClick={this._getClaimMemo}>Begin Claim</Button>
                </span>
              )}
              {showMemoContainer && (
                <MemoContainer memo={claimMemo} validator={validator} currentAccount={currentAccount} />
              )}
              {showTxHashContainer && (
                <div>
                  <h3>Validate Claim</h3>
                  <p>Submit the Mainchain Transaction Hash below:</p>
                  {mcTx ? (
                    <input type="text" value={mcTx} onChange={this._handleTxHashInput} />
                  ) : (
                    <input type="text" onChange={this._handleTxHashInput} />
                  )}
                  <Button onClick={this._handleTxHashSubmit}>Process Tx</Button>
                </div>
              )}
              {showClaimTicketContainer && (
                <TicketContainer
                  amount={claimTicket.amt}
                  address={claimTicket.eth}
                  nonce={claimTicket.nnc}
                  ticket={claimTicket.tkt}
                />
              )}
              {showClaimTicketContainer && <Button onClick={this._handleSendClaimToEth}>Claim XFUND</Button>}
              {showFinished && (
                <div>
                  <p>Eth Tx Hash: {ethTxHash}</p>
                  <Link href="/">
                    <Button>Finished</Button>
                  </Link>
                </div>
              )}
            </div>
          )
        }
      }
    }
    return <></>
  }
}

ClaimXfund.propTypes = {
  metaMaskLoading: PropTypes.bool,
  contract: PropTypes.object,
  ethereum: PropTypes.object,
  currentAccount: PropTypes.string,
  validator: PropTypes.object,
  mcTx: PropTypes.string,
  web3: PropTypes.object,
}
