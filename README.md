# xFUND Portal

This repo contains the source code for the front-end portal for xFUND. The portal is used by
Mainchain Validators to claim xFUND emissions.

## Running

Install package dependencies

```bash 
yarn install
```

Copy `src/example.env.local` to `src/.env.local` and input the values. 
See `src/example.env.local` for details regarding the variables.


Finally, run:

```bash
npm run dev
```

to run in Development mode, or

```bash
npm run build
npm run start
```

to run in Production.

Portal is available on http://localhost:3000

## Development/Testing Stack

All xFUND components, in addition to Mainchain DevNet and `ganache-cli` Ethereum chain
are all required to test the entire end-to-end process:

1. Run Mainchain DevNet
2. Run `ganache-cli` & deploy smart contract
3. Run xFUND Oracle
4. Run xFUND Portal

### 1. Mainchain DevNet

Clone https://github.com/unification-com/mainchain  
See https://docs.unification.io/networks/local-devnet.html for instructions on running DevNet

### 2. xFUND Smart Contract

See https://github.com/unification-com/xfund-smart-contract, specifically the section of the 
`README` covering [Deploying with ganache-cli](https://github.com/unification-com/xfund-smart-contract#deploying-with-ganache-cli)

### 3. xFUND Oracle

See https://github.com/unification-com/xfund-oracle

### 4. xFUND Portal

This repository.
