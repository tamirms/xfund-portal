import detectEthereumProvider from "@metamask/detect-provider"

const resolveEthereum = async (resolve) => {
  const ethereum = await detectEthereumProvider()

  if (ethereum) {
    resolve(ethereum)
  } else {
    resolve(null)
  }
}

const EthereumProvider = () =>
  new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", () => {
      resolveEthereum(resolve)
    })
    // If document has loaded already, try to get Web3 immediately.
    if (document.readyState === "complete") {
      resolveEthereum(resolve)
    }
  })

export default EthereumProvider
