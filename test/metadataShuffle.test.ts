import _ from "lodash";
import metadataShuffle from "../src/metadataShuffle";

// Example input. In practice this will be participants.json file
const metadataHashes = [
  "QmaKUuFqq4ENPWWkw9Ha2B7oKptKh9mx5an2Tr3hBqTm3T",
  "QmQ7f27ataBUc4w6wgYNaoVwdpzsfgVcbUcvFRB1N6dvqi",
  "QmauHaYsTDFLym5bQwAW14WiRfpV3n8GbHHr8gnVnZKZFG",
  "QmQC1UqcYEXV6XSSV97jdpiauNutTi9bC6VQ8UZcrqYpgh",
];

describe("metadataShuffle", function () {
  it("the list of hashes is shuffled in a random way with different seeds", async () => {
    // For each hash, track how many times it ended up in what index (index == eventual token ID)
    const tally: { [hash: string]: { [index: number]: number } } = {};

    for (const metadataHash of metadataHashes) {
      tally[metadataHash] = {};
      for (let i = 0; i < metadataHashes.length; i++) {
        tally[metadataHash][i] = 0;
      }
    }

    const testRuns = 100_000;

    for (let i = 0; i < testRuns; i++) {
      const mapping = metadataShuffle(metadataHashes, "seed_" + i);

      for (const hash of Object.keys(mapping)) {
        const index = mapping[hash];
        tally[hash][index] = tally[hash][index] + 1;
      }
    }

    console.log(JSON.stringify(tally, null, 2)); // Output tally just for manual verification

    // Check that, with different seeds, each hash was assigned to a position evenly distributed
    // The position (index) is the tokenId that will be associated to this metadata
    // We use some tolerance. As testRuns increases, the actual tally gets relatively closer to the expected tally
    const expectedTally = testRuns / metadataHashes.length;
    for (const metadataHash of metadataHashes) {
      for (let i = 0; i < metadataHashes.length; i++) {
        expect(tally[metadataHash][i]).toBeGreaterThan(expectedTally * 0.98);
        expect(tally[metadataHash][i]).toBeLessThan(expectedTally * 1.02);
      }
    }
  });

  it("always gets the same result for the same seed", () => {
    const testRuns = 1000;
    for (let i = 0; i < testRuns; i++) {
      const seed = "seed_" + i;
      expect(metadataShuffle(metadataHashes, seed)).toEqual(
        metadataShuffle(metadataHashes, seed)
      );
    }
  });
});
