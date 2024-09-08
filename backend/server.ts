import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  encodeFunctionData,
  labelhash,
  type Hex,
  encodeAbiParameters,
  parseAbiParameters,
  keccak256,
} from "viem";
//import { namehash,  } from '@ensdomains/ensjs/utils';

import { eq, inArray, and, or, sql } from "drizzle-orm";
import { DatabaseConnection } from "./database";
import { RequestStore } from "./database/schema";

import { mintNFT } from "./contracts/scripts/mint-nft";

import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

//import { mint } from "./con";

import {} from "viem";

import { env } from "bun";

import cors from "cors";

const app = express();
const port = 3000;

import { EtherscanProvider, Networkish, BlockTag, N } from "ethers"; //^v6

const ETHERSCAN_API_KEY = env.ETHERSCAN_API_KEY;

const ENS_BASE_REGISTRAR_CONTRACT_ADDRESS =
  "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
const ENS_OLD_REGISTRAR_CONTRACT_ADDRESS =
  "0x283af0b28c62c092c9727f1ee09c02ca627eb7f5";

const ENS_BASE_REGISTRAR_CONTRACT_ADDRESS_SEPOLIA =
  "0x0635513f179d50a207757e05759cbd106d7dfce8";

export default class MyEtherscanProvider extends EtherscanProvider {
  constructor(networkish: Networkish, apiKey?: string) {
    super(networkish, apiKey);
  }

  async getHistory(
    address: string,
    startBlock?: BlockTag,
    endBlock?: BlockTag,
  ): Promise<Array<any>> {
    const params = {
      action: "txlist",
      address,
      startblock: startBlock == null ? 0 : startBlock,
      endblock: endBlock == null ? 99999999 : endBlock,
      sort: "asc",
    };

    return this.fetch("account", params);
  }
}

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type",
  );

  // // Set to true if you need the website to include cookies in the requests sent
  // // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', "1");

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json());

function sendSuccessResponse(res: Response, message: string): void {
  res.status(200).send(message);
}

function sendBadRequestResponse(res: Response, message: string): void {
  res.status(400).send(message);
}

function handleError(error: any, res: Response): void {
  console.error("Error processing webhook:", error);
  res.status(500).send("Internal Server Error");
}

app.get(
  "/owned_domains_list/:owner_id",
  async (req: Request, res: Response) => {
    const { db } = DatabaseConnection.get();

    const orders = await db.select().from(Order).execute();

    res.json(orders);
  },
);

app.get("/request_status/:domain_name", async (req: Request, res: Response) => {
  const domain_name = req.params.domain_name;
  const { db } = DatabaseConnection.get();

  const requestStatus = await db
    .select()
    .from(RequestStore)
    .where(eq(RequestStore.domain_name, domain_name))
    //.limit(12)
    .execute();

  res.json(requestStatus);
});

app.get(
  //app.post(
  "/proccess_loyality_check/:owner_address/:domain_name",
  async (req: Request, res: Response) => {
    const { db } = DatabaseConnection.get();
    //const { db } = DatabaseConnection.get();

    const domain_owner_address = req.params.owner_address;
    const domain_name = req.params.domain_name;

    console.log("Received loalty check request");
    console.log("Domain name: " + domain_name);
    console.log("Owner address: " + domain_owner_address);

    // 1 Step: List all transactions of user address
    const myEtherScanInstance = new MyEtherscanProvider(
      "sepolia", // "mainnet",
      ETHERSCAN_API_KEY,
    );
    const accountTransactions =
      await myEtherScanInstance.getHistory(domain_owner_address);

    console.log("Count of transactions on account: ");
    //console.log(accountTransactions);

    // 2 Step: Calculate the TokenID of domain
    var splittedDomainName = domain_name.split(".");
    console.log(splittedDomainName);
    const labelHash = labelhash(splittedDomainName[0]);
    //  BigInt(labelhash(labels[0]))
    const tokenId = BigInt(labelHash);
    console.log(
      `LabelHash of ENS domain: ${labelHash}
      TokenID of ENS domain: ${tokenId}`,
    );

    // 3 Step: calculate storage slot to check
    //
    let storageSlot = keccak256(
      encodeAbiParameters(parseAbiParameters("uint256, bytes32"), [
        BigInt(
          tokenId,
          //"34932455235789617799887711663424096294777565293202346903293947425287954896220",
        ),
        "0x0000000000000000000000000000000000000000000000000000000000000005",
      ]),
    );

    console.log(
      `Calculated storage slot for domain owner mapping: ${storageSlot}`,
    );

    // 4 Step: Generate query/queries to HDP to prove specific blocks
    var hdpComputeCounts = 0;
    var blockNumbersToCheck: Array<string> = [];
    for (const transaction of accountTransactions) {
      // Filter transactions to only take the transactions outgoing to ens registrar(s)
      //console.log(transaction.from);
      //console.log(domain_owner_address);
      if (
        transaction.from.toLowerCase() == domain_owner_address.toLowerCase()
      ) {
        hdpComputeCounts++;
        // if (
        //   transaction.to.toLowerCase() ==
        //   ENS_BASE_REGISTRAR_CONTRACT_ADDRESS.toLowerCase()
        // ) {
        //   console.log(
        //     `Detected ENS related transaction to BASE registrar at position ${transaction.nonce} in block ${transaction.blockNumber}`,
        //   );
        //   blockNumbersToCheck.push(transaction.blockNumber);
        //   console.log(`HDP query #${hdpComputeCounts}:
        //     Determine if at the contract ${ENS_BASE_REGISTRAR_CONTRACT_ADDRESS} at block ${transaction.blockNumber} at storage slot ${storageSlot} the stored value was ${domain_owner_address} which is the address of domain owner`);
        // }

        // if (
        //   transaction.to.toLowerCase() ==
        //   ENS_OLD_REGISTRAR_CONTRACT_ADDRESS.toLowerCase()
        // ) {
        //   hdpComputeCounts++;
        //   console.log(
        //     `Detected ENS related transaction to OLD registrar at position ${transaction.nonce} in block ${transaction.blockNumber}`,
        //   );
        //   blockNumbersToCheck.push(transaction.blockNumber);
        //   console.log(`HDP query #${hdpComputeCounts}:
        //     Determine if at the contract ${ENS_OLD_REGISTRAR_CONTRACT_ADDRESS}  at block ${transaction.blockNumber} at storage slot ${storageSlot} the stored value was ${domain_owner_address} which is the address of domain owner`);
        // }

        if (
          transaction.to.toLowerCase() ==
          ENS_BASE_REGISTRAR_CONTRACT_ADDRESS_SEPOLIA.toLowerCase()
        ) {
          console.log(
            `Detected ENS related transaction to BASE registrar at position ${transaction.nonce} in block ${transaction.blockNumber}`,
          );
          blockNumbersToCheck.push(transaction.blockNumber);
          console.log(`HDP query #${hdpComputeCounts}:
            Determine if at the contract ${ENS_BASE_REGISTRAR_CONTRACT_ADDRESS_SEPOLIA} at block ${transaction.blockNumber} at storage slot ${storageSlot} the stored value was ${domain_owner_address} which is the address of domain owner`);
        }
      }
    }

    console.log(
      `Block numbers need to be checked by HDP: ${blockNumbersToCheck}`,
    );

    const requestDataObj = {
      domain_name: domain_name,
      domain_owner_address: domain_owner_address,
      status: "STARTED_GENERATING_PROOFS",
    };

    const [existingRequestData] = await db
    .select()
    .from(RequestStore)
    .where(eq(RequestStore.domain_name, domain_name))
    .execute();

  if (!existingRequestData || !existingRequestData.domain_name) {
    const [requestData] = await db
      .insert(RequestStore)
      .values(requestDataObj)
      .returning();
  } else {
    console.log("Request already exists");
  }

    // HDP check to be done

    // // Sned compiled cairo to program registry
    // // Path to your file
    // const compiledCairoModulefilePath = 'cairo/target/dev/cairo_contract.compiled_contract_class.json';

    // // Create form data
    // const formData = new FormData();
    // formData.append('program', fs.createReadStream(compiledCairoModulefilePath));

    // // Send the POST request
    // axios.post('http://program-registery.api.herodotus.cloud/upload-program', formData, {
    //     headers: {
    //         ...formData.getHeaders()
    //     }
    // })
    // .then(response => {
    //     console.log('Compiled Cairo File uploaded successfully:', response.data);
    // })
    // .catch(error => {
    //     console.error('Compiled Cairo File Error uploading file:', error);
    // });

    //http://program-registery.api.herodotus.cloud

    // 5 Step: Send queries to HDP and wait for reply

    // 6 Step: Check all HDP proofs onchain

    // 7 Step: Send appropriate NFT mintong transaction on Optimism sepolia
    let loyalYears = 1;
    const transactionHash = await mintNFT(loyalYears);

    await db
    .update(RequestStore)
    .set({ status: "PROOF_DONE", nft_mint_transaction_hash: transactionHash })
    .where(eq(RequestStore.domain_name, domain_name))
    .execute();

    return res.json({
      success: true,
      domain_token_id: String(tokenId),
      storage_slot: storageSlot,
      all_account_transactions: accountTransactions,
    });
  },
);


/// When we finish the hdp proving and computation we change the state of request in the database

app.post("/webhook", async (req: Request, res: Response) => {
  await handleWebhook(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
