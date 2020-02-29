import { WalletUser } from '../../shared/types';
import { AppError } from '../../shared/appError';
import admin = require('firebase-admin');

export async function getAccountOwner(accountId: string): Promise<[WalletUser | undefined, undefined | AppError]> {
  const snapshot = await admin.firestore()
                    .collection(`users`)
                    .where('defaultAccount', '==', accountId)
                    .get();

  if (snapshot.size !== 1) {
    return [undefined, new AppError('app/user-not-found')];
  }

  const user = snapshot.docs[0].data() as WalletUser;

  return [user, undefined];
}
