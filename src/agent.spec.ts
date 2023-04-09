import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { Interface } from "@ethersproject/abi";
import ethers from "ethers";

var utils = require("ethers").utils;

import {
  NETHERMIND_DEPLOYER_ADDRESS,
  CREATE_AGENT,
  FORTA_CONTRACT_ADDRESS,
} from "./utils";
const TEST_DATA_1 = {
  agentId: utils.bigNumberify.from("444"),
  owner: createAddress("0x4"),
  chainIds: [utils.bigNumberify.from("333")],
  metadata: "abcdefghi",
};
const TEST_DATA_2 = {
  agentId: utils.bigNumberify.from("4444"),
  owner: createAddress("0x44"),
  chainIds: [utils.bigNumberify.from("3333")],
  metadata: "jklmnopqr",
};

const TEST_DEPLOYER_ADDRESS = createAddress("0x123");
const TEST_FORTA_ADDRESS = createAddress("0x456");

describe("Nethermind Agent", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT]);

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      CREATE_AGENT,
      FORTA_CONTRACT_ADDRESS,
      TEST_DEPLOYER_ADDRESS
    );
  });
  it("returns empty findings if no transactions", async () => {
    let txEvent = new TestTransactionEvent();
    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if it's a different deployer", async () => {
    const TEST_DEPLOYER = createAddress("0x1");
    console.log("reached here")
    let txEvent = new TestTransactionEvent()
      .setFrom(TEST_DEPLOYER)
      .setTo(FORTA_CONTRACT_ADDRESS)
      .addTraces({
        function: "" || fortaProxy.getFunction("createAgent") || undefined,
        to: FORTA_CONTRACT_ADDRESS,
        from: TEST_DEPLOYER,

        arguments: [
          TEST_DATA_1.agentId,
          TEST_DEPLOYER,
          TEST_DATA_1.metadata,
          [utils.bigNumberify.from(TEST_DATA_1.chainIds[0])],
        ],
      });

    const findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

 
});
