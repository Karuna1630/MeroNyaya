from rest_framework import serializers
from .models import User
from .otp import create_otp, send_otp


# Serializer for User Response
class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'is_lawyer', 'role', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'role']

# Serializer for Registering User
class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone', 'is_lawyer']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already exist.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
    
    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name cannot be empty.")
        elif len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")   
        return value
    
    def validate_phone_number(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            is_lawyer=validated_data.get('is_lawyer', False),
            is_verified=False
        )
        # Send OTP for email verification
        try:
            create_otp(user.email)
        except Exception as e:
            print(f"Error sending OTP: {e}")

        return user

# Verify OTP Serializer
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, min_length=6, required=True)

# Resend OTP Serializer
class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

# Login Serializer
class LoginUserSerializer(serializers.Serializer):
        email = serializers.EmailField(required=True)
        password = serializers.CharField(write_only=True, required=True)

        def validate(self, attrs):
            email = attrs.get('email')
            password = attrs.get('password')

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
            
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid email or password.")
            
            # Check if user is verified
            if not user.is_verified:
                raise serializers.ValidationError("Email not verified. Please verify OTP first.")

            
            attrs['user'] = user
            return attrs

# Serializer for User Logout
class UserLogoutSerializers(serializers.Serializer):
    refresh = serializers.CharField(required=True)


# Serializer for Resetting Password
class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")

        return attrs
    
    

