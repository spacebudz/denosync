import {
  Block,
  BlockShelleyCompatible,
  Client,
  ClientConfig,
  Era,
  Point,
  ProtocolParametersAlonzo,
  ProtocolParametersBabbage,
  ProtocolParametersShelley,
  RollCallbacks,
  ShelleyCompactBlockHeader,
  StandardBlock,
} from "./types.ts";

export function getBlockEra(block: Block): Era {
  return Object.keys(block)[0] as Era;
}

export function toByronBlock(block: Block): StandardBlock | null {
  return block.byron as StandardBlock || null;
}

// deno-lint-ignore no-explicit-any
function toShelleyCompactHeader(header: any): ShelleyCompactBlockHeader {
  return {
    blockHash: header.blockHash,
    blockHeight: header.blockHeight,
    blockSize: header.blockSize,
    prevHash: header.prevHash,
    slot: header.slot,
  };
}

export function toShelleyCompatibleBlock(
  block: Block,
): { shelleyBlock: BlockShelleyCompatible; era: Era } | null {
  const era = getBlockEra(block);
  if (era === "byron") return null;
  const blockEra = block[era];
  if (!blockEra) return null;

  const header = toShelleyCompactHeader(blockEra.header);
  const headerHash = blockEra.headerHash;
  // deno-lint-ignore no-explicit-any
  const body = blockEra.body.map((tx: any) => {
    if (era === "shelley") {
      return {
        ...tx,
        body: {
          ...tx.body,
          validityInterval: {
            invalidBefore: null,
            invalidHereafter: tx.body.timeToLive || null,
          },
        },
      };
    } else {
      return tx;
    }
  });

  return { shelleyBlock: { header, headerHash, body }, era };
}

export const SHELLEY_START: Point = {
  slot: 4492799,
  hash: "f8084c61b6a238acec985b59310b6ecec49c0ab8352249afd7268da5cff2a457",
};

export async function createClient(
  { url, startPoint }: ClientConfig,
  callbacks: RollCallbacks,
): Promise<Client> {
  const client = new WebSocket(url);

  function wsp(methodname: string, args: unknown, mirror?: unknown) {
    client.send(JSON.stringify({
      type: "jsonwsp/request",
      version: "1.0",
      servicename: "ogmios",
      methodname,
      args,
      mirror,
    }));
  }

  client.addEventListener("message", async (msg: MessageEvent<string>) => {
    const response = JSON.parse(msg.data);

    switch (response.methodname) {
      case "FindIntersect":
        if (!response.result.IntersectionFound) {
          throw "Intersection not found.";
        }
        wsp("RequestNext", {});
        break;

      case "RequestNext":
        if (response.result.RollForward) {
          await callbacks.rollForward(response.result.RollForward.block);
        } else if (response.result.RollBackward) {
          await callbacks.rollBackward(response.result.RollBackward.point);
        } else {
          throw "RequestNext could not move forward or backward.";
        }
        wsp("RequestNext", {});
    }
  });
  await new Promise((res) => {
    client.addEventListener("open", () => {
      if (startPoint) {
        wsp("FindIntersect", { points: [startPoint] });
      }
      return res(1);
    }, { once: true });
  });
  return {
    start: () => {
      for (let i = 0; i < 100; i += 1) {
        wsp("RequestNext", {});
      }
    },
    stop: () => client.close(),
  };
}

export const isShelleyProtocolParameters = (
  params:
    | ProtocolParametersShelley
    | ProtocolParametersAlonzo
    | ProtocolParametersBabbage,
): params is ProtocolParametersShelley =>
  (params as ProtocolParametersShelley).minUtxoValue !== undefined;

export const isAlonzoProtocolParameters = (
  params:
    | ProtocolParametersShelley
    | ProtocolParametersAlonzo
    | ProtocolParametersBabbage,
): params is ProtocolParametersAlonzo =>
  (params as ProtocolParametersAlonzo).coinsPerUtxoWord !== undefined;

export const isBabbageProtocolParameters = (
  params:
    | ProtocolParametersShelley
    | ProtocolParametersAlonzo
    | ProtocolParametersBabbage,
): params is ProtocolParametersBabbage =>
  (params as ProtocolParametersBabbage).coinsPerUtxoByte !== undefined;