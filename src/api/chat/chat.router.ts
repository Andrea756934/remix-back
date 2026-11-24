import { Router } from "express";
import { list, messageId, create, createMessage } from "./chat.controller";
import { isAuthenticated } from "../../utils/auth/authenticated-middleware";
import { validate } from "../../utils/validation-middleware";
import { ListMessageDTO, sendMessageDTO, startConversationDTO } from "./chat.dto";

const router = Router();

router.get('/', isAuthenticated, list);
router.get('/:id/messages', isAuthenticated, validate(ListMessageDTO, 'query'), messageId);
router.post('/', isAuthenticated, validate(startConversationDTO, 'body'), create);
router.post('/:id/messages', isAuthenticated, validate(sendMessageDTO, 'body'), createMessage);

export default router;