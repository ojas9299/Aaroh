import type { NextApiRequest, NextApiResponse } from "next";

export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (...args: any[]) => void,
) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve();
    });
  });
}
