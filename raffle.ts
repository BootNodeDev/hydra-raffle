import seedrandom from "seedrandom";

const seed = process.argv[2];

if (!seed) {
  console.log("Please pass the seed string as command line argument");
  process.exit(1);
}

seedrandom(seed, { global: true });

import fs from "fs";
import _ from "lodash"; // Lodash needs to imported after the seedrandom function
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

// whitelistedAddresses: Addresses that have the right to mint without winning the raffle
// raffleAddresses: Addresses that will participate in the raffle for the right to mint
const { raffleAddresses, whitelistedAddresses } = JSON.parse(
  fs.readFileSync("./addresses.json").toString()
);

// How many minting rights are being raffled
const totalWinners = 5;
const totalWhitelisted = whitelistedAddresses.length;
const totalToRaffle = totalWinners - totalWhitelisted;

// Perform raffle and build final winners array
const raffleWinnerAddresses = _.sampleSize(raffleAddresses, totalToRaffle);
const winnerAddresses = whitelistedAddresses.concat(raffleWinnerAddresses);

// Build the merkle tree
const winnerHashes = winnerAddresses.map(keccak256);
const merkleTree = new MerkleTree(winnerHashes, keccak256, {
  sortPairs: true,
});

console.log({
  winners: winnerAddresses,
  merkleRoot: merkleTree.getHexRoot(),
});
