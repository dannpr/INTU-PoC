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
  let state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });

  if (!state) {
    state = { data: ExtEOA };
    // initialize state if empty and set default data
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', state],
    });
  }

  switch (request.method) {
    case 'storeEOA': {
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', state],
      });

      return true;
    }

    case 'retrieveEOA': {
      const eoa = await wallet.request({
        method: 'snap_manageState',
        params: ['get'],
      });
      return eoa;
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

    default:
      throw new Error('Method not found.');
  }
};
