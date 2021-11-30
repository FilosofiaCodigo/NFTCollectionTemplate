const NETWORK_ID = 4
var NFT_PRICE = null
var PRESALE_PRICE = null
var MAX_SUPPLY = null
var MAX_PRESALE_SUPPLY = null
var contract
var accounts
var web3
var balance
var available

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Accounts changed, realoading...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Network changed, realoading...";
    window.location.reload()
  })
}

const getAccounts = async () => {
  metamaskReloadCallback()
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    resolve(web3)
  } catch (error) {
    console.log(error)
  }
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Please install Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

function handleRevertError(message) {
  alert(message)
}

async function getRevertReason(txHash) {
  const tx = await web3.eth.getTransaction(txHash)
  await web3.eth
    .call(tx, tx.blockNumber)
    .then((result) => {
      throw Error("unlikely to happen")
    })
    .catch((revertReason) => {
      var str = "" + revertReason
      json_reason = JSON.parse(str.substring(str.indexOf("{")))
      handleRevertError(json_reason.message)
    });
}

const getContract = async (web3) => {
  const response = await fetch("./contracts/FunkyCrocs.json");
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
    );
  return contract
}

async function connectWallet() {
  getAccounts()
}

async function loadAccount() {
  accounts = await web3.eth.getAccounts()
  balance = await contract.methods.balanceOf(accounts[0]).call()
  document.getElementById("web3_message").textContent="Connected"
  document.getElementById("connect_button").style.display = "none"
  document.getElementById("nft_balance").textContent="You have " + balance + " Crocs"
}

async function loadDapp() {
  document.getElementById("web3_message").textContent="Connecting..."
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          NFT_PRICE = await contract.methods.price().call()
          MAX_SUPPLY = await contract.methods.MAX_SUPPLY().call()
          MAX_PRESALE_SUPPLY = await contract.methods.MAX_PRESALE_SUPPLY().call()
          total_mint = await contract.methods.totalSupply().call()
          available = MAX_SUPPLY - total_mint
          available_presale = MAX_PRESALE_SUPPLY - total_mint
          if(document.getElementById("total_mint"))
            document.getElementById("total_mint").textContent = available + "/" + MAX_SUPPLY + " available"
          if(document.getElementById("total_mint_presale"))
            document.getElementById("total_mint_presale").textContent = available_presale + "/" + MAX_PRESALE_SUPPLY + " available"
          if(document.getElementById("price"))
            document.getElementById("price").textContent= "Price: " + web3.utils.fromWei(NFT_PRICE) + " ETH"
          if(document.getElementById("presale_price"))
            document.getElementById("presale_price").textContent= "Presale Price: " + web3.utils.fromWei(PRESALE_PRICE) + " ETH"
          web3.eth.getAccounts(function(err, accounts){
            if (err != null)
              console.error("An error occurred: "+err);
            else if (accounts.length == 0)
              console.log("User is not logged in to MetaMask");
            else
            {
              loadAccount()
            }
          });
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby Testnet";
      }
    });
  };
  awaitWeb3();
}

loadDapp()

document.getElementById("web3_message").textContent="Please connect to Metamask"

/* SALE */

const mint = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintToken(mint_amount)
    .send({ from: accounts[0], gas: 0, value: NFT_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* PRESALE */

const mintPresale = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintPresale(mint_amount)
    .send({ from: accounts[0], gas: 0, value: PRESALE_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* Whitelist */

const mintWhitelist = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintWhitelist(mint_amount)
    .send({ from: accounts[0], gas: 0, value: NFT_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* Owner */

const mintReserved = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintReserved(mint_amount)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const editPresaleReserved = async () => {
  const result = await contract.methods.editPresaleReserved(["0xA","0xB"],[0,0])
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setPresaleActive = async () => {
  const result = await contract.methods.setPresaleActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setSaleActive = async () => {
  const result = await contract.methods.setSaleActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setBaseURI = async () => {
  const result = await contract.methods.setBaseURI("http://")
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setPrice = async () => {
  const result = await contract.methods.setPrice("0")//(10000000)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setAddresses = async () => {
  const result = await contract.methods.setAddresses(
    [
      "0x707e55a12557E89915D121932F83dEeEf09E5d70",
      "0x707e55a12557E89915D121932F83dEeEf09E5d70",
      "0x707e55a12557E89915D121932F83dEeEf09E5d70"
    ]
    )
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const withdrawTeam = async () => {
  const result = await contract.methods.withdrawTeam("110")
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const editWhitelistReserved = async () => {
  const result = await contract.methods.editWhitelistReserved(
    [
      "0xe1A308d193cf262090108B028840174Fb2e7E20a",
      "0x46E41eaac194fB00f88B2D27765bF31cc2F1a707",
      "0x9c3211d23b63E4D9784600D5770540268DdB6372",
      "0x4800e1dc56Dd78d9b071afbd0e90B06862516132",
      "0x6B47cB1065a81B45784776bb5F85456fd8431e31",
      "0x617aF4A7D97FE1C83B2A383713B5FCCF0D75F39C",
      "0x971257beA317043f6aA786F5b88d0142e524305e",
      "0xb8296ADf724315572Fd0283bA13967F78e3D17D7",
      "0x78C0Fa5FcFa30d5f222d65B469EB1695d7f0724d",
      "0x564f3A7B17F8744316cE393BDF1e2535EA0B2A47",
      "0x73670ba1814a1e06E31e78bA4a4bB77293cf37D6",
      "0x93e00bb056Eb95Fa4929573F7EE0A3F1a9a5469e",
      "0x75BAa4C13f45923d0D712b2a8Ff0330a2DCD0c96",
      "0x78C9DDf6cc304D01d56eFEAf6e3489d5be5a2ded",
      "0x6bc9922A4cf67651a2CA650e868219Cd619ed31D",
      "0x548010d30282A928165Aa6D2BDAA12F59e77785B",
      "0x3580b8b357619af739531cf1ddf767322b2deffc",
      "0xE4D2737E03dDDf7B25f5e6A07d934B56fBbAE1C2",
      "0x9b166014f671e713e67b19fe91a692326086814b",
      "0x1660D013cDe152A73Fac3699e8745F5412A4E6b9",
      "0xe4a3051f00ceb480fbf2f3917878bbbd64644bd6",
      "0x37ae2f47dfbc57e3b4f4aeb53ff1687ccf3ca3a2",
      "0x023Cd3EF787056CE757AE079aCb49255cf95C194",
      "0x58955980b61b65bfa6a6738ce146e575274af34b",
      "0x09A31e9eA6490991995d4EceC3C5748B993064fd",
      "0xCCCd5C571Ab86590227123039218238d5B88D19c",
      "0x730bF3B67090511A64ABA060FbD2F7903536321E",
      "0x66e1aa2125b255B63f7198F17ca5AFCf5e842449",
      "0x75E82F64916bb536F8e27f6457Ae5C4Cc21BD677",
      "0x1a02764a8531039d31ca05aef09ecdaed5b76873"
    ],
    [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      1,
      1,
      2,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      1
    ]
    )
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setWhitelistActive = async () => {
  const result = await contract.methods.setWhitelistActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}