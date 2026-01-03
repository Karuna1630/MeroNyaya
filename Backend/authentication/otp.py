import random
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from.models import User, OTP


# Function to generate
def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


def create_and_send_otp(email,expiry_minutes=3):
    opt_code = generate_otp()

    OTP.objects.filter(email=email, is_used=False).update(is_used=True)

    otp = OTP.objects.create(
        email=email,
        otp=opt_code,
    )

    try:
        send_mail(
            subject="Your OTP Code",
            message=f"Your OTP code is {opt_code}. It will expire in {expiry_minutes} minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        return True
    except Exception as e:
        otp.delete()
        raise Exception(f"Failed to send OTP email: {e}")  


    # Function to verify OTP
def verify_otp(email, otp_input, expiry_minutes=3):
    otp = OTP.objects.filter(email=email, otp=otp_input, is_used=False).first()
    if not otp:
        return False, "No valid OTP found. Please request a new one."
    if timezone.now() > otp.created_at + timedelta(minutes=expiry_minutes):
        otp.delete()
        return False, "OTP has expired. Please request a new one."
    if otp.otp != otp_input:
        return False, "Invalid OTP. Please try again."
            
    otp.is_used = True
    otp.save()

    try:
        user = User.objects.get(email=email)
        # Mark user as verified and active
        user.is_verified = True
        user.save()
        return True, "OTP verified successfully."
    except User.DoesNotExist:
        return False, "User does not exist."
        
# Function to resend OTP   
def resend_otp(email):
    try:
        user = User.objects.get(email=email)
        if user.is_verified:
            return False, "Email is already verified."
        create_and_send_otp(email)
        return True, "OTP resent successfully."
    
    except User.DoesNotExist:
        return False, "User does not exist."