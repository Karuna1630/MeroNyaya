from rest_framework import serializers
from .models import LawyerKYC
from django.db import transaction
from authentication.models import User


class LawyerDirectorySerializer(serializers.ModelSerializer):
    """Public lawyer directory serializer using profile + optional KYC data"""
    profile_image = serializers.SerializerMethodField()

    kyc_status = serializers.SerializerMethodField()
    bar_council_number = serializers.SerializerMethodField()
    law_firm_name = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    consultation_fee = serializers.SerializerMethodField()
    specializations = serializers.SerializerMethodField()
    availability_days = serializers.SerializerMethodField()
    available_from = serializers.SerializerMethodField()
    available_until = serializers.SerializerMethodField()
    verified_at = serializers.SerializerMethodField()
    dob = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'phone', 'profile_image', 'bio', 'city', 'district',
            'kyc_status', 'bar_council_number', 'law_firm_name',
            'years_of_experience', 'consultation_fee', 'specializations',
            'availability_days', 'available_from', 'available_until',
            'verified_at', 'dob'
        ]

    def get_profile_image(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def _get_kyc(self, obj):
        return getattr(obj, 'lawyer_kyc', None)

    def get_kyc_status(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.status if kyc else None

    def get_bar_council_number(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.bar_council_number if kyc else None

    def get_law_firm_name(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.law_firm_name if kyc else None

    def get_years_of_experience(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.years_of_experience if kyc else None

    def get_consultation_fee(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.consultation_fee if kyc else None

    def get_specializations(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.specializations if kyc else None

    def get_availability_days(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.availability_days if kyc else None

    def get_available_from(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.available_from if kyc else None

    def get_available_until(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.available_until if kyc else None

    def get_verified_at(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.verified_at if kyc else None

    def get_dob(self, obj):
        kyc = self._get_kyc(obj)
        return kyc.dob if kyc else None


class LawyerKYCSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    profile_image = serializers.SerializerMethodField()
    
    MAX_FILE_SIZE_MB = 5
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf'}

    class Meta:
        model = LawyerKYC
        fields = [
            'id', 'user', 'user_email', 'profile_image', 'status', 'rejection_reason', 'verified_at',
            # Personal Info
            'full_name', 'email', 'phone', 'dob', 'gender', 'permanent_address', 'current_address',
            # Professional Info
            'bar_council_number', 'law_firm_name', 'years_of_experience', 'consultation_fee',
            'specializations', 'availability_days', 'available_from', 'available_until',
            # Identity Documents
            'citizenship_front', 'citizenship_back', 'lawyer_license', 'passport_photo',
            'law_degree', 'experience_certificate',
            # Declaration
            'confirm_accuracy', 'authorize_verification', 'agree_terms',
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'profile_image', 'status', 'rejection_reason', 'verified_at', 'created_at', 'updated_at']

    def get_profile_image(self, obj):
        """Get full URL for profile image"""
        if obj.user and obj.user.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_image.url)
            return obj.user.profile_image.url
        return None

    def _validate_file(self, file_obj, field_name):
        """Validate file size and extension"""
        if not file_obj:
            return
        
        max_bytes = self.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_obj.size > max_bytes:
            raise serializers.ValidationError({field_name: f"File too large (>{self.MAX_FILE_SIZE_MB}MB)"})

        import os
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            allowed = ', '.join(sorted(self.ALLOWED_EXTENSIONS))
            raise serializers.ValidationError({field_name: f"Invalid file type. Allowed: {allowed}"})

    def validate(self, attrs):
        user = self.context.get('request').user if self.context.get('request') else None

        # Validate all document files
        for field in ['citizenship_front', 'citizenship_back', 'lawyer_license', 'passport_photo', 'law_degree', 'experience_certificate']:
            self._validate_file(attrs.get(field), field)
        
        # Only validate declarations on creation (POST), not on updates (PUT/PATCH)
        # On updates, keep existing values if not provided
        if self.instance is None:  # Creation
            if not attrs.get('confirm_accuracy'):
                raise serializers.ValidationError("You must confirm accuracy of information")
            if not attrs.get('authorize_verification'):
                raise serializers.ValidationError("You must authorize verification")
            if not attrs.get('agree_terms'):
                raise serializers.ValidationError("You must agree to terms and conditions")

        # On create: block duplicate KYC
        if self.instance is None:
            if not user or not user.is_authenticated:
                raise serializers.ValidationError("Authentication required")

            existing = LawyerKYC.objects.filter(user=user).first()
            if existing:
                if existing.status in ['pending', 'approved']:
                    raise serializers.ValidationError("KYC already submitted. Await review or use existing record.")
                if existing.status == 'rejected':
                    raise serializers.ValidationError("KYC was rejected. Please update your existing KYC instead of creating a new one.")

        # On update: only allowed when current status is rejected
        else:
            if self.instance.status != 'rejected':
                raise serializers.ValidationError("KYC can only be updated when status is 'rejected'.")

        return attrs
        
    def create(self, validated_data):
        """Create KYC with user context"""
        request = self.context.get('request')
        user = request.user if request else None
        
        kyc = LawyerKYC.objects.create(user=user, **validated_data)
        return kyc
    
    def update(self, instance, validated_data):
        """Update KYC and reset status to pending"""
        validated_data['status'] = 'pending'
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class KYCStatusSerializer(serializers.ModelSerializer):
    """Simplified serializer for checking KYC status"""
    class Meta:
        model = LawyerKYC
        fields = ['id', 'status', 'rejection_reason', 'verified_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminKYCReviewSerializer(serializers.ModelSerializer):
    """Serializer for admin to approve/reject KYC"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = LawyerKYC
        fields = [
            'id', 'user', 'user_email', 'user_name', 'status', 'rejection_reason', 'verified_at',
            # Personal Info
            'full_name', 'email', 'phone', 'dob', 'gender', 'permanent_address', 'current_address',
            # Professional Info
            'bar_council_number', 'law_firm_name', 'years_of_experience', 'consultation_fee',
            'specializations', 'availability_days', 'available_from', 'available_until',
            # Identity Documents
            'citizenship_front', 'citizenship_back', 'lawyer_license', 'passport_photo',
            'law_degree', 'experience_certificate',
            # Declaration
            'confirm_accuracy', 'authorize_verification', 'agree_terms',
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'user_name', 'created_at', 'updated_at']
    
    def validate_status(self, value):
        """Only allow approved or rejected status"""
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status must be either 'approved' or 'rejected'")
        return value
    
    def update(self, instance, validated_data):
        """Update KYC status with timestamp"""
        from django.utils import timezone
        
        status_changed = validated_data.get('status') != instance.status
        
        if validated_data.get('status') == 'approved':
            validated_data['verified_at'] = timezone.now()
            # Update user's is_kyc_verified flag
            if status_changed:
                instance.user.is_kyc_verified = True
                instance.user.save()
        elif validated_data.get('status') == 'rejected':
            # Remove KYC verification from user
            if status_changed:
                instance.user.is_kyc_verified = False
                instance.user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
