const NETWORK_ID = 4

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    console.log(document.readyState)
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ask user permission to access his accounts
          (async function(){
            await window.ethereum.request({ method: "eth_requestAccounts" });
          })()
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("must install MetaMask");
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            // ask user permission to access his accounts
            await window.ethereum.request({ method: "eth_requestAccounts" });
            resolve(web3);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("must install MetaMask");
        }
      });
    }
  });
};

function handleRevertError(message) {
  alert(message);
}

async function getRevertReason(txHash) {
  const tx = await web3.eth.getTransaction(txHash);
  await web3.eth
    .call(tx, tx.blockNumber)
    .then((result) => {
      throw Error("unlikely to happen");
    })
    .catch((revertReason) => {
      var str = "" + revertReason;
      json_reason = JSON.parse(str.substring(str.indexOf("{")));
      console.log(revertReason)
      //handleRevertError(json_reason.message);
    });
}

const getContract = async (web3) => {
  const data = await $.getJSON("./contracts/ChaosCrocs.json");

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  const contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  return contract;
};

const convertWeiToCrypto = (wei) => {
  const cryptoValue = web3.utils.fromWei(wei, "ether");
  return cryptoValue;
};

const convertCryptoToWei = (crypto) => {
  return web3.utils.toWei(crypto, "ether");
};

var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

async function loadApp() {
  var awaitWeb3 = async function () {
    web3 = await getWeb3();
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          var awaitAccounts = async function () {
            accounts = await web3.eth.getAccounts()
            console.log("Web3 loaded")
            //await getRevertReason("0xadb765f94b49121022e713dc42eaa9002dacf0d6b5452f968e4e46942479ceb8")
          };
          awaitAccounts()
        };
        awaitContract();
      } else {
        console.log("Error: Wrong network")
      }
    });
  };
  awaitWeb3();
}

loadApp()

const mint = async () => {
  const result = await contract.methods.mint(accounts[0], 1)
    .send({ from: accounts[0], gas: 0, value: 10000000000000000 })
    .on('transactionHash', function(hash){
      console.log("transactionHash: El usuario hizo clic en Confirm, esperando confirmación")
    })
    .on('receipt', function(receipt){
      console.log("receipt: Se han escrito los valores en el blockchain")
    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}