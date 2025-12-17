from rest_framework import serializers
from .models import User

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'is_lawyer', 'role', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'role']

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
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            is_lawyer=validated_data.get('is_lawyer', False)
        )
        return user


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
            
            attrs['user'] = user
            return attrs
