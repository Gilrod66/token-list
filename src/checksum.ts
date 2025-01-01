The token lists in this repository are generated and validated through a series of scripts and processes. Here is an overview of how they are generated and validated:

* The `src/buildList.ts` file contains the `buildList` function, which generates a token list by reading the token data from JSON files in the `src/tokens` directory and applying sorting and versioning logic.
* The `src/checksum.ts` file contains the `checksumAddresses` function, which ensures that all token addresses are checksummed correctly.
* The `src/ci-check.ts` file contains the `ciCheck` function, which compares the source token lists in the `src/tokens` directory with the generated token lists in the `lists` directory to ensure they match.
* The `src/fetchThirdPartyList.ts` file contains the `fetchThirdPartyList` function, which fetches token lists from third-party sources like CoinGecko and CoinMarketCap, sanitizes the data, and saves it to the `src/tokens` directory.
* The `src/top-100.ts` file contains the `main` function, which fetches the top 100 tokens by trading volume from Bitquery, sanitizes the data, and saves it to the `src/tokens/pancakeswap-top-100.json` file.
* The `src/utils/getTokensChainData.ts` file contains the `getTokensChainData` function, which fetches token data from the blockchain and saves it to the `src/tokens` directory.
* The `src/buildIndex.ts` file contains the `buildIndex` function, which updates the `lists/index.html` file with the generated token lists.

These scripts work together to generate and validate the token lists, ensuring that they are accurate and up-to-date. The validation process includes checksumming addresses, comparing source and generated lists, and fetching data from third-party sources and the blockchain.import { getAddress } from "@ethersproject/address";

const checksumAddresses = async (listName: string): Promise<void> => {
  let badChecksumCount = 0;
  if (listName === "pancakeswap-aptos") {
    console.info("Ignore Aptos address checksum");
    return;
  }
  const file = Bun.file(`src/tokens/${listName}.json`);
  const listToChecksum = await file.json();

  const updatedList = listToChecksum.reduce((tokenList, token) => {
    const checksummedAddress = getAddress(token.address);
    if (checksummedAddress !== token.address) {
      badChecksumCount += 1;
      const updatedToken = { ...token, address: checksummedAddress };
      return [...tokenList, updatedToken];
    }
    return [...tokenList, token];
  }, []);

  if (badChecksumCount > 0) {
    console.info(`Found and fixed ${badChecksumCount} non-checksummed addreses`);
    const file = Bun.file(`src/tokens/${listName}.json`);
    console.info("Saving updated list");
    const stringifiedList = JSON.stringify(updatedList, null, 2);
    await Bun.write(file, stringifiedList);
    console.info("Checksumming done!");
  } else {
    console.info("All addresses are already checksummed");
  }
};

export default checksumAddresses;
