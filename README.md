# Denosync

Deno WebSocket Chainsync client on top of [Ogmios](https://ogmios.dev/).

## Get started

```ts
import {
  Block,
  createClient,
  getBlockEra,
  Point,
  POINT_SHELLEY_START,
  toShelleyCompatibleBlock,
} from "./mod.ts";

function rollForward(block: Block) {
  const { shelleyBlock } = toShelleyCompatibleBlock(block)!;
  const era = getBlockEra(block);
  const point: Point = {
    hash: shelleyBlock.headerHash,
    slot: shelleyBlock.header.slot,
  };
  console.log(era);
  console.log(point);
}

function rollBackward(point: Point) {
  console.log(point);
}

const client = await createClient({
  url: "ws://localhost:1337",
  startPoint: POINT_SHELLEY_START,
}, {
  rollBackward,
  rollForward,
});

client.start();
```

