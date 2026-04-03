import hmac
import hashlib
import base64
import requests
import json
from decimal import Decimal
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


def get_esewa_payment_params(amount, tax_amount, total_amount, transaction_uuid):
    """
    Build the full set of parameters and signature for an eSewa initiation request.
    """
    message = build_esewa_signature_message(
        total_amount=str(total_amount),
        transaction_uuid=str(transaction_uuid),
    )
    signature = generate_esewa_signature(message)

    return {
        "amount": str(amount),
        "tax_amount": str(tax_amount),
        "total_amount": str(total_amount),
        "transaction_uuid": str(transaction_uuid),
        "product_code": settings.ESEWA_PRODUCT_CODE,
        "product_service_charge": "0",
        "product_delivery_charge": "0",
        "success_url": settings.ESEWA_SUCCESS_URL,
        "failure_url": settings.ESEWA_FAILURE_URL,
        "signed_field_names": "total_amount,transaction_uuid,product_code",
        "signature": signature,
    }


def verify_esewa_payment_remote(total_amount, transaction_uuid):
    """
    Call eSewa's backend API to verify a transaction status.
    """
    try:
        response = requests.get(
            settings.ESEWA_VERIFY_URL,
            params={
                "product_code": settings.ESEWA_PRODUCT_CODE,
                "total_amount": str(total_amount),
                "transaction_uuid": str(transaction_uuid),
            },
            timeout=15,
        )
        data = response.json()
        return data.get("status"), data.get("ref_id")
    except Exception:
        return None, None


def initiate_khalti_payment(amount_in_paisa, purchase_order_id, purchase_order_name, customer_info, return_url=None):
    """
    Call Khalti's initiate API and handle response/errors.
    """
    khalti_payload = {
        "return_url": return_url or settings.KHALTI_RETURN_URL,
        "website_url": settings.KHALTI_WEBSITE_URL,
        "amount": amount_in_paisa,
        "purchase_order_id": purchase_order_id,
        "purchase_order_name": purchase_order_name,
        "customer_info": customer_info,
    }

    # Ensure the URL doesn't have double slashes
    base_url = settings.KHALTI_BASE_URL.rstrip('/')
    initiate_url = f"{base_url}/epayment/initiate/"

    try:
        response = requests.post(
            initiate_url,
            json=khalti_payload,
            headers={
                "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        
        if response.status_code == 200:
            return True, response.json()
        else:
            try:
                error_detail = response.json()
            except Exception:
                error_detail = response.text or "Unknown Khalti error"
            return False, error_detail
            
    except Exception as e:
        return False, str(e)


def verify_khalti_payment(pidx):
    """
    Call Khalti's lookup API to verify a payment status.
    """
    base_url = settings.KHALTI_BASE_URL.rstrip('/')
    lookup_url = f"{base_url}/epayment/lookup/"

    try:
        response = requests.post(
            lookup_url,
            json={"pidx": pidx},
            headers={
                "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if response.status_code == 200:
            return True, response.json()
        return False, response.text
    except Exception as e:
        return False, str(e)
