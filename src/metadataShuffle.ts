import seedrandom from "seedrandom";
import fs from "fs";
import _ from "lodash";

interface Mapping {
  [hash: string]: number;
}

const metadataShuffle = (_hashes: string[], seed: string): Mapping => {
  const hashes = _.clone(_hashes);
  const shuffled = [];
  const rng = seedrandom(seed);
  const mapping: Mapping = {};

  while (hashes.length) {
    const index = Math.abs(rng.int32()) % hashes.length;
    const [hash] = hashes.splice(index, 1);
    mapping[hash] = shuffled.length;
    shuffled.push(hash);
  }

  return mapping;
};

export default metadataShuffle;

// Execute script only when called via CLI
if (require.main === module) {
  const seed = process.argv[2];

  if (!seed) {
    console.log("Please pass the seed string as command line argument");
    console.log("i.e. npm run metadata-shuffle 0x1234");
    process.exit(1);
  }

  const hashes = JSON.parse(
    fs.readFileSync("./metadataHashes.json").toString()
  );

  const mapping = metadataShuffle(hashes, seed);
  const mappingJson = JSON.stringify(mapping, null, 2);
  console.log("Hash to tokenID mapping:\n", mappingJson);

  const outputFilename = "metadataMapping.json";
  fs.writeFileSync(outputFilename, mappingJson);
  console.log(`Wrote ${outputFilename}`);
}
