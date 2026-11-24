import { Router } from "express";
import { list, productId, create, update, remove, signImage, mine, seller, status, category } from "./prodotti.controller";
import { isAuthenticated } from "../../utils/auth/authenticated-middleware";
import { validate } from "../../utils/validation-middleware";
import { addProductDTO, ChangeStatusDTO, ListMineDTO, ListProductDTO, updateProductDTO } from "./prodotti.dto";

const router = Router();

router.get('/', isAuthenticated, validate(ListProductDTO, 'query'), list);
router.get('/:id', isAuthenticated, validate(ListProductDTO, 'params'), productId);
router.get('/mine', isAuthenticated, validate(ListMineDTO, 'query'), mine);
router.get('/seller/:id', isAuthenticated, validate(ListProductDTO, 'query'), seller);
router.get('/category', isAuthenticated, category);
router.post('/', isAuthenticated, validate(addProductDTO, 'body'), create);
router.post('/images/sign', isAuthenticated, signImage);
router.put('/:id', isAuthenticated, validate(updateProductDTO, 'body'), update);
router.put('/:id/status', isAuthenticated, validate(ChangeStatusDTO, 'body'), status);
router.delete('/:id', isAuthenticated, remove);

export default router;