from rest_framework import serializers
from .models import LawyerKYC, PersonalInfo, ProfessionalInfo, IdentityDocuments, Declaration
from django.db import transaction


class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = ['full_name', 'email', 'phone', 'dob', 'gender', 'permanent_address', 'current_address']
        

class ProfessionalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalInfo
        fields = [
            'bar_council_number', 'law_firm_name', 'years_of_experience', 
            'consultation_fee', 'specializations', 'availability_days', 
            'available_from', 'available_until'
        ]


class IdentityDocumentsSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE_MB = 5
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf'}

    def _validate_file(self, file_obj, field_name):
        if not file_obj:
            return
        # Size check (bytes)
        max_bytes = self.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_obj.size > max_bytes:
            raise serializers.ValidationError({field_name: f"File too large (>{self.MAX_FILE_SIZE_MB}MB)"})

        # Extension check
        import os

        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            allowed = ', '.join(sorted(self.ALLOWED_EXTENSIONS))
            raise serializers.ValidationError({field_name: f"Invalid file type. Allowed: {allowed}"})

    def validate(self, attrs):
        # Validate each uploaded file when present
        for field in [
            'citizenship_front', 'citizenship_back', 'lawyer_license',
            'passport_photo', 'law_degree', 'experience_certificate'
        ]:
            self._validate_file(attrs.get(field), field)
        return attrs

    class Meta:
        model = IdentityDocuments
        fields = [
            'citizenship_front', 'citizenship_back', 'lawyer_license',
            'passport_photo', 'law_degree', 'experience_certificate'
        ]


class DeclarationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Declaration
        fields = ['confirm_accuracy', 'authorize_verification', 'agree_terms']
        
    def validate(self, data):
        """Ensure all declarations are True"""
        if not data.get('confirm_accuracy'):
            raise serializers.ValidationError("You must confirm accuracy of information")
        if not data.get('authorize_verification'):
            raise serializers.ValidationError("You must authorize verification")
        if not data.get('agree_terms'):
            raise serializers.ValidationError("You must agree to terms and conditions")
        return data


class LawyerKYCSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer()
    professional_info = ProfessionalInfoSerializer()
    identity_documents = IdentityDocumentsSerializer()
    declaration = DeclarationSerializer()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = LawyerKYC
        fields = [
            'id', 'user', 'user_email', 'status', 'personal_info', 
            'professional_info', 'identity_documents', 'declaration',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']

    def validate(self, attrs):
        user = self.context.get('request').user if self.context.get('request') else None

        # On create: block duplicate KYC for pending/approved, or any existing rejected (force update)
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
        """Create KYC with all nested data"""
        personal_info_data = validated_data.pop('personal_info')
        professional_info_data = validated_data.pop('professional_info')
        identity_documents_data = validated_data.pop('identity_documents')
        declaration_data = validated_data.pop('declaration')

        request = self.context.get('request')
        user = request.user if request else None
        
        with transaction.atomic():
            kyc = LawyerKYC.objects.create(user=user, **validated_data)
            PersonalInfo.objects.create(kyc=kyc, **personal_info_data)
            ProfessionalInfo.objects.create(kyc=kyc, **professional_info_data)
            IdentityDocuments.objects.create(kyc=kyc, **identity_documents_data)
            Declaration.objects.create(kyc=kyc, **declaration_data)
        
        return kyc
    
    def update(self, instance, validated_data):
        """Update KYC and all nested data"""
        personal_info_data = validated_data.pop('personal_info', None)
        professional_info_data = validated_data.pop('professional_info', None)
        identity_documents_data = validated_data.pop('identity_documents', None)
        declaration_data = validated_data.pop('declaration', None)
        
        with transaction.atomic():
            instance.status = 'pending'
            instance.save()
            
            if personal_info_data:
                PersonalInfo.objects.update_or_create(kyc=instance, defaults=personal_info_data)
            
            if professional_info_data:
                ProfessionalInfo.objects.update_or_create(kyc=instance, defaults=professional_info_data)
            
            if identity_documents_data:
                identity_obj, _ = IdentityDocuments.objects.get_or_create(kyc=instance)
                for field, value in identity_documents_data.items():
                    if value is not None:
                        setattr(identity_obj, field, value)
                identity_obj.save()
            
            if declaration_data:
                Declaration.objects.update_or_create(kyc=instance, defaults=declaration_data)
        
        return instance


class KYCStatusSerializer(serializers.ModelSerializer):
    """Simplified serializer for checking KYC status"""
    class Meta:
        model = LawyerKYC
        fields = ['id', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminKYCReviewSerializer(serializers.ModelSerializer):
    """Serializer for admin to approve/reject KYC"""
    personal_info = PersonalInfoSerializer(read_only=True)
    professional_info = ProfessionalInfoSerializer(read_only=True)
    identity_documents = IdentityDocumentsSerializer(read_only=True)
    declaration = DeclarationSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = LawyerKYC
        fields = [
            'id', 'user', 'user_email', 'user_name', 'status', 
            'personal_info', 'professional_info', 'identity_documents', 
            'declaration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'user_name', 'created_at', 'updated_at']
    
    def validate_status(self, value):
        """Only allow approved or rejected status"""
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status must be either 'approved' or 'rejected'")
        return value
