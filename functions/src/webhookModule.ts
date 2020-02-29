import { AppError } from "../../shared/appError";
import { getAccountOwner } from './appModule';
import { Transaction, TransactionUpdate } from "../../shared/types";
import admin = require("firebase-admin");
import { Withdrawal, Deposit } from "trtl-apps";

type CallbackCode =   'deposit/confirming'      |
                      'deposit/succeeded'       |
                      'deposit/cancelled'       |
                      'withdrawal/succeeded'    |
                      'withdrawal/failed'

export interface WebhookResult {
  userId: string,
  accountId: string
}

export async function processWebhookCall(
  code: CallbackCode,
  data: any): Promise<[WebhookResult | undefined, undefined | AppError]> {

  console.log(`process webhook call: ${code}`);

  switch (code) {
    case 'deposit/confirming':
      return await proccesConfirmingDeposit(data as Deposit);
    case 'deposit/succeeded':
      return await processSuccessfulDeposit(data as Deposit);
    case 'deposit/cancelled':
      return await processCancelledDeposit(data as Deposit);
    case 'withdrawal/succeeded':
      return await processWithdrawalSucceeded(data as Withdrawal);
    case 'withdrawal/failed':
      return await processWithdrawalFailed(data as Withdrawal);
    default:
      return [undefined, new AppError('app/unknown-error')];
  }
}

async function proccesConfirmingDeposit(deposit: Deposit): Promise<[WebhookResult | undefined, undefined | AppError]> {
  const accountId = deposit.accountId;
  const [owner, userError] = await getAccountOwner(accountId);

  if (!owner) {
    return [undefined, userError];
  }

  if (!deposit.txHash) {
    return [undefined, new AppError('app/unknown-error', 'missing deposit tx hash.')];
  }

  const transactionDocRef = admin.firestore().collection(`users/${owner.id}/transactions`).doc();

  const transaction: Transaction = {
    id:             transactionDocRef.id,
    userId:         owner.id,
    accountId:      accountId,
    timestamp:      deposit.createdDate,
    transferType:   'deposit',
    amount:         deposit.amount,
    fee:            0,
    confirmed:      false,
    failed:         false,
    depositId:      deposit.id,
    txHash:         deposit.txHash,
    paymentID:      deposit.paymentId
  }

  try {
    await transactionDocRef.create(transaction);

    const result: WebhookResult = {
      userId: owner.id,
      accountId: accountId
    }

    return [result, undefined];
  } catch (error) {
    return [undefined, new AppError('app/unknown-error')];
  }
}

async function processSuccessfulDeposit(deposit: Deposit): Promise<[WebhookResult | undefined, undefined | AppError]> {
  const accountId = deposit.accountId;
  const [owner, userError] = await getAccountOwner(accountId);

  if (!owner) {
    return [undefined, userError];
  }


  const querySnapshot = await admin.firestore()
                        .collection(`users/${owner.id}/transactions`)
                        .where('depositId', '==', deposit.id)
                        .get();

  if (querySnapshot.size !== 1) {
    return [undefined, new AppError('app/deposit-not-found')];
  }

  const transaction = querySnapshot.docs[0].data() as Transaction;

  const updateObject: TransactionUpdate = {
    confirmed: true
  }

  await admin.firestore().doc(`users/${owner.id}/transactions/${transaction.id}`).update(updateObject);

  const result: WebhookResult = {
    userId: owner.id,
    accountId: accountId
  }

  return [result, undefined];
}

async function processCancelledDeposit(deposit: Deposit): Promise<[WebhookResult | undefined, undefined | AppError]> {
  const accountId = deposit.accountId;
  const [owner, userError] = await getAccountOwner(accountId);

  if (!owner) {
    return [undefined, userError];
  }

  const querySnapshot = await admin.firestore()
                        .collection(`users/${owner.id}/transactions`)
                        .where('depositId', '==', deposit.id)
                        .get();

  if (querySnapshot.size !== 1) {
    return [undefined, new AppError('app/deposit-not-found')];
  }

  const transaction = querySnapshot.docs[0].data() as Transaction;

  const updateObject: TransactionUpdate = {
    failed: true
  }

  await admin.firestore().doc(`users/${owner.id}/transactions/${transaction.id}`).update(updateObject);

  const result: WebhookResult = {
    userId: owner.id,
    accountId: accountId
  }

  return [result, undefined];
}

async function processWithdrawalSucceeded(withdrawal: Withdrawal): Promise<[WebhookResult | undefined, undefined | AppError]> {
  const accountId = withdrawal.accountId;
  const [owner, userError] = await getAccountOwner(accountId);

  if (!owner) {
    return [undefined, userError];
  }

  const querySnapshot = await admin.firestore()
                        .collection(`users/${owner.id}/transactions`)
                        .where('withdrawalId', '==', withdrawal.id)
                        .get();

  if (querySnapshot.size !== 1) {
    return [undefined, new AppError('app/withdrawal-not-found')];
  }

  const transaction = querySnapshot.docs[0].data() as Transaction;

  const updateObject: TransactionUpdate = {
    confirmed: true
  }

  if (withdrawal.txHash && transaction.txHash !== withdrawal.txHash) {
    updateObject.txHash = withdrawal.txHash
  }

  await admin.firestore().doc(`users/${owner.id}/transactions/${transaction.id}`).update(updateObject);

  const result: WebhookResult = {
    userId: owner.id,
    accountId: accountId
  }

  return [result, undefined];
}

async function processWithdrawalFailed(withdrawal: Withdrawal): Promise<[WebhookResult | undefined, undefined | AppError]> {
  const accountId = withdrawal.accountId;
  const [owner, userError] = await getAccountOwner(accountId);

  console.log(`process failed withdrawal with id: ${withdrawal.id}`);

  if (!owner) {
    return [undefined, userError];
  }

  const querySnapshot = await admin.firestore()
                        .collection(`users/${owner.id}/transactions`)
                        .where('withdrawalId', '==', withdrawal.id)
                        .get();

  if (querySnapshot.size !== 1) {
    return [undefined, new AppError('app/withdrawal-not-found')];
  }

  const transaction = querySnapshot.docs[0].data() as Transaction;

  const updateObject: TransactionUpdate = {
    failed: true
  }

  console.log(`marking transaction with id [${transaction.id}] as failed...`);

  await admin.firestore().doc(`users/${owner.id}/transactions/${transaction.id}`).update(updateObject);

  console.log(`successfully updated transaction as failed`);

  const result: WebhookResult = {
    userId: owner.id,
    accountId: accountId
  }

  return [result, undefined];
}
