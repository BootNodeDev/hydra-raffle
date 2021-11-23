import _ from "lodash";
import raffle from "../src/raffle";

// Example input. In practice this will be participants.json file
const participants = {
  whitelistedAddresses: [
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
    {
      address: "0x7dcf217ff94f3b0b28c7310246dd8cd457af1ecc",
    },
  ],
  raffleAddresses: [
    {
      address: "0x9cf2288d8FA37051970AeBa88E8b4Fb5960c2385",
      raffle_weight: 1,
    },
    {
      address: "0xDe75665F3BE46D696e5579628fA17b662e6fC04e",
      raffle_weight: 1.5,
    },
    {
      address: "0x76d88fb4fcb39B4b895Bfc4df0dCa252b9C7DC6B",
      raffle_weight: 2,
    },
    {
      address: "0x32dea44d5C243990B0133f5D103C2A784aA6a29F",
      raffle_weight: 0.5,
    },
    {
      address: "0x3261A5c0757632C06218Cf3AA8265f7CDbB94016",
      raffle_weight: 3,
    },
    {
      address: "0x03D3CcF782202753316949426Ce0cc43EeBa9440",
      raffle_weight: 1,
    },
  ],
};

const winnerCount = 5; // For most test scenarios, there will be 2 whitelisted and 3 raffled addresses

describe("raffle", function () {
  it("always includes whitelisted addresses in the winners", async () => {
    const testRuns = 1000;
    for (let i = 0; i < testRuns; i++) {
      const winners = raffle(participants, "seed_" + i, winnerCount);
      expect(winners.length).toBe(winnerCount);

      for (const whitelistedAddress of participants.whitelistedAddresses) {
        expect(winners).toContain(whitelistedAddress.address);
      }
    }
  });

  it("the raffled addresses are picked fairly based on their weights", async () => {
    // We clear whitelisted participants so there's only raffle participants
    const raffleOnlyParticipants = {
      whitelistedAddresses: [],
      raffleAddresses: [...participants.raffleAddresses],
    };

    // Initialize a tally on 0 for all participants
    const tally: { [address: string]: number } = {};
    for (const raffleAddress of raffleOnlyParticipants.raffleAddresses) {
      tally[raffleAddress.address] = 0;
    }

    const testRuns = 100_000;
    const winnerCount = 1; // We pick 1 at a time, since it makes it easier to perform assertions
    const totalWeight = _.sum(
      _.map(raffleOnlyParticipants.raffleAddresses, "raffle_weight")
    );
    for (let i = 0; i < testRuns; i++) {
      const winners = raffle(raffleOnlyParticipants, "seed_" + i, winnerCount);

      for (const winner of winners) {
        tally[winner] += 1;
      }
    }

    console.log(tally); // Output tally just for manual verification

    // Check that the amount of times each participant won was proportional to their weight
    // We use some tolerance. As testRuns increases, the actual tally gets relatively closer to the expected tally
    for (const raffleAddress of raffleOnlyParticipants.raffleAddresses) {
      const addressTally = tally[raffleAddress.address];
      const expectedTally =
        (raffleAddress.raffle_weight / totalWeight) * testRuns;
      const tolerance = expectedTally * 0.02; // 2% upper/lower tolerance
      expect(addressTally).toBeGreaterThan(expectedTally - tolerance);
      expect(addressTally).toBeLessThan(expectedTally + tolerance);
    }
  });

  it("always gets the same result for the same seed", () => {
    const testRuns = 1000;
    for (let i = 0; i < testRuns; i++) {
      const seed = "seed_" + i;
      expect(raffle(participants, seed, winnerCount)).toEqual(
        raffle(participants, seed, winnerCount)
      );
    }
  });

  it("doesnt include duplicates", () => {
    const testRuns = 1000;
    for (let i = 0; i < testRuns; i++) {
      const winners = raffle(participants, "seed_" + i, winnerCount);
      expect(winners.length).toBe(winnerCount);
      expect(new Set(winners).size).toBe(winnerCount);
    }
  });

  it("works even if the number of expected winners is higher than participants", () => {
    const winners = raffle(participants, "seed", 100);
    expect(winners.length).toBe(8);
  });
});
