import hmac
import hashlib
import razorpay
from fastapi import HTTPException, status
from app.core.config import settings

_PLACEHOLDER_KEYS = {
    "",
    "your_key_id",
    "your_key_secret",
    "changeme",
    "placeholder",
}


def _razorpay_is_configured() -> bool:
    key_id = (settings.RAZORPAY_KEY_ID or "").strip()
    key_secret = (settings.RAZORPAY_KEY_SECRET or "").strip()
    return (
        key_id.lower() not in _PLACEHOLDER_KEYS
        and key_secret.lower() not in _PLACEHOLDER_KEYS
    )


class PaymentService:
    def __init__(self):
        self.is_mock = not _razorpay_is_configured()
        if not self.is_mock:
            self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        else:
            self.client = None

    def create_razorpay_order(self, amount_inr: float, currency: str = "INR", receipt: str = None):
        if self.is_mock:
            # Mock MVP structure
            return {
                "id": "order_mock_" + hashlib.md5(str(amount_inr).encode()).hexdigest()[:10],
                "amount": int(amount_inr * 100),
                "currency": currency,
                "status": "created"
            }

        try:
            data = {
                "amount": int(amount_inr * 100), # amount in paise
                "currency": currency,
                "receipt": receipt,
                "payment_capture": 1
            }
            return self.client.order.create(data=data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Razorpay order creation failed: {str(e)}"
            )

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str):
        if self.is_mock:
            return True # Auto-approve for local MVP testing
            
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except Exception:
            return False

payment_service = PaymentService()
