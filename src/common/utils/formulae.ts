import type {Dnum} from "dnum";
import * as dn from "dnum";

import {expBySquaring, SECONDS_IN_YEAR, unixTime} from "./math-lib.js";

export function calcPeriodNumber(offset: bigint, length: bigint): bigint {
  return (BigInt(unixTime()) + offset) / length;
}

export function calcNextPeriodReset(periodNumber: bigint, offset: bigint, length: bigint): bigint {
  return (periodNumber + BigInt(1)) * length - offset;
}

export function calcOverallBorrowInterestRate(
  totalVarDebt: bigint,
  totalStableDebt: bigint,
  variableBorInterestRate: Dnum,
  avgStableBorInterestRate: Dnum,
): Dnum {
  const totalDebt = totalVarDebt + totalStableDebt;
  if (totalDebt === 0n) return dn.from(0, 18);

  return dn.div(
    dn.add(
      dn.mul(totalVarDebt, variableBorInterestRate, { rounding: "ROUND_DOWN", decimals: 0 }),
      dn.mul(totalStableDebt, avgStableBorInterestRate, { rounding: "ROUND_DOWN", decimals: 0 }),
    ),
    totalDebt,
    { rounding: "ROUND_DOWN", decimals: 18 },
  );
}

export function calcDepositInterestIndex(
  dirt1: Dnum,
  diit1: Dnum,
  latestUpdate: bigint,
  lastTimestamp = BigInt(unixTime()),
): Dnum {
  const dt = lastTimestamp - latestUpdate;
  return dn.mul(
    diit1,
    dn.add(
      dn.from(1, 18),
      dn.div(dn.mul(dirt1, dt, { rounding: "ROUND_DOWN" }), SECONDS_IN_YEAR, {
        rounding: "ROUND_DOWN",
      }),
    ),
    { rounding: "ROUND_DOWN" },
  );
}

export function calcBorrowInterestIndex(
  birt1: Dnum,
  biit1: Dnum,
  latestUpdate: bigint,
  lastTimestamp = BigInt(unixTime()),
): Dnum {
  const dt = lastTimestamp - latestUpdate;
  return dn.mul(
    biit1,
    expBySquaring(dn.add(dn.from(1, 18), dn.div(birt1, SECONDS_IN_YEAR, { rounding: "ROUND_DOWN" })), dt),
    { rounding: "ROUND_DOWN" },
  );
}

export function calcRetention(
  actualRetained: bigint,
  totalDebt: bigint,
  overallBorrowInterestRate: Dnum,
  retentionRate: Dnum,
  latestUpdate: bigint,
  lastTimestamp = BigInt(unixTime()),
): bigint {
  const dt = lastTimestamp - latestUpdate;

  const [retainedDelta] = dn.div(
    dn.mul(
      dn.mul(dn.mul(totalDebt, overallBorrowInterestRate, { rounding: "ROUND_DOWN", decimals: 0 }), retentionRate, {
        rounding: "ROUND_DOWN",
        decimals: 0,
      }),
      dt,
      { rounding: "ROUND_DOWN" },
    ),
    SECONDS_IN_YEAR,
    {
      rounding: "ROUND_DOWN",
    },
  );
  return actualRetained + retainedDelta;
}

export function calcRewardIndex(used: bigint, ma: bigint, rit1: Dnum, rs: Dnum, latestUpdate: bigint): Dnum {
  if (used <= ma) return rit1;
  const dt = BigInt(unixTime()) - latestUpdate;
  return dn.add(
    rit1,
    dn.div(dn.mul(rs, dt, { rounding: "ROUND_DOWN" }), used, {
      rounding: "ROUND_DOWN",
    }),
  );
}

export function calcAccruedRewards(amount: bigint, rit: Dnum, ritn1: Dnum): bigint {
  const [accruedRewards] = dn.mul([amount, 0], dn.sub(rit, ritn1), { rounding: "ROUND_DOWN" });
  return accruedRewards;
}

export function toFAmount(underlyingAmount: bigint, diit: Dnum): bigint {
  const [fAmount] = dn.div([underlyingAmount, 0], diit, { rounding: "ROUND_DOWN" });
  return fAmount;
}

export function toUnderlyingAmount(fAmount: bigint, diit: Dnum): bigint {
  const [underlyingAmount] = dn.mul([fAmount, 0], diit, { rounding: "ROUND_DOWN" });
  return underlyingAmount;
}

export function calcAssetDollarValue(amount: bigint, tokenPrice: Dnum, tokenDecimals: number): Dnum {
  return dn.mul(tokenPrice, [amount, tokenDecimals], {
    rounding: "ROUND_DOWN",
  });
}

export function calcCollateralAssetLoanValue(
  amount: bigint,
  tokenPrice: Dnum,
  tokenDecimals: number,
  collateralFactor: Dnum,
): Dnum {
  return dn.mul(calcAssetDollarValue(amount, tokenPrice, tokenDecimals), collateralFactor, {
    rounding: "ROUND_DOWN",
    decimals: 8,
  });
}

export function calcBorrowAssetLoanValue(
  amount: bigint,
  tokenPrice: Dnum,
  tokenDecimals: number,
  borrowFactor: Dnum,
): Dnum {
  return dn.mul(calcAssetDollarValue(amount, tokenPrice, tokenDecimals), borrowFactor, {
    rounding: "ROUND_UP",
    decimals: 8,
  });
}

export function calcBorrowBalance(bbtn1: bigint, biit: Dnum, biitn1: Dnum): bigint {
  const [borrowBalance] = dn.mul([bbtn1, 0], dn.div(biit, biitn1, { rounding: "ROUND_UP" }), {
    rounding: "ROUND_UP",
  });
  return borrowBalance;
}

export function calcStableInterestRate(bbt: bigint, amount: bigint, sbirtn1: Dnum, sbirt1: Dnum): Dnum {
  return dn.div(dn.add(dn.mul(sbirtn1, [bbt, 0]), dn.mul(sbirt1, [amount, 0])), dn.add([bbt, 0], [amount, 0]));
}

export function calcLtvRatio(totalBorrowBalanceValue: Dnum, totalCollateralBalanceValue: Dnum): Dnum {
  const [, decimals] = totalBorrowBalanceValue;
  if (dn.equal(totalCollateralBalanceValue, 0)) return dn.from(0, decimals);
  return dn.div(totalBorrowBalanceValue, totalCollateralBalanceValue, {
    rounding: "ROUND_UP",
  });
}

export function calcBorrowUtilisationRatio(
  totalEffectiveBorrowBalanceValue: Dnum,
  totalEffectiveCollateralBalanceValue: Dnum,
): Dnum {
  const [, decimals] = totalEffectiveBorrowBalanceValue;
  if (dn.equal(totalEffectiveCollateralBalanceValue, 0)) return dn.from(0, decimals);
  return dn.div(totalEffectiveBorrowBalanceValue, totalEffectiveCollateralBalanceValue, { rounding: "ROUND_UP" });
}

export function calcLiquidationMargin(
  totalEffectiveBorrowBalanceValue: Dnum,
  totalEffectiveCollateralBalanceValue: Dnum,
): Dnum {
  const [, decimals] = totalEffectiveBorrowBalanceValue;
  if (dn.equal(totalEffectiveCollateralBalanceValue, 0)) return dn.from(0, decimals);
  return dn.div(
    dn.sub(totalEffectiveCollateralBalanceValue, totalEffectiveBorrowBalanceValue),
    totalEffectiveCollateralBalanceValue,
    {
      rounding: "ROUND_DOWN",
    },
  );
}
