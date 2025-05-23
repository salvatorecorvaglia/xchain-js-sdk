import {FolksHubAccount} from "../../chains/evm/hub/modules/index.js";
import {getHubChain} from "../../chains/evm/hub/utils/chain.js";
import {FolksEvmAccount} from "../../chains/evm/spoke/modules/index.js";
import {NULL_ACCOUNT_ID} from "../../common/constants/lending.js";
import type {FolksChainId} from "../../common/types/chain.js";
import {ChainType} from "../../common/types/chain.js";
import {MessageDirection} from "../../common/types/gmp.js";
import type {
    CreateAccountMessageData,
    InviteAddressMessageData,
    MessageAdapters,
    MessageBuilderParams,
    OptionalFeeParams,
    UnregisterAddressMessageData,
} from "../../common/types/message.js";
import {Action} from "../../common/types/message.js";
import {assertAdapterSupportsDataMessage} from "../../common/utils/adapter.js";
import {convertFromGenericAddress} from "../../common/utils/address.js";
import {assertSpokeChainSupported, getSignerGenericAddress, getSpokeChain} from "../../common/utils/chain.js";
import {buildAccountId} from "../../common/utils/lending.js";
import {buildMessageToSend, estimateAdapterReceiveGasLimit} from "../../common/utils/messages.js";
import {exhaustiveCheck} from "../../utils/exhaustive-check.js";
import {FolksCore} from "../core/folks-core.js";

import type {AccountIdByAddress, AccountInfo} from "../../chains/evm/hub/types/account.js";
import type {GenericAddress} from "../../common/types/address.js";
import type {AccountId, Nonce} from "../../common/types/lending.js";
import type {
    PrepareAcceptInviteAddressCall,
    PrepareCreateAccountCall,
    PrepareInviteAddressCall,
    PrepareUnregisterAddressCall,
} from "../../common/types/module.js";

export const prepare = {
  async createAccount(nonce: Nonce, adapters: MessageAdapters, refAccountId: AccountId = NULL_ACCOUNT_ID) {
    const folksChain = FolksCore.getSelectedFolksChain();

    // check adapters are compatible
    assertAdapterSupportsDataMessage(folksChain.folksChainId, adapters.adapterId);
    const spokeChain = getSpokeChain(folksChain.folksChainId, folksChain.network);
    const hubChain = getHubChain(folksChain.network);

    const userAddress = getSignerGenericAddress({
      signer: FolksCore.getFolksSigner().signer,
      chainType: folksChain.chainType,
    });

    const accountId = buildAccountId(userAddress, folksChain.folksChainId, nonce);

    const data: CreateAccountMessageData = { nonce, refAccountId };
    const messageBuilderParams: MessageBuilderParams = {
      userAddress,
      accountId,
      adapters,
      action: Action.CreateAccount,
      sender: spokeChain.spokeCommonAddress,
      destinationChainId: hubChain.folksChainId,
      handler: hubChain.hubAddress,
      data,
      extraArgs: "0x",
    };
    const feeParams: OptionalFeeParams = {};

    feeParams.gasLimit = await estimateAdapterReceiveGasLimit(
      folksChain.folksChainId,
      hubChain.folksChainId,
      FolksCore.getHubProvider(),
      folksChain.network,
      MessageDirection.SpokeToHub,
      messageBuilderParams,
    );

    const messageToSend = buildMessageToSend(folksChain.chainType, messageBuilderParams, feeParams);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.prepare.createAccount(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          convertFromGenericAddress(userAddress, folksChain.chainType),
          messageToSend,
          accountId,
          nonce,
          refAccountId,
          spokeChain,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async inviteAddress(
    accountId: AccountId,
    folksChainIdToInvite: FolksChainId,
    addressToInvite: GenericAddress,
    adapters: MessageAdapters,
    refAccountId: AccountId = NULL_ACCOUNT_ID,
  ) {
    const folksChain = FolksCore.getSelectedFolksChain();

    // check adapters are compatible
    assertAdapterSupportsDataMessage(folksChain.folksChainId, adapters.adapterId);
    const spokeChain = getSpokeChain(folksChain.folksChainId, folksChain.network);
    const hubChain = getHubChain(folksChain.network);

    const userAddress = getSignerGenericAddress({
      signer: FolksCore.getFolksSigner().signer,
      chainType: folksChain.chainType,
    });

    const data: InviteAddressMessageData = {
      folksChainIdToInvite,
      addressToInvite,
      refAccountId,
    };
    const messageBuilderParams: MessageBuilderParams = {
      userAddress,
      accountId,
      adapters,
      action: Action.InviteAddress,
      sender: spokeChain.spokeCommonAddress,
      destinationChainId: hubChain.folksChainId,
      handler: hubChain.hubAddress,
      data,
      extraArgs: "0x",
    };
    const feeParams: OptionalFeeParams = {};

    feeParams.gasLimit = await estimateAdapterReceiveGasLimit(
      folksChain.folksChainId,
      hubChain.folksChainId,
      FolksCore.getHubProvider(),
      folksChain.network,
      MessageDirection.SpokeToHub,
      messageBuilderParams,
    );

    const messageToSend = buildMessageToSend(folksChain.chainType, messageBuilderParams, feeParams);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.prepare.inviteAddress(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          convertFromGenericAddress(userAddress, folksChain.chainType),
          messageToSend,
          accountId,
          folksChainIdToInvite,
          addressToInvite,
          refAccountId,
          spokeChain,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async acceptInvite(accountId: AccountId, adapters: MessageAdapters) {
    const folksChain = FolksCore.getSelectedFolksChain();

    // check adapters are compatible
    assertAdapterSupportsDataMessage(folksChain.folksChainId, adapters.adapterId);
    const spokeChain = getSpokeChain(folksChain.folksChainId, folksChain.network);
    const hubChain = getHubChain(folksChain.network);

    const userAddress = getSignerGenericAddress({
      signer: FolksCore.getFolksSigner().signer,
      chainType: folksChain.chainType,
    });

    const messageBuilderParams: MessageBuilderParams = {
      userAddress,
      accountId,
      adapters,
      action: Action.AcceptInviteAddress,
      sender: spokeChain.spokeCommonAddress,
      destinationChainId: hubChain.folksChainId,
      handler: hubChain.hubAddress,
      data: "0x",
      extraArgs: "0x",
    };
    const feeParams: OptionalFeeParams = {};

    feeParams.gasLimit = await estimateAdapterReceiveGasLimit(
      folksChain.folksChainId,
      hubChain.folksChainId,
      FolksCore.getHubProvider(),
      folksChain.network,
      MessageDirection.SpokeToHub,
      messageBuilderParams,
    );

    const messageToSend = buildMessageToSend(folksChain.chainType, messageBuilderParams, feeParams);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.prepare.acceptInvite(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          convertFromGenericAddress(userAddress, folksChain.chainType),
          messageToSend,
          accountId,
          spokeChain,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async unregisterAddress(accountId: AccountId, folksChainIdToUnregister: FolksChainId, adapters: MessageAdapters) {
    const folksChain = FolksCore.getSelectedFolksChain();

    // check adapters are compatible
    assertAdapterSupportsDataMessage(folksChain.folksChainId, adapters.adapterId);
    const spokeChain = getSpokeChain(folksChain.folksChainId, folksChain.network);
    const hubChain = getHubChain(folksChain.network);

    const userAddress = getSignerGenericAddress({
      signer: FolksCore.getFolksSigner().signer,
      chainType: folksChain.chainType,
    });

    const data: UnregisterAddressMessageData = {
      folksChainIdToUnregister,
    };

    const messageBuilderParams: MessageBuilderParams = {
      userAddress,
      accountId,
      adapters,
      action: Action.UnregisterAddress,
      sender: spokeChain.spokeCommonAddress,
      destinationChainId: hubChain.folksChainId,
      handler: hubChain.hubAddress,
      data,
      extraArgs: "0x",
    };
    const feeParams: OptionalFeeParams = {};

    feeParams.gasLimit = await estimateAdapterReceiveGasLimit(
      folksChain.folksChainId,
      hubChain.folksChainId,
      FolksCore.getHubProvider(),
      folksChain.network,
      MessageDirection.SpokeToHub,
      messageBuilderParams,
    );

    const messageToSend = buildMessageToSend(folksChain.chainType, messageBuilderParams, feeParams);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.prepare.unregisterAddress(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          convertFromGenericAddress(userAddress, folksChain.chainType),
          messageToSend,
          accountId,
          folksChainIdToUnregister,
          spokeChain,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },
};

export const write = {
  async createAccount(nonce: Nonce, prepareCall: PrepareCreateAccountCall, refAccountId: AccountId = NULL_ACCOUNT_ID) {
    const folksChain = FolksCore.getSelectedFolksChain();

    assertSpokeChainSupported(folksChain.folksChainId, folksChain.network);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.write.createAccount(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          FolksCore.getSigner<ChainType.EVM>(),
          nonce,
          refAccountId,
          prepareCall,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async inviteAddress(
    accountId: AccountId,
    folksChainIdToInvite: FolksChainId,
    addressToInvite: GenericAddress,
    prepareCall: PrepareInviteAddressCall,
    refAccountId: AccountId = NULL_ACCOUNT_ID,
  ) {
    const folksChain = FolksCore.getSelectedFolksChain();

    assertSpokeChainSupported(folksChain.folksChainId, folksChain.network);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.write.inviteAddress(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          FolksCore.getSigner<ChainType.EVM>(),
          accountId,
          folksChainIdToInvite,
          addressToInvite,
          refAccountId,
          prepareCall,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async acceptInvite(accountId: AccountId, prepareCall: PrepareAcceptInviteAddressCall) {
    const folksChain = FolksCore.getSelectedFolksChain();

    assertSpokeChainSupported(folksChain.folksChainId, folksChain.network);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.write.acceptInvite(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          FolksCore.getSigner<ChainType.EVM>(),
          accountId,
          prepareCall,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },

  async unregisterAddress(
    accountId: AccountId,
    folksChainIdToUnregister: FolksChainId,
    prepareCall: PrepareUnregisterAddressCall,
  ) {
    const folksChain = FolksCore.getSelectedFolksChain();

    assertSpokeChainSupported(folksChain.folksChainId, folksChain.network);

    switch (folksChain.chainType) {
      case ChainType.EVM:
        return await FolksEvmAccount.write.unregisterAddress(
          FolksCore.getProvider<ChainType.EVM>(folksChain.folksChainId),
          FolksCore.getSigner<ChainType.EVM>(),
          accountId,
          folksChainIdToUnregister,
          prepareCall,
        );
      default:
        return exhaustiveCheck(folksChain.chainType);
    }
  },
};

export const read = {
  async accountInfo(accountId: AccountId, folksChainIds?: Array<FolksChainId>): Promise<AccountInfo> {
    return FolksHubAccount.getAccountInfo(
      FolksCore.getHubProvider(),
      FolksCore.getSelectedNetwork(),
      accountId,
      folksChainIds,
    );
  },

  async accountIdByAddress(address: GenericAddress): Promise<AccountIdByAddress> {
    return FolksHubAccount.getAccountIdByAddress(FolksCore.getHubProvider(), FolksCore.getSelectedNetwork(), address);
  },

  async accountIdByAddressOnChain(address: GenericAddress, folksChainId: FolksChainId): Promise<AccountId | null> {
    return FolksHubAccount.getAccountIdByAddressOnChain(
      FolksCore.getHubProvider(),
      FolksCore.getSelectedNetwork(),
      address,
      folksChainId,
    );
  },

  async invitationByAddress(address: GenericAddress, folksChainId?: FolksChainId) {
    return FolksHubAccount.getInvitationByAddress(
      FolksCore.getHubProvider(),
      FolksCore.getSelectedNetwork(),
      address,
      folksChainId,
    );
  },

  async isAccountCreated(accountId: AccountId) {
    return FolksHubAccount.isAccountCreated(FolksCore.getHubProvider(), FolksCore.getSelectedNetwork(), accountId);
  },
};
