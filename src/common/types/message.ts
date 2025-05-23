import type {MessageAdapterParamsType} from "./adapter.js";
import type {GenericAddress} from "./address.js";
import type {FolksChainId} from "./chain.js";
import type {AccountId, LoanId, LoanName, LoanTypeId, Nonce} from "./lending.js";
import type {RewardsTokenId} from "./rewards.js";
import type {FolksHubTokenType, FolksSpokeTokenType, FolksTokenId as LendingTokenId} from "./token.js";
import type {PoolEpoch, ReceiveRewardToken} from "../../chains/evm/hub/types/rewards-v2.js";
import type {NonEmptyArray} from "../../types/generics.js";
import type {
    FINALITY,
    HUB_ACTIONS,
    RECEIVE_TOKEN_ACTIONS,
    REVERSIBLE_HUB_ACTIONS,
    SEND_TOKEN_ACTIONS,
} from "../constants/message.js";
import type {Hex} from "viem";

export enum AdapterType {
  HUB = 1,
  WORMHOLE_DATA = 2,
  WORMHOLE_CCTP = 3,
  CCIP_DATA = 4,
  CCIP_TOKEN = 5,
}

export enum Action {
  // SPOKE -> HUB
  CreateAccount,
  InviteAddress,
  AcceptInviteAddress,
  UnregisterAddress,
  AddDelegate,
  RemoveDelegate,
  CreateLoan,
  DeleteLoan,
  CreateLoanAndDeposit,
  Deposit,
  DepositFToken,
  Withdraw,
  WithdrawFToken,
  Borrow,
  Repay,
  RepayWithCollateral,
  Liquidate,
  SwitchBorrowType,
  // HUB -> SPOKE
  SendToken,
  // CUSTOM,
  ClaimRewardsV2,
}

export type SendTokenAction = Extract<Action, (typeof SEND_TOKEN_ACTIONS)[number]>;
export type ReceiveTokenAction = Extract<Action, (typeof RECEIVE_TOKEN_ACTIONS)[number]>;
export type HubAction = Extract<Action, (typeof HUB_ACTIONS)[number]>;

export type ReversibleHubAction = Extract<Action, (typeof REVERSIBLE_HUB_ACTIONS)[number]>;

export type DataAction = Extract<
  Action,
  | Action.CreateAccount
  | Action.InviteAddress
  | Action.AcceptInviteAddress
  | Action.UnregisterAddress
  | Action.AddDelegate
  | Action.RemoveDelegate
  | Action.CreateLoan
  | Action.DeleteLoan
  | Action.RepayWithCollateral
  | Action.SwitchBorrowType
>;

export type ClaimRewardAction = Extract<Action, Action.ClaimRewardsV2>;

export type Finality = (typeof FINALITY)[keyof typeof FINALITY];

export type MessageAdapters = {
  adapterId: AdapterType;
  returnAdapterId: AdapterType;
};

export type SupportedMessageAdapters = {
  adapterIds: NonEmptyArray<AdapterType>;
  returnAdapterIds: NonEmptyArray<AdapterType>;
};

export type SupportedRewardMessageAdapters = {
  adapterIds: NonEmptyArray<AdapterType>;
  returnAdapterIds: Partial<Record<RewardsTokenId, NonEmptyArray<AdapterType>>>;
};

export type SupportedMessageAdaptersMap = {
  [MessageAdapterParamsType.SendToken]: SupportedMessageAdapters;
  [MessageAdapterParamsType.ReceiveToken]: SupportedMessageAdapters;
  [MessageAdapterParamsType.Data]: SupportedMessageAdapters;
  [MessageAdapterParamsType.ClaimReward]: SupportedRewardMessageAdapters;
};

export type FeeParams = {
  receiverValue: bigint;
  gasLimit: bigint;
  returnGasLimit: bigint;
};

export type MessageParams = FeeParams & MessageAdapters;

export type OptionalFeeParams = Partial<FeeParams>;

export type Payload = {
  action: Action;
  accountId: AccountId;
  userAddr: GenericAddress;
  data: Hex;
};

export type MessageToSend = {
  params: MessageParams;
  sender: GenericAddress;
  destinationChainId: number;
  handler: GenericAddress;
  payload: Hex;
  finalityLevel: Finality;
  extraArgs: Hex;
};

// Data
export type DefaultMessageData = "0x";

// Data: account
export type CreateAccountMessageData = {
  nonce: Nonce;
  refAccountId: AccountId;
};

export type InviteAddressMessageData = {
  folksChainIdToInvite: FolksChainId;
  addressToInvite: GenericAddress;
  refAccountId: AccountId;
};

export type UnregisterAddressMessageData = {
  folksChainIdToUnregister: FolksChainId;
};

// Data: loan
export type CreateLoanMessageData = {
  nonce: Nonce;
  loanTypeId: LoanTypeId;
  loanName: LoanName;
};

export type DeleteLoanMessageData = {
  accountId: AccountId;
  loanId: LoanId;
};

export type CreateLoanAndDepositMessageData = {
  nonce: Nonce;
  poolId: number;
  amount: bigint;
  loanTypeId: LoanTypeId;
  loanName: LoanName;
};

export type DepositMessageData = {
  loanId: LoanId;
  poolId: number;
  amount: bigint;
};

export type WithdrawMessageData = {
  loanId: LoanId;
  poolId: number;
  receiverFolksChainId: FolksChainId;
  amount: bigint;
  isFAmount: boolean;
};

export type BorrowMessageData = {
  loanId: LoanId;
  poolId: number;
  receiverFolksChainId: FolksChainId;
  amount: bigint;
  maxStableRate: bigint;
};

export type RepayMessageData = {
  loanId: LoanId;
  poolId: number;
  amount: bigint;
  maxOverRepayment: bigint;
};

export type RepayWithCollateralMessageData = {
  loanId: LoanId;
  poolId: number;
  amount: bigint;
};

export type SwitchBorrowTypeMessageData = {
  loanId: LoanId;
  poolId: number;
  maxStableRate: bigint;
};

export type LiquidateMessageData = {
  violatorLoanId: LoanId;
  liquidatorLoanId: LoanId;
  colPoolId: number;
  borPoolId: number;
  repayingAmount: bigint;
  minSeizedAmount: bigint;
};

export type SendTokenMessageData = {
  amount: bigint;
};

export type ClaimRewardsV2MessageData = {
  poolEpochsToClaim: Array<PoolEpoch>;
  rewardTokensToReceive: Array<ReceiveRewardToken>;
};

// Extra args
export type DefaultExtraArgs = "0x";

// Extra args: loan
export type DepositExtraArgs = {
  token: FolksSpokeTokenType;
  recipient: GenericAddress;
  amount: bigint;
};

export type RepayExtraArgs = {
  token: FolksSpokeTokenType;
  recipient: GenericAddress;
  amount: bigint;
};

export type SendTokenExtraArgs = {
  folksTokenId: LendingTokenId | RewardsTokenId;
  token: FolksHubTokenType;
  recipient: GenericAddress;
  amount: bigint;
};

export type OverrideTokenData = {
  folksTokenId: LendingTokenId | RewardsTokenId;
  token: FolksSpokeTokenType;
  address: GenericAddress;
  amount: bigint;
};

export type MessageDataMap = {
  [Action.AcceptInviteAddress]: DefaultMessageData;
  [Action.AddDelegate]: DefaultMessageData;
  [Action.RemoveDelegate]: DefaultMessageData;
  [Action.DepositFToken]: DefaultMessageData;
  [Action.WithdrawFToken]: DefaultMessageData;
  [Action.CreateAccount]: CreateAccountMessageData;
  [Action.InviteAddress]: InviteAddressMessageData;
  [Action.UnregisterAddress]: UnregisterAddressMessageData;
  [Action.CreateLoan]: CreateLoanMessageData;
  [Action.DeleteLoan]: DeleteLoanMessageData;
  [Action.CreateLoanAndDeposit]: CreateLoanAndDepositMessageData;
  [Action.Deposit]: DepositMessageData;
  [Action.Withdraw]: WithdrawMessageData;
  [Action.Borrow]: BorrowMessageData;
  [Action.Repay]: RepayMessageData;
  [Action.RepayWithCollateral]: RepayWithCollateralMessageData;
  [Action.SwitchBorrowType]: SwitchBorrowTypeMessageData;
  [Action.Liquidate]: LiquidateMessageData;
  [Action.SendToken]: SendTokenMessageData;
  [Action.ClaimRewardsV2]: ClaimRewardsV2MessageData;
};

// Params
export type DefaultMessageDataParams = {
  action:
    | Action.AcceptInviteAddress
    | Action.AddDelegate
    | Action.RemoveDelegate
    | Action.DepositFToken
    | Action.WithdrawFToken;
  data: DefaultMessageData;
  extraArgs: DefaultExtraArgs;
};

// Params: account
export type CreateAccountMessageDataParams = {
  action: Action.CreateAccount;
  data: CreateAccountMessageData;
  extraArgs: DefaultExtraArgs;
};

export type InviteAddressMessageDataParams = {
  action: Action.InviteAddress;
  data: InviteAddressMessageData;
  extraArgs: DefaultExtraArgs;
};

export type UnregisterAddressMessageDataParams = {
  action: Action.UnregisterAddress;
  data: UnregisterAddressMessageData;
  extraArgs: DefaultExtraArgs;
};

// Params: loan
export type CreateLoanMessageDataParams = {
  action: Action.CreateLoan;
  data: CreateLoanMessageData;
  extraArgs: DefaultExtraArgs;
};

export type DeleteLoanMessageDataParams = {
  action: Action.DeleteLoan;
  data: DeleteLoanMessageData;
  extraArgs: DefaultExtraArgs;
};

export type CreateLoanAndDepositMessageDataParams = {
  action: Action.CreateLoanAndDeposit;
  data: CreateLoanAndDepositMessageData;
  extraArgs: DepositExtraArgs;
};

export type DepositMessageDataParams = {
  action: Action.Deposit;
  data: DepositMessageData;
  extraArgs: DepositExtraArgs;
};

export type WithdrawMessageDataParams = {
  action: Action.Withdraw;
  data: WithdrawMessageData;
  extraArgs: DefaultExtraArgs;
};

export type BorrowMessageDataParams = {
  action: Action.Borrow;
  data: BorrowMessageData;
  extraArgs: DefaultExtraArgs;
};

export type RepayMessageDataParams = {
  action: Action.Repay;
  data: RepayMessageData;
  extraArgs: RepayExtraArgs;
};

export type RepayWithCollateralMessageDataParams = {
  action: Action.RepayWithCollateral;
  data: RepayWithCollateralMessageData;
  extraArgs: DefaultExtraArgs;
};

export type SwitchBorrowTypeMessageDataParams = {
  action: Action.SwitchBorrowType;
  data: SwitchBorrowTypeMessageData;
  extraArgs: DefaultExtraArgs;
};

export type LiquidateMessageDataParams = {
  action: Action.Liquidate;
  data: LiquidateMessageData;
  extraArgs: DefaultExtraArgs;
};

export type SendTokenMessageDataParams = {
  action: Action.SendToken;
  data: SendTokenMessageData;
  extraArgs: SendTokenExtraArgs;
  overrideData: OverrideTokenData;
};

// Params: rewards
export type ClaimRewardsV2MessageDataParams = {
  action: Action.ClaimRewardsV2;
  data: ClaimRewardsV2MessageData;
  extraArgs: DefaultExtraArgs;
};

export type MessageDataParams =
  | DefaultMessageDataParams
  | CreateAccountMessageDataParams
  | InviteAddressMessageDataParams
  | UnregisterAddressMessageDataParams
  | CreateLoanMessageDataParams
  | DeleteLoanMessageDataParams
  | CreateLoanAndDepositMessageDataParams
  | DepositMessageDataParams
  | WithdrawMessageDataParams
  | BorrowMessageDataParams
  | RepayMessageDataParams
  | RepayWithCollateralMessageDataParams
  | SwitchBorrowTypeMessageDataParams
  | LiquidateMessageDataParams
  | SendTokenMessageDataParams
  | ClaimRewardsV2MessageDataParams;

export type MessageBuilderParams = {
  userAddress: GenericAddress;
  accountId: AccountId;
  adapters: MessageAdapters;
  sender: GenericAddress;
  destinationChainId: FolksChainId;
  handler: GenericAddress;
} & MessageDataParams;
