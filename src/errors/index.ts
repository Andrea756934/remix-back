import { notFoundHandler } from "./not-found.error";
import { genericErrorHandel } from "./generic";
import { validationHandler } from "./validation.error";
import { invalidOrderStateHandler } from "./invalid-order-state.error";
import { alreadyReviewedHandler } from "./already-reviewed.error";
import { paymentHandler } from "./payment.error";
import { ProductNotAvailableHandler } from "./product-not-available.error";
import { reviewNotAllowedHandler } from "./review-not-allowed.error";
import { selfConversationHandler } from "./self-conversation.error";
import { selfPurchaseHandler } from "./self-purchase.error";
import { InvalidPasswordHandler } from "./invalid-password.error";
import { ActiveOrdersHandler } from "./active-orders.error";

export const errorHandlers = [
    notFoundHandler,
    genericErrorHandel,
    validationHandler,
    invalidOrderStateHandler,
    InvalidPasswordHandler,
    alreadyReviewedHandler,
    paymentHandler,
    ProductNotAvailableHandler,
    reviewNotAllowedHandler,
    selfConversationHandler,
    selfPurchaseHandler,
    ActiveOrdersHandler
];