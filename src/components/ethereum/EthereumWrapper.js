import React from "react"
import PropTypes from "prop-types"
import Web3 from "web3"
import BN from "bn.js"
import { toast } from "react-toastify"
import getEthereumProvider from "../../utils/getEthereumProvider"
import MetaMaskCheck from "./MetaMaskCheck"
import ClaimXfund from "../claim/ClaimXfund"

export default class EthereumWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      ethereum: null,
      accounts: null,
      contract: null,
      currentAccount: null,
      xFundBalance: 0,
      metaMaskLoading: true,
    }
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this)
    this._handleChainChanged = this._handleChainChanged.bind(this)
  }

  async _handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      this.setState({ accounts: null, currentAccount: null })
    } else {
      this.setState({ accounts, currentAccount: accounts[0] })
      await this.getxFundBalance()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _handleChainChanged() {
    window.location.reload()
  }

  async getxFundBalance() {
    let xFUND = new BN(0)
    if (this.state.contract) {
      const xFundBalance = await this.state.contract.methods.balanceOf(this.state.currentAccount).call()
      if (xFundBalance > 0) {
        xFUND = new BN(xFundBalance / 10 ** 9)
      }
    }
    this.setState({ xFundBalance: xFUND.toNumber() })
  }

  async componentDidMount() {
    try {
      const ethereum = await getEthereumProvider()
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        ethereum.on("accountsChanged", this._handleAccountsChanged)
        ethereum.on("chainChanged", this._handleChainChanged)
        const currentAccount = accounts[0]
        const web3 = new Web3(ethereum)
        const contract = new web3.eth.Contract(
          JSON.parse(process.env.XFUND_ABI),
          process.env.XFUND_CONTRACT_ADDRESS,
        )
        this.setState({
          ethereum,
          accounts,
          contract,
          currentAccount,
          metaMaskLoading: false,
        })
        await this.getxFundBalance()
      } else {
        this.setState({ metaMaskLoading: false })
      }
    } catch (error) {
      toast.error(error.toString(), {
        position: toast.POSITION.TOP_CENTER,
      })
      this.setState({
        ethereum: null,
        accounts: null,
        contract: null,
        currentAccount: null,
        metaMaskLoading: false,
      })
    }
  }

  render() {
    const { ethereum, contract, currentAccount, metaMaskLoading, xFundBalance } = this.state
    const { validator, mcTx } = this.props
    if (ethereum && currentAccount && contract) {
      return (
        <div>
          <MetaMaskCheck
            ethereum={ethereum}
            currentAccount={currentAccount}
            metaMaskLoading={metaMaskLoading}
            xFundBalance={xFundBalance}
          />
          <ClaimXfund
            contract={contract}
            ethereum={ethereum}
            currentAccount={currentAccount}
            metaMaskLoading={metaMaskLoading}
            validator={validator}
            mcTx={mcTx}
          />
        </div>
      )
    }
    return (
      <div>
        <MetaMaskCheck
          ethereum={ethereum}
          currentAccount={currentAccount}
          metaMaskLoading={metaMaskLoading}
        />
      </div>
    )
  }
}

EthereumWrapper.propTypes = {
  mcTx: PropTypes.string,
  validator: PropTypes.object,
}
