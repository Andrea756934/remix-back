import { paymentError } from "../../errors/payment.error";

//le variabili sono lette al momento della chiamata, così non dipendono dall'ordine di caricamento di dotenv
const baseUrl = () => process.env.PAYPAL_BASE_URL as string;

async function accessToken(): Promise<string> {
    const auth = Buffer
        .from(`${process.env.PAYPAL_CLIENT_ID}: ${process.env.PAYPAL_CLIENT_SECRET}`)
        .toString('base64');

    const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
        throw new paymentError();
    }

    const data: any = await res.json();
    return data.access_token;
}

async function call(path: string, body?: object, requestId?: string): Promise<any> {
    const res = await fetch(`${baseUrl()} ${path}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await accessToken()}`,
            'Content-Type': 'application/json',
            ...(requestId && { 'Paypal-Request-Id': requestId })
        },
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        //serve a capire perchè paypal rifiuta la richiesta
        console.error('Paypal error', res.status, await res.text());
        throw new paymentError();
    }

    return res.json();
}

export const paypal = {
    createOrder(orderId: string, cents: number, currency: string, title: string) {
        return call('/v2/checkout/orders', {
            intent: 'CAPTURE',
            purchase_units: [{
                custom_id: orderId,
                desciption: title.slice(0, 120),
                amount: {
                    currency_code: currency.toUpperCase(),
                    value: (cents / 100).toFixed(2)
                }
            }],
            payment_source: {
                paypal: {
                    experience_context: {
                        user_action: 'PAY_NOW',
                        return_url: `${process.env.FRONTEND_URL}/orders/${orderId}?payment=success`,
                        cancel_url: `${process.env.FRONTEND_URL}/orders/${orderId}?payment=cancelled`
                    }
                }
            }
        }, `create-${orderId}-${Date.now()}`);
    },

    captureOrder(paypalOrderId: string) {
        return call(`/v2/checkout/orders/${paypalOrderId}/capture`, undefined, `capture-${paypalOrderId}`);
    },

    refundCapture(captureId: string) {
        return call(`/v2/payments/captures/${captureId}/refund`, undefined, `refund-${captureId}`);
    }
}