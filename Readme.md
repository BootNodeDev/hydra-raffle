## NeverFearTruth raffle and metadata shuffle scripts

### Usage

#### Install dependencies

`npm install`

#### Run raffle script

`npm run raffle MY_SEED NUMBER_OF_WINNERS INPUT_FILENAME`

Example

`npm run raffle 0x38947 5 participants.json`

Winner addresses are written to winners.json file

#### Run metadata shuffle script

`npm run metadata-shuffle MY_SEED INPUT_FILENAME`

Example

`npm run metadata-shuffle 0x45879 metadataHashes.json`

Metadata hashes to tokenId mappings are written to metadataMapping.json
