const MyNFT = artifacts.require("MyNFT");

module.exports = function (deployer) {
  deployer.deploy(MyNFT, "http://134.209.33.178:3000/");
};
