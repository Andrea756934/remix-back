import { Router } from "express";
import { list, me, userId, update, remove } from "./user.controller";
import { isAuthenticated } from "../../utils/auth/authenticated-middleware";
import { validate } from "../../utils/validation-middleware";
import { updateProfileDTO, deleteAccountDTO } from "./user.dto";

const router = Router();

router.get('/', list);
router.get('/:id', isAuthenticated, userId);
router.get('/me', isAuthenticated, me);
router.put('/me', isAuthenticated, validate(updateProfileDTO, 'body'), update);
router.delete('/me', isAuthenticated, validate(deleteAccountDTO, 'body'), remove);

export default router;