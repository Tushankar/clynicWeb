// Driver-aware payment collection. The server tells us which gateway is live via
// `order.driver`. In production (`razorpay`) we open the real Razorpay checkout, which
// returns {order_id, payment_id, signature} for the server to VERIFY. In dev (`mock`)
// no real gateway exists, so we ask the server's dev signing oracle (/payments/mock-sign)
// for an equivalent signed proof — verification still happens server-side, identically.
let loaderPromise = null;

function loadCheckoutScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loaderPromise = null;
      reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
    };
    document.head.appendChild(s);
  });
  return loaderPromise;
}

/**
 * Resolve a checkout proof {orderId, paymentId, signature} for a created order.
 * @param {object} order  Server order: { orderId, amount, currency, keyId, driver }
 * @param {object} opts
 * @param {(orderId:string)=>Promise<{paymentId:string,signature:string}>} opts.mockSign
 *        Context-specific dev signing call (clinic / portal / public each have their own).
 */
export async function collectPayment(order, { mockSign, name = 'Clinic', description, prefill = {} } = {}) {
  if (order?.driver === 'mock') {
    const { paymentId, signature } = await mockSign(order.orderId);
    return { orderId: order.orderId, paymentId, signature };
  }

  await loadCheckoutScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: Math.round((Number(order.amount) || 0) * 100), // paise
      currency: order.currency || 'INR',
      name,
      description,
      prefill,
      handler: (r) => resolve({
        orderId: r.razorpay_order_id,
        paymentId: r.razorpay_payment_id,
        signature: r.razorpay_signature,
      }),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'Payment failed')));
    rzp.open();
  });
}
