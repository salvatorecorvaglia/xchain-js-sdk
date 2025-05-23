import type {Abi, Client, GetContractEventsParameters, GetContractReturnType} from "viem";

type OmitWrite<T> = Omit<T, "write">;
export type GetReadContractReturnType<TAbi extends Abi> = OmitWrite<GetContractReturnType<TAbi, Client>>;

export type EventParams = Pick<GetContractEventsParameters, "strict" | "fromBlock" | "toBlock">;
export type GetEventParams = { eventParams: EventParams };
