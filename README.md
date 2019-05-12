
# Election - DAPP Demo
Build an demonstation election decentralized application

Follow the steps below to download, install, and run this project.

## Dependencies
Install the following prerequisites
- NPM: https://nodejs.org
- Truffle: https://github.com/trufflesuite/truffle
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/


## Step 1. Clone the project
`git clone https://github.com/Turnbull7/Demo`

## Step 2. Install dependencies
```
$ cd Demo
$ npm install
```
## Step 3. Start Ganache
Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance.

## Step 4. Compile & Deploy Election Smart Contract
`$ truffle migrate --reset`
You must migrate the election smart contract each time your restart ganache. Windows users see notes at the bottom.

## Step 5. Configure Metamask
- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by Ganache.

## Step 6. Run the Front End Application
`$ npm run dev`
Visit this URL in your browser: http://localhost:3000

## Notes for Windows Users
Depending on your setup truffle commands may just open the truffle.js project file. If this is the case simply replace `truffle` with `truffle.cmd`. For example:
`$ truffle.cmd migrate --reset`