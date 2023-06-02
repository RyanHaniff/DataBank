import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export function createContext(opts?: FetchCreateContextFnOptions) {
  console.log(opts?.req.headers.get('Authorization'));
  return {
    headers: opts && Object.fromEntries(opts.req.headers),
    user: {
      isAdmin: true
    }
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
