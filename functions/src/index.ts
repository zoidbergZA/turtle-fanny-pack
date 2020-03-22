import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import * as axios from 'axios';
import * as sgMail from '@sendgrid/mail';
import * as WebhookModule from './webhookModule';
import { WalletUser, WalletUserUpdate, Transaction, PreparedTransaction, Contact, UserPin, ResetPinRequest, ResetPinRequestUpdate } from '../../shared/types';
import { AppError } from '../../shared/appError';
import { TrtlApp, ServiceError, Account } from 'trtl-apps';
import { cmcPriceQuoteEndoint } from './constants';

admin.initializeApp();


// =============================================================================
//                              Auth Triggers
// =============================================================================


exports.onNewAuthUserCreated = functions.auth.user().onCreate(async (user) => {
  await createWalletUser(user);
});


// =============================================================================
//                              Callable functions
// =============================================================================


export const refreshAccountData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string = context.auth.uid;
  const accountId: string = data.accountId;

  if (!userId || !accountId) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  await refreshAccount(userId, accountId);
});

export const setUserPin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string | undefined = context.auth.uid;
  const pin: string | undefined = data.pin;

  if (!userId || !pin) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  const success = await setNewUserPin(userId, pin);

  return success;
});

export const verifyUserPin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string | undefined = context.auth.uid;
  const pin: string | undefined = data.pin;

  if (!userId || !pin) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  const verified = await verifyPin(userId, pin);

  return verified;
});

export const resetUserPinEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string | undefined = context.auth.uid;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  return sendResetPinEmail(userId);
});

export const accountPrepareSend = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string | undefined    = context.auth.uid;
  const accountId: string | undefined = data.accountId;
  const amount: number | undefined    = data.amount;
  const address: string | undefined   = data.address;

  if (!userId || !accountId || !amount || !address) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  const [preparedTx, error] = await accountPrepareSendToAddress(userId, accountId, amount, address);

  if (!preparedTx) {
    throw new functions.https.HttpsError('internal', (error as AppError).message);
  }

  return preparedTx;
});

export const accountSend = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const userId: string | undefined = context.auth.uid;
  const preparedTxId: string | undefined = data.preparedTxId;

  if (!preparedTxId) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  const preparedTx = await getPreparedTransaction(userId, preparedTxId);

  if (!preparedTx) {
    throw new functions.https.HttpsError('not-found', 'prepared transaction not found.');
  }

  if (preparedTx.userId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'permission denied.');
  }

  const [transaction, error] = await sendPreparedTransaction(preparedTx);

  if (transaction) {
    return transaction;
  } else {
    throw new functions.https.HttpsError('aborted', (error as AppError).message);
  }
});

export const addContact = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Authentication error.');
  }

  const userId: string | undefined = context.auth.uid;
  const contactName: string | undefined = data.name;
  const contactAddress: string | undefined = data.address;
  const contactEmail: string | undefined = data.email;

  if (!contactName || !contactAddress) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid parameters provided.');
  }

  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const [isValid, error] = await TrtlApp.validateAddress(contactAddress, true);

  if (error) {
    throw new functions.https.HttpsError('internal', 'an internal error occured');
  }

  if (!isValid) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid TRTL address provided.');
  }

  const docRef = admin.firestore().collection(`users/${userId}/contacts`).doc();

  const contact: Contact = {
    id: docRef.id,
    name: contactName,
    address: contactAddress,
    createdDate: Date.now()
  }

  if (contactEmail) {
    contact.email = contactEmail;
  }

  try {
    await docRef.create(contact);
  } catch (error) {
    console.log(error);

    throw new functions.https.HttpsError('internal', 'an internal error occured');
  }

  return contact;
});

export const updateContact = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'Authentication error.');
  }

  const userId: string | undefined = context.auth.uid;
  const contact: Contact | undefined = data.contact;

  if (!contact) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid contact details provided.');
  }

  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const [isValid, error] = await TrtlApp.validateAddress(contact.address, true);

  if (error) {
    throw new functions.https.HttpsError('internal', 'an internal error occured');
  }

  if (!isValid) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid TRTL address provided.');
  }

  const updateObject: any = {
    name: contact.name,
    address: contact.address
  }

  if (!contact.email || contact.email === '') {
    const FieldValue = require('firebase-admin').firestore.FieldValue;
    updateObject.email = FieldValue.delete();
  } else {
    updateObject.email = contact.email;
  }

  try {
    await admin.firestore().doc(`users/${userId}/contacts/${contact.id}`).update(updateObject);
  } catch (error) {
    console.log(error);
    throw new functions.https.HttpsError('internal', 'an internal error occured');
  }

  return contact;

});


// =============================================================================
//                            Firestore Triggers
// =============================================================================


// exports.onTurtleAccountWrite = functions.firestore.document(`/turtleAccounts/{accountId}`)
// .onWrite(async (change, context) => {
//   const newState  = change.after.data() as TurtleAccount;

//   await syncUserTurtleAccountState(newState);
//   return null;
// });


// =============================================================================
//                              HTTP Triggers
// =============================================================================


exports.webhook = functions.https.onRequest(async (request, response) => {
  const isValid = validateWebhookCall(request);

  if (!isValid) {
    console.log('invalid webhook call');
    response.status(403).send('ERROR');
    return;
  }

  const [result, error] = await WebhookModule.processWebhookCall(request.body.code, request.body.data);

  if (result) {
    await refreshAccount(result.userId, result.accountId);
    response.status(200).send('OK');
  } else {
    const e = error as AppError;
    console.error(`ERROR :: ${e.errorCode}: ${e.message}`);
    response.status(500).send(e);
  }
});

exports.processResetPin = functions.https.onRequest(async (request, response) => {
  const resetId: string | undefined = request.query.id;

  if (!resetId) {
    response.status(400).send('ERROR');
    return;
  }

  const pinRequestDocRef = admin.firestore().doc(`resetPinRequests/${resetId}`);
  const pinRequestDoc = await pinRequestDocRef.get();

  if (!pinRequestDoc.exists) {
    response.status(400).send('ERROR');
    return;
  }

  const pinRequest = pinRequestDoc.data() as ResetPinRequest;
  const expireDate = pinRequest.createdAt + pinRequest.expireTime;
  const now = Date.now();

  if (pinRequest.consumed) {
    response.status(400).send('expired.');
    return;
  }

  if (now > expireDate) {
    response.status(400).send('expired.');
    return;
  }

  const userUpdate: WalletUserUpdate = {
    hasPin: false
  }

  const pinReqUpdate: ResetPinRequestUpdate = {
    consumed: true
  }

  await Promise.all([
    pinRequestDocRef.update(pinReqUpdate),
    admin.firestore().doc(`users/${pinRequest.userId}`).update(userUpdate)
    // admin.auth().revokeRefreshTokens(pinRequest.userId)
  ]);

  response.status(200).send('PIN successfully reset.');
});


// =============================================================================
//                            Scheduled functions
// =============================================================================


exports.heartbeat = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  await Promise.all([retryInitializeUsers(), updatePriceInfo()]);
});


// =============================================================================
//                            Private functions (refactor to modules)
// =============================================================================


async function refreshAccount(userId: string, accountId: string): Promise<void> {
  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const [account, error] = await TrtlApp.getAccount(accountId);

  if (!account) {
    console.log((error as ServiceError).message);
    return;
  }

  await admin.firestore().doc(`users/${userId}/accounts/${accountId}`).set(account);
}

async function setNewUserPin(userId: string, pin: string): Promise<boolean> {
  try {
    await admin.firestore().runTransaction(async txn => {
      const userDocRef  = admin.firestore().doc(`users/${userId}`);
      const pinDocRef   = admin.firestore().doc(`userPins/${userId}`);

      const userDoc = await txn.get(userDocRef);

      if (!userDoc.exists) {
        throw new Error('user not found.');
      }

      const user = userDoc.data() as WalletUser;

      if (user.hasPin) {
        throw new Error('user already has a pin.');
      }

      const digest      = 'sha512';
      const iterations  = 1000;
      const keyLength   = 64;
      const salt        = crypto.randomBytes(16).toString('hex');
      const key         = crypto.pbkdf2Sync(pin, salt, iterations, keyLength, digest);
      const pinHash     = key.toString('hex');

      const pinInfo: UserPin = {
        userId:     userId,
        digest:     digest,
        iterations: iterations,
        keyLength:  keyLength,
        salt:       salt,
        pinHash:    pinHash,
        createdAt:  Date.now()
      }

      const userUpdate: WalletUserUpdate = {
        hasPin: true
      }

      txn.set(pinDocRef, pinInfo);
      txn.update(userDocRef, userUpdate);
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
}

async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const fetchuser = admin.firestore().doc(`users/${userId}`).get();
  const fetchPin  = admin.firestore().doc(`userPins/${userId}`).get();

  const fetchResult = await Promise.all([fetchuser, fetchPin]);

  const userDoc = fetchResult[0];
  const pinDoc  = fetchResult[1];

  if (!userDoc.exists || !pinDoc.exists) {
    return false;
  }

  const user = userDoc.data() as WalletUser;

  if (!user.hasPin) {
    return false;
  }

  const pinInfo = pinDoc.data() as UserPin;
  const key     = crypto.pbkdf2Sync(pin, pinInfo.salt, pinInfo.iterations, pinInfo.keyLength, pinInfo.digest);
  const hash    = key.toString('hex');

  return hash === pinInfo.pinHash;
}

async function sendResetPinEmail(userId: string): Promise<any> {
  const userDocRef  = admin.firestore().doc(`users/${userId}`);
  const userDoc     = await userDocRef.get();

  if (!userDoc.exists) {
    throw Error("User not found.");
  }

  const user = userDoc.data() as WalletUser;

  if (!user.hasPin) {
    throw Error("User pin already reset.");
  }

  if (!user.email) {
    throw Error("User does not have an email address set.");
  }

  const expireTime = 1000 * 60 * 60 // 1 hour before request expires
  const requestDocRef = admin.firestore().collection('resetPinRequests').doc();

  const resetRequest: ResetPinRequest = {
    id:         requestDocRef.id,
    userId:     userId,
    email:      user.email,
    createdAt:  Date.now(),
    expireTime: expireTime,
    consumed:   false
  }

  await requestDocRef.set(resetRequest);

  sgMail.setApiKey(functions.config().sendgrid.apikey);

  const resetLink = `https://us-central1-turtle-fanny-pack.cloudfunctions.net/processResetPin?id=${resetRequest.id}`;

  const msg = {
    to: resetRequest.email,
    from: 'no-reply@turtlewallet.app',
    templateId: functions.config().sendgrid.resetpintemplate,
    dynamic_template_data: {
      resetlink: resetLink,
      expiretime: '60 minutes'
    }
  }

  try {
    await sgMail.send(msg);

    return { success: true };
  } catch (error) {
    console.log(error);
    throw Error("An error occured while sending the email.");
  }
}

async function accountPrepareSendToAddress(
  userId: string,
  accountId: string,
  amount: number,
  address: string): Promise<[PreparedTransaction | undefined, AppError | undefined]> {

  const docRef = admin.firestore().collection(`users/${userId}/preparedTransactions`).doc();
  const recipientAccount = await getAccountByDepositAddress(address);

  if (recipientAccount) {
    const preparedTx: PreparedTransaction = {
      id: docRef.id,
      userId: userId,
      accountId: accountId,
      address: address,
      transferType: 'account',
      amount: amount,
      fees: 0,
      recipientAccountId: recipientAccount.id
    }

    await docRef.create(preparedTx);

    return [preparedTx, undefined];
  } else {
    const [appId, appSecret] = getAppCredentials();
    TrtlApp.initialize(appId, appSecret);

    const [preview, error] = await TrtlApp.withdrawalPreview(accountId, amount, address);

    if (!preview) {
      return [undefined, (error as AppError)];
    }

    const fees = preview.fees.txFee + preview.fees.nodeFee + preview.fees.serviceFee;

    const preparedTx: PreparedTransaction = {
      id: docRef.id,
      userId: userId,
      address: address,
      accountId: accountId,
      transferType: 'withdrawal',
      amount: preview.amount,
      fees: fees,
      preparedWithdrawalId: preview.id
    }

    await docRef.create(preparedTx);

    return [preparedTx, undefined];
  }
}

async function sendPreparedTransaction(preparedTx: PreparedTransaction): Promise<[Transaction | undefined, AppError | undefined]> {
  const sendType = preparedTx.transferType;

  if (sendType === 'account' && preparedTx.recipientAccountId) {
    return await interAccountTransfer(
      preparedTx.userId,
      preparedTx.accountId,
      preparedTx.recipientAccountId,
      preparedTx.address,
      preparedTx.amount);
  } else if (sendType === 'withdrawal') {
    return await accountWithdrawToAddress(preparedTx);
  } else {
    return [undefined, new AppError('app/withdraw-error', 'Invalid prepared transaction.')];
  }
}

async function accountWithdrawToAddress(preparedTx: PreparedTransaction): Promise<[Transaction | undefined, AppError | undefined]> {
  if (!preparedTx.preparedWithdrawalId) {
    return [undefined, new AppError('app/withdraw-error')];
  }

  console.log(`TRTL app send -> account: ${preparedTx.accountId}, amount: ${preparedTx.amount}, address: ${preparedTx.address}`);

  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const transactionDocRef = admin.firestore().collection(`users/${preparedTx.userId}/transactions`).doc();
  const [withdrawal, sendError] = await TrtlApp.withdraw(preparedTx.preparedWithdrawalId);

  if (!withdrawal) {
    const appError = new AppError('app/withdraw-error', (sendError as ServiceError).message);
    console.error(appError.message);
    return [undefined, appError];
  }

  const transaction: Transaction = {
    id:             transactionDocRef.id,
    userId:         preparedTx.userId,
    accountId:      preparedTx.accountId,
    timestamp:      withdrawal.timestamp,
    transferType:   preparedTx.transferType,
    amount:         -preparedTx.amount,
    fee:            preparedTx.fees,
    sendAddress:    preparedTx.address,
    confirmed:      false,
    failed:         withdrawal.failed,
    withdrawalId:   withdrawal.id
  }

  if (withdrawal.txHash) {
    transaction.txHash = withdrawal.txHash;
  }

  try {
    await transactionDocRef.set(transaction);
    await refreshAccount(transaction.userId, transaction.accountId);

    return [transaction, undefined]
  } catch (e) {
    console.error(e);
    return[undefined, new AppError('app/transfer-error')];
  }
}

async function interAccountTransfer(
  sendingUserId: string,
  sendingAccountId: string,
  receivingAccountId: string,
  receivingAddress: string,
  amount: number): Promise<[Transaction | undefined, AppError | undefined]> {

  console.log(`recipient has an account with id: ${receivingAccountId}, do account transfer`);

  const receivingUser = await getUserByDefaultAccount(receivingAccountId);

  if (!receivingUser) {
    return [undefined, new AppError('app/user-not-found')];
  }

  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const [transfer, transferError] = await TrtlApp.transfer(sendingAccountId, receivingAccountId, amount);

  if (!transfer) {
    const appError = new AppError('app/transfer-error', (transferError as ServiceError).message);
    console.error(appError.message);
    return [undefined, appError];
  }

  const senderTxDocRef    = admin.firestore().collection(`users/${sendingUserId}/transactions`).doc();
  const receiverTxDocRef  = admin.firestore().collection(`users/${receivingUser.id}/transactions`).doc();

  const senderTransaction: Transaction = {
    id:                 senderTxDocRef.id,
    userId:             sendingUserId,
    accountId:          sendingAccountId,
    timestamp:          transfer.timestamp,
    transferType:       'account',
    amount:             -amount,
    fee:                0,
    sendAddress:        receivingAddress,
    confirmed:          true,
    failed:             false,
    accountTransferId:  transfer.id
  }

  const receiverTransaction: Transaction = {
    id:                 receiverTxDocRef.id,
    userId:             receivingUser.id,
    accountId:          receivingAccountId,
    timestamp:          transfer.timestamp,
    transferType:       'account',
    amount:             amount,
    fee:                0,
    confirmed:          true,
    failed:             false,
    accountTransferId:  transfer.id
  }

  await Promise.all([senderTxDocRef.set(senderTransaction), receiverTxDocRef.set(receiverTransaction)]);
  await Promise.all([
    refreshAccount(sendingUserId, sendingAccountId),
    refreshAccount(receivingUser.id, receivingAccountId)
  ]);

  return [senderTransaction, undefined];
}

async function createWalletUser(userRecord: admin.auth.UserRecord): Promise<void> {
  const id = userRecord.uid;

  let displayName = userRecord.displayName;

  if (!displayName) {
    if (userRecord.email) {
      displayName = userRecord.email;
    } else {
      displayName = 'Wallet user';
    }
  }

  const walletUser: WalletUser = {
    id: id,
    initialized: false,
    createdDate: Date.now(),
    displayName: displayName,
    hasPin: false
  }

  if (userRecord.email) {
    walletUser.email = userRecord.email;
  }

  await admin.firestore().doc(`users/${id}`).create(walletUser);
  await createTurtleAccount(id, true);
}

async function retryInitializeUsers(): Promise<void> {
  const querySnapshot = await admin.firestore()
                          .collection('users')
                          .where('initialized', '==', false)
                          .get();

  console.log(`users to retry initialize count: ${querySnapshot.size}`);

  if (querySnapshot.size === 0) {
    return;
  }

  const users     = querySnapshot.docs.map(doc => doc.data() as WalletUser);
  const promises  = users.map(user => createTurtleAccount(user.id, true));

  await Promise.all(promises);
}

async function getPreparedTransaction(userId: string, preparedTxId: string): Promise<PreparedTransaction | undefined> {

  const doc = await admin.firestore().doc(`users/${userId}/preparedTransactions/${preparedTxId}`).get();

  if (!doc.exists) {
    return undefined;
  }

  return doc.data() as PreparedTransaction;
}

async function getAccountByDepositAddress(depositAddress: string): Promise<Account | undefined> {
  const accountsSnapshot = await admin.firestore()
    .collectionGroup('accounts')
    .where('depositAddress', '==', depositAddress)
    .get();

  if (accountsSnapshot.size !== 1) {
    return undefined;
  }

  return accountsSnapshot.docs[0].data() as Account;
}

async function getUserByDefaultAccount(defaultAccountId: string): Promise<WalletUser | undefined> {
  const snapshot = await admin.firestore()
    .collection('users')
    .where('defaultAccount', '==', defaultAccountId)
    .get();

  if (snapshot.size !== 1) {
    return undefined;
  }

  return snapshot.docs[0].data() as WalletUser;
}

async function createTurtleAccount(
  walletUserId: string,
  defaultAccount: boolean): Promise<[Account | undefined, undefined | AppError]> {

  const [appId, appSecret] = getAppCredentials();
  TrtlApp.initialize(appId, appSecret);

  const [account, error] = await TrtlApp.createAccount();

  if (!account) {
    const e = error as ServiceError;
    console.error(e.message);
    return [undefined, new AppError('app/create-turtle-account-failed', e.message)];
  }

  const docRef = admin.firestore().doc(`users/${walletUserId}/accounts/${account.id}`);

  try {
    await docRef.create(account);

    if (defaultAccount) {
      const walletUserUpdate: WalletUserUpdate = {
        initialized: true,
        defaultAccount: account.id

      }

      await admin.firestore().doc(`users/${walletUserId}`).update(walletUserUpdate);
    }

  } catch (e) {
    console.error(e.message);
    return [undefined, new AppError('app/unknown-error')];
  }

  return [account, undefined];
}

function validateWebhookCall(request: functions.https.Request): boolean {
  const requestSignature = request.get('x-trtl-apps-signature');

  if (!requestSignature) {
    return false;
  }

  const [, appSecret] = getAppCredentials();

  const hash = 'sha256=' + crypto
                .createHmac("sha256", appSecret)
                .update(JSON.stringify(request.body))
                .digest("hex");

  return hash === requestSignature;
}

function getAppCredentials(): [string, string] {
  return [functions.config().trtlapp.id, functions.config().trtlapp.secret];
}

async function updatePriceInfo(): Promise<void> {
  const apiKey = functions.config().coinmarketcap.apikey;

  if (!apiKey) {
    console.error('invalid coinmarketcap api key, skipping price update');
    return;
  }

  const headers = {
    'X-CMC_PRO_API_KEY': apiKey
  }

  try {
    const response  = await axios.default.get(cmcPriceQuoteEndoint, { headers: headers });
    const quote     = response.data.data.TRTL.quote.USD;

    await admin.firestore().doc(`priceQuotes/USD`).set(quote);
  } catch (error) {
    console.error(error);
  }
}
