from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'is_lawyer', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined', 'is_active']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone', 'is_lawyer']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
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
            is_lawyer=validated_data.get('is_lawyer', False)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        
        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password."})
        
        attrs['user'] = user
        return attrs
