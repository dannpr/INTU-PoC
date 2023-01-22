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

// save the EOA to the snap state
export const saveEOAInfo = async (EOA: string) => {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { EOA }],
  });
};

// get the EOA from the snap state
export const getEOAInfo = async () => {
  console.log(' EOA proposed');

  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  return state;
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
  switch (request.method) {
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
    case 'connect': {
      return new Promise((resolve, reject) => {
        saveEOAInfo(ExtEOA).then(() => {
          // get the EOA from the snap state
          getEOAInfo().then((state) => {
            promptUser(
              getMessage(origin),
              'Do you want to connect to this app?',
              `Your personal EOA is: ${ExtEOA}`,
            ).then((approval) => {
              console.log(' EOA approved');
              if (approval) {
                console.log(' EOA approved');
                resolve(state);
              } else {
                reject(new Error('EOA user'));
              }
            });
          });
        });
      });
    }
    default:
      throw new Error('Method not found.');
  }
};
