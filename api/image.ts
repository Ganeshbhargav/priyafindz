import { handleImageDelivery } from '../src/server/imageHandler.ts';

export default async function handler(req: any, res: any) {
  await handleImageDelivery(req, res);
}
