import hmac
import hashlib
import razorpay
from fastapi import HTTPException, status
from app.core.config import settings

class PaymentService:
    def __init__(self):
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            self.client = None
        else:
            self.client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

    def create_razorpay_order(self, amount: float, currency: str = "INR", receipt: str = None):
        if not self.client:
            # Mock for local MVP if credentials missing, but here we should try to use real one
            # For local MVP without credentials, we can return a mock order ID
            return {
                "id": "order_mock_" + hashlib.md5(str(amount).encode()).hexdigest()[:10],
                "amount": int(amount * 100),
                "currency": currency,
                "status": "created"
            }

        try:
            data = {
                "amount": int(amount * 100),  # Razorpay expects amount in paise
                "currency": currency,
                "receipt": receipt,
                "payment_capture": 1
            }
            order = self.client.order.create(data=data)
            return order
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Razorpay order creation failed: {str(e)}"
            )

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str):
        if not self.client:
            # Mock verification for local MVP
            return True

        try:
            # Verify signature
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
