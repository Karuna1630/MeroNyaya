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
			"title",
			"mode",
			"requested_day",
			"requested_time",
			"meeting_location",
			"phone_number",
			"scheduled_date",
			"scheduled_time",
			"meeting_link",
			"status",
			"created_at",
			"updated_at",
		]
		read_only_fields = ["status", "created_at", "updated_at", "client"]

	def get_lawyer(self, obj):
		if not obj.lawyer:
			return None
		
		profile_image_url = None
		if obj.lawyer.profile_image:
			request = self.context.get('request')
			if request:
				profile_image_url = request.build_absolute_uri(obj.lawyer.profile_image.url)
			else:
				profile_image_url = obj.lawyer.profile_image.url
		
		return {
			"id": obj.lawyer.id,
			"name": obj.lawyer.name,
			"profile_image": profile_image_url,
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

	def validate(self, data):
		if not data.get("title") or not data.get("title").strip():
			raise serializers.ValidationError(
				{"title": "Consultation title is required."}
			)
		if not data.get("meeting_location") or not data.get("meeting_location").strip():
			raise serializers.ValidationError(
				{"meeting_location": "Meeting location is required for all consultations."}
			)
		if not data.get("phone_number") or not data.get("phone_number").strip():
			raise serializers.ValidationError(
				{"phone_number": "Phone number is required for contact purposes."}
			)
		return data

	def create(self, validated_data):
		request = self.context.get("request")
		if request and request.user and request.user.is_authenticated:
			validated_data["client"] = request.user
		return super().create(validated_data)
