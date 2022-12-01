import {
  AuxiliaryData,
  BlockAllegra,
  BlockAlonzo,
  BlockBabbage,
  BlockByron,
  BlockMary,
  BlockShelley,
  BootstrapWitness,
  Certificate,
  Datum,
  DigestBlake2BBlockBody,
  DigestBlake2BScriptIntegrity,
  DigestBlake2BVerificationKey,
  Lovelace,
  Network,
  Null,
  Point,
  ProtocolParametersAlonzo,
  ProtocolParametersBabbage,
  ProtocolParametersShelley,
  Redeemer,
  Script,
  Signature,
  StandardBlock,
  TxIn,
  TxOut,
  UpdateAlonzo,
  UpdateBabbage,
  UpdateShelley,
  ValidityInterval,
  Value,
  Withdrawals,
} from "https://raw.githubusercontent.com/CardanoSolutions/ogmios/v5.5.7/clients/TypeScript/packages/schema/src/index.ts";
export type {
  Point,
  ProtocolParametersAlonzo,
  ProtocolParametersBabbage,
  ProtocolParametersShelley,
  StandardBlock,
};

export type BlockHeaderShelleyCompact = {
  blockHash: string;
  blockHeight: number;
  blockSize: number;
  prevHash: string;
  slot: number;
};

export type TxShelleyCompatible = {
  id: DigestBlake2BBlockBody;
  inputSource?: "inputs" | "collaterals";
  body: {
    inputs: TxIn[];
    references?: TxIn[];
    collaterals?: TxIn[];
    collateralReturn?: TxOut | null;
    totalCollateral?: Lovelace | null;
    outputs: TxOut[];
    certificates: Certificate[];
    withdrawals: Withdrawals;
    fee: Lovelace;
    validityInterval: ValidityInterval;
    update: UpdateShelley | UpdateAlonzo | UpdateBabbage; // This can probably be done better
    mint?: Value;
    network?: Network | null;
    scriptIntegrityHash?: DigestBlake2BScriptIntegrity | null;
    requiredExtraSignatures?: DigestBlake2BVerificationKey[];
  };
  witness: {
    signatures: {
      [k: string]: Signature;
    };
    scripts: {
      [k: string]: Script;
    };
    bootstrap: BootstrapWitness[];
    datums?: {
      [k: string]: Datum;
    };
    redeemers?: {
      [k: string]: Redeemer;
    };
  };
  metadata: AuxiliaryData | Null;
  /**
   * The raw serialized transaction, as found on-chain.
   */
  raw: string;
};

export type BlockShelleyCompatible = {
  body: TxShelleyCompatible[];
  header: BlockHeaderShelleyCompact;
  headerHash: string;
};

export type Era =
  | "byron"
  | "shelley"
  | "allegra"
  | "mary"
  | "alonzo"
  | "babbage";

export type Block = {
  byron?: BlockByron;
  shelley?: BlockShelley;
  allegra?: BlockAllegra;
  mary?: BlockMary;
  alonzo?: BlockAlonzo;
  babbage?: BlockBabbage;
};

export type RollCallbacks = {
  rollBackward: (point: Point) => unknown;
  rollForward: (block: Block) => unknown;
};

export type ClientConfig = {
  url: string;
  startPoint?: Point | "origin" | "tip";
  compact?: boolean;
};

export type Client = {
  start: () => void;
  stop: () => void;
};
