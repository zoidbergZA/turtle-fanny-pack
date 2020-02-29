export type AppErrorCode =  'app/unknown-error'                 |
                            'app/create-turtle-account-failed'  |
                            'app/user-not-found'                |
                            'app/deposit-not-found'             |
                            'app/transfer-error'                |
                            'app/withdraw-error'                |
                            'app/withdrawal-not-found'          ;

export class AppError {
  public readonly errorCode: AppErrorCode;
  public readonly message: string;

  constructor(errorCode: AppErrorCode, customMessage?: string) {
    this.errorCode = errorCode;

    if (customMessage) {
      this.message = customMessage;
    } else {
      this.message = this.getErrorMessage(errorCode);
    }
  }

  getErrorMessage(errorCode: AppErrorCode): string {
    switch (errorCode) {
      case 'app/unknown-error':
        return 'An unknown error has occured.';
      case 'app/create-turtle-account-failed':
        return 'Failed to create TurtleApp user.';
      case 'app/user-not-found':
        return 'User not found.';
      case 'app/deposit-not-found':
        return 'Deposit not found.';
      case 'app/transfer-error':
        return 'An error occurred while processing account transfer';
      case 'app/withdraw-error':
        return 'An error occured while processing the withdrawal.';
      case 'app/withdrawal-not-found':
        return 'Withdrawal not found.';
      default:
        return 'An unknown error has occurred.';
    }
  }
}
