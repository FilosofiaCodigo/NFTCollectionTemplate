const NETWORK_ID = 1
var NFT_PRICE = null
var PRESALE_PRICE = null
var MAX_SUPPLY = null
var MAX_PRESALE_SUPPLY = null
var contract
var accounts
var web3
var balance
var available


if (window.ethereum) {
    handleEthereum();

} else {
    window.addEventListener('ethereum#initialized', handleEthereum, {
    once: true,
    });

    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have MetaMask installed.
    setTimeout(handleEthereum, 3000); // 3 seconds
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

function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
    console.log('Ethereum successfully detected!');
    document.getElementById("web3_message").textContent="Ethereum successfully detected!";
    web3 = new Web3(window.ethereum)
    loadDapp()
    // Access the decentralized web!
    } else {
    console.log('Please install MetaMask!');
    document.getElementById("web3_message").textContent="Please install MetaMask!";
    }
}

async function loadAccount() {
  accounts = await web3.eth.getAccounts()
  balance = await contract.methods.balanceOf(accounts[0]).call()
  document.getElementById("web3_message").textContent="Connected"
  document.getElementById("connect_button").style.display = "none"
  document.getElementById("nft_balance").textContent="You have " + balance + " Crocs"
}


const getContract = async (web3) => {
  const response = await fetch("/contracts/FunkyCrocs.json");
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
    );
  return contract
}




async function loadDapp() {
  document.getElementById("web3_message").textContent="Connecting..."
  var awaitWeb3 = async function () {
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
          //if(document.getElementById("presale_price"))
            //document.getElementById("presale_price").textContent= "Presale Price: " + web3.utils.fromWei(PRESALE_PRICE) + " ETH"
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
        document.getElementById("web3_message").textContent="Please connect to Mainnet Testnet";
      }
    });
  };
  awaitWeb3();
}