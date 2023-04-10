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
import { BigNumber } from "ethers";

var utils = require("ethers").utils;

import {
  NETHERMIND_DEPLOYER_ADDRESS,
  CREATE_AGENT,
  FORTA_CONTRACT_ADDRESS,
} from "./utils";

const TEST_DATA_1 = {
  agentId: BigNumber.from("44444444"),
  owner: "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8",
  chainIds: [BigNumber.from("333")],
  metadata: "abcdefghi",
};
const TEST_DATA_2 = {
  agentId: BigNumber.from("4444"),
  owner: createAddress("0x44"),
  chainIds: [BigNumber.from("222")],
  metadata: "jklmnopqr",
};

const TEST_DEPLOYER_ADDRESS = createAddress("0x123");
const TEST_FORTA_ADDRESS = createAddress("0x456");

describe("Nethermind Agent", () => {
  let handleTransaction: HandleTransaction;
  let fortaProxy = new Interface([CREATE_AGENT]);
  let txEvent;
  let findings: Finding[];

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      CREATE_AGENT,
      FORTA_CONTRACT_ADDRESS,
      TEST_DEPLOYER_ADDRESS
    );
  });
  it("returns empty findings if no transactions", async () => {
    let txEvent = new TestTransactionEvent();
     findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if it's a different deployer", async () => {
    const TEST_DEPLOYER = createAddress("0x1");
    console.log("reached here")
     txEvent = new TestTransactionEvent()
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
          [BigNumber.from(TEST_DATA_1.chainIds[0])],
        ],
      });

     findings = await handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

 
    it("returns a finding when there's a bot deployment from Nethermind To Forta", async () => {
      const mockTxEvent: TestTransactionEvent = new TestTransactionEvent()
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .setTo(FORTA_CONTRACT_ADDRESS)
        .addTraces({
          to: FORTA_CONTRACT_ADDRESS,
          from: NETHERMIND_DEPLOYER_ADDRESS,
          function: "" || fortaProxy.getFunction("createAgent") || undefined,
          arguments:[
            TEST_DATA_1.agentId,
          TEST_DATA_1.owner,
            [BigNumber.from(TEST_DATA_1.chainIds[0])],
            TEST_DATA_1.metadata,

          ],
        });
      const findings = await handleTransaction(mockTxEvent);
      const expectedFinding = {
        name: "New Nethermind Bot Created",
        description: `New bot deployed by NM`,
        alertId: "FORTA-NM",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          agentId: TEST_DATA_1.agentId,
          owner: TEST_DATA_1.owner,
          chainIds: TEST_DATA_1.chainIds[0],
          metadata: TEST_DATA_1.metadata,
        },

      }
      expect(findings.length).toStrictEqual(1);
      expect(findings).toStrictEqual([expectedFinding]);
    });


   

  });

 

