import { Request, Response } from 'express';
import { SendMessageRequest } from '@/types';
import { cacheAPIMessage, saveUsers } from '@/utils/quotaChecker';
import WhatsAppService from '@/utils/whatsappService';

const sendMessagesController = async (req: Request<{}, {}, SendMessageRequest>, res: Response) => {
   const whatsapp: WhatsAppService = new WhatsAppService();

   try {
      const { to, message } = req.body;

      if (!to || !message) {
         return res
            .status(400)
            .json({ error: 'Phone number and message are required' });
      }

      // if (!(await checkQuota(to, ''))) {
      // 	return res
      // 		.status(403)
      // 		.json({ error: 'Quota exceeded for this user.' });
      // }

      if (req.body?.messageId) {
         await whatsapp.markAsRead(req.body.messageId);
      }

      const result = await whatsapp.sendTextMessage(to, message, req.body?.messageId);

      if (result) {
         cacheAPIMessage({message, contact: to, name: req.body?.name});
         saveUsers({contact: to, name: req.body?.name});
      }

      return res.json({ success: true, data: result });
   } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
   }
}

export default sendMessagesController;