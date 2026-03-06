import hmac
import hashlib
import base64

from django.conf import settings


def generate_esewa_signature(message: str) -> str:
    """
    Generate HMAC-SHA256 signature for eSewa payment verification.

    Args:
        message: The string to sign, e.g. "total_amount=100,transaction_uuid=xxx,product_code=EPAYTEST"

    Returns:
        Base64-encoded HMAC-SHA256 signature
    """
    secret_key = settings.ESEWA_SECRET_KEY.encode("utf-8")
    message_bytes = message.encode("utf-8")

    hmac_signature = hmac.new(secret_key, message_bytes, hashlib.sha256)
    return base64.b64encode(hmac_signature.digest()).decode("utf-8")


def build_esewa_signature_message(total_amount, transaction_uuid, product_code=None):
    """
    Build the message string that eSewa expects for signature generation.
    Format: "total_amount=<amount>,transaction_uuid=<uuid>,product_code=<code>"
    """
    if product_code is None:
        product_code = settings.ESEWA_PRODUCT_CODE

    return f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
