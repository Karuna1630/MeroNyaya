from rest_framework import serializers
from authentication.models import User
from case.models import Case
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
	lawyer = serializers.SerializerMethodField()
	client = serializers.SerializerMethodField()
	case_reference = serializers.SerializerMethodField()
	lawyer_id = serializers.PrimaryKeyRelatedField(
		queryset=User.objects.filter(is_lawyer=True),
		source="lawyer",
		write_only=True,
		required=True,
	)
	case_id = serializers.PrimaryKeyRelatedField(
		queryset=Case.objects.all(),
		source="case",
		write_only=True,
		required=False,
		allow_null=True,
	)

	class Meta:
		model = Consultation
		fields = [
			"id",
			"client",
			"lawyer",
			"case",
			"case_reference",
			"lawyer_id",
			"case_id",
			"mode",
			"requested_day",
			"requested_time",
			"notes",
			"status",
			"created_at",
			"updated_at",
		]
		read_only_fields = ["status", "created_at", "updated_at", "client"]

	def get_lawyer(self, obj):
		if not obj.lawyer:
			return None
		return {
			"id": obj.lawyer.id,
			"name": obj.lawyer.name,
			"profile_image": obj.lawyer.profile_image.url if obj.lawyer.profile_image else None,
		}

	def get_client(self, obj):
		if not obj.client:
			return None
		return {
			"id": obj.client.id,
			"name": obj.client.name,
		}

	def get_case_reference(self, obj):
		if not obj.case:
			return None
		return {
			"id": obj.case.id,
			"title": obj.case.title,
		}

	def create(self, validated_data):
		request = self.context.get("request")
		if request and request.user and request.user.is_authenticated:
			validated_data["client"] = request.user
		return super().create(validated_data)
