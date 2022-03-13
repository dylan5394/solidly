async function main() {
  const Token = await ethers.getContractFactory("BaseV1");
  const Gauges = await ethers.getContractFactory("BaseV1GaugeFactory");
  const Bribes = await ethers.getContractFactory("BaseV1BribeFactory");
  const Core = await ethers.getContractFactory("BaseV1Factory");
  const Factory = await ethers.getContractFactory("BaseV1Router01");
  const Ve = await ethers.getContractFactory("contracts/ve.sol:ve");
  const Ve_dist = await ethers.getContractFactory(
    "contracts/ve_dist.sol:ve_dist"
  );
  const BaseV1Voter = await ethers.getContractFactory("BaseV1Voter");
  const BaseV1Minter = await ethers.getContractFactory("BaseV1Minter");

  const token = await Token.deploy();
  const gauges = await Gauges.deploy();
  const bribes = await Bribes.deploy();
  const core = await Core.deploy();

  // Mainnet WETH address
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const factory = await Factory.deploy(core.address, wethAddress);

  const ve = await Ve.deploy(token.address);
  const ve_dist = await Ve_dist.deploy(ve.address);
  const voter = await BaseV1Voter.deploy(
    ve.address,
    core.address,
    gauges.address,
    bribes.address
  );
  const minter = await BaseV1Minter.deploy(
    voter.address,
    ve.address,
    ve_dist.address
  );

  await token.setMinter(minter.address);
  await ve.setVoter(voter.address);
  await ve_dist.setDepositor(minter.address);
  await voter.initialize([], minter.address);
  await minter.initialize(
    ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
    [ethers.BigNumber.from("452870000000000000000000")],
    ethers.BigNumber.from("100000000000000000000000000")
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
