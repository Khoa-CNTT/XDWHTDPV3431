const CharityContract = artifacts.require("CharityContract");

module.exports = function(deployer) {
  deployer.deploy(CharityContract);
}; 