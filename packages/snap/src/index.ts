import { OnRpcRequestHandler } from '@metamask/snap-types';

// setup up an Extern EOA account
const ExtEOA = '0x8EfA5dA2966d4ef0F5Ea6826Dec64447DD9c75Cc';
/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

export const promptUser = async (
  prompt: string,
  description: string,
  content: string,
): Promise<boolean> => {
  const response: any = await wallet.request({
    method: 'snap_confirm',
    params: [
      {
        prompt,
        description,
        textAreaContent: content,
      },
    ],
  });
  console.log('Prompt user response', response);
  if (response) {
    return response;
  }
  return false;
};

export const signing = async (EOA: string, message: string) => {
  const response: any = await wallet.request({
    method: 'snap_signMessage',
    params: [EOA, message],
  });
  console.log('signing response', response);
  if (response) {
    return response;
  }
  return false;
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  // get the EOA store
/*   let state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  if (!state) {
    state = { ExtEOA };
    // initialize state if empty and set default data
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', state],
    });
  } */

  switch (request.method) {
    case 'connect': {
      console.log('User update EOA account');

      await wallet.request({
        method: 'snap_manageState',
        params: ['update', /* state */ { Ext: ExtEOA }],
      });

      /*  console.log('Connecting EOA...');
      promptUser(
        getMessage(origin),
        'Do you want to use INTU EOA account?',
        `Your new Address is ${ExtEOA}`,
      ).then((approval) => {
        if (approval) {
          console.log('state', state);
          console.log('User approved');
        } else {
          Error('EOA user');
        }
      }); */
      console.log('User getting EOA account');

      const eoa = await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });

      console.log('state', eoa);
      return true;
    }
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: getMessage(origin),
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });

    // this method retrieve the unique key associated with an app that has been added to the MetaMask browser extension.
    // This key can be used to interact with the app, such as signing transactions, and is necessary for the app to function properly.
    /*       return wallet.request({
        method: 'snap_getAppKey',
      }); */
    default:
      throw new Error('Method not found.');
  }
};
