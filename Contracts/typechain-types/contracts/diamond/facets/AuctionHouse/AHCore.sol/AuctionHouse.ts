/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../../../common";

export declare namespace LibAuctionHouse {
  export type TradeStruct = {
    seller: AddressLike;
    buyer: AddressLike;
    pixels: BigNumberish[][];
    price: BigNumberish;
  };

  export type TradeStructOutput = [
    seller: string,
    buyer: string,
    pixels: bigint[][],
    price: bigint
  ] & { seller: string; buyer: string; pixels: bigint[][]; price: bigint };
}

export interface AuctionHouseInterface extends Interface {
  getFunction(
    nameOrSignature: "cancelTrade" | "closeTrade" | "getTrade" | "openTrade"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "TradeClosed" | "TradeOpened"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "cancelTrade",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "closeTrade",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "getTrade", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "openTrade",
    values: [AddressLike, BigNumberish[][], BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "cancelTrade",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "closeTrade", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getTrade", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "openTrade", data: BytesLike): Result;
}

export namespace TradeClosedEvent {
  export type InputTuple = [
    seller: AddressLike,
    buyer: AddressLike,
    pixels: BigNumberish[][]
  ];
  export type OutputTuple = [seller: string, buyer: string, pixels: bigint[][]];
  export interface OutputObject {
    seller: string;
    buyer: string;
    pixels: bigint[][];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TradeOpenedEvent {
  export type InputTuple = [seller: AddressLike, id: BytesLike];
  export type OutputTuple = [seller: string, id: string];
  export interface OutputObject {
    seller: string;
    id: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface AuctionHouse extends BaseContract {
  connect(runner?: ContractRunner | null): AuctionHouse;
  waitForDeployment(): Promise<this>;

  interface: AuctionHouseInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  cancelTrade: TypedContractMethod<[id: BytesLike], [void], "nonpayable">;

  closeTrade: TypedContractMethod<[id: BytesLike], [void], "payable">;

  getTrade: TypedContractMethod<
    [id: BytesLike],
    [LibAuctionHouse.TradeStructOutput],
    "view"
  >;

  openTrade: TypedContractMethod<
    [buyer: AddressLike, pixels: BigNumberish[][], price: BigNumberish],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cancelTrade"
  ): TypedContractMethod<[id: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "closeTrade"
  ): TypedContractMethod<[id: BytesLike], [void], "payable">;
  getFunction(
    nameOrSignature: "getTrade"
  ): TypedContractMethod<
    [id: BytesLike],
    [LibAuctionHouse.TradeStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "openTrade"
  ): TypedContractMethod<
    [buyer: AddressLike, pixels: BigNumberish[][], price: BigNumberish],
    [void],
    "payable"
  >;

  getEvent(
    key: "TradeClosed"
  ): TypedContractEvent<
    TradeClosedEvent.InputTuple,
    TradeClosedEvent.OutputTuple,
    TradeClosedEvent.OutputObject
  >;
  getEvent(
    key: "TradeOpened"
  ): TypedContractEvent<
    TradeOpenedEvent.InputTuple,
    TradeOpenedEvent.OutputTuple,
    TradeOpenedEvent.OutputObject
  >;

  filters: {
    "TradeClosed(address,address,uint8[][])": TypedContractEvent<
      TradeClosedEvent.InputTuple,
      TradeClosedEvent.OutputTuple,
      TradeClosedEvent.OutputObject
    >;
    TradeClosed: TypedContractEvent<
      TradeClosedEvent.InputTuple,
      TradeClosedEvent.OutputTuple,
      TradeClosedEvent.OutputObject
    >;

    "TradeOpened(address,bytes32)": TypedContractEvent<
      TradeOpenedEvent.InputTuple,
      TradeOpenedEvent.OutputTuple,
      TradeOpenedEvent.OutputObject
    >;
    TradeOpened: TypedContractEvent<
      TradeOpenedEvent.InputTuple,
      TradeOpenedEvent.OutputTuple,
      TradeOpenedEvent.OutputObject
    >;
  };
}
