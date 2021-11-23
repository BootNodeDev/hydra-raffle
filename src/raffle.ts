import seedrandom from "seedrandom";
import weighted from "weighted";
import fs from "fs";
import _ from "lodash";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

interface Participants {
  raffleAddresses: { address: string; raffle_weight: number }[];
  whitelistedAddresses: { address: string }[];
}

const main = (
  participants: Participants,
  seed: string,
  totalWinners: number
) => {
  // Set the seed for Math.random
  seedrandom(seed, { global: true });

  // whitelistedAddresses: Addresses that have the right to mint without winning the raffle
  // raffleAddresses: Addresses that will participate in the raffle for the right to mint
  const { raffleAddresses, whitelistedAddresses } = participants;

  // How many minting rights are being raffled
  const totalWhitelisted = whitelistedAddresses.length;
  const totalToRaffle = Math.min(
    totalWinners - totalWhitelisted,
    raffleAddresses.length
  );

  // Perform raffle and build final winners array
  // const raffleWinnerAddresses = _.sampleSize(raffleAddresses, totalToRaffle);
  const raffleWinnerAddresses: string[] = [];

  while (raffleWinnerAddresses.length < totalToRaffle) {
    const raffleWinnerAddress = weighted.select(
      raffleAddresses.map((a) => a.address),
      raffleAddresses.map((a) => a.raffle_weight)
    );
    raffleWinnerAddresses.push(raffleWinnerAddress);
    _.remove(raffleAddresses, (a) => a.address === raffleWinnerAddress);
  }

  const winnerAddresses = whitelistedAddresses
    .map((a) => a.address)
    .concat(raffleWinnerAddresses);

  // Build the merkle tree
  const winnerHashes = winnerAddresses.map(keccak256);
  const merkleTree = new MerkleTree(winnerHashes, keccak256, {
    sortPairs: true,
  });

  console.log({
    winners: winnerAddresses,
    merkleRoot: merkleTree.getHexRoot(),
  });
};

// Execute script only when called via CLI
if (require.main === module) {
  const seed = process.argv[2];

  if (!seed) {
    console.log("Please pass the seed string as command line argument");
    process.exit(1);
  }

  const participants = JSON.parse(
    fs.readFileSync("./participants.json").toString()
  );

  main(participants, seed, 5);
}

export default main;
