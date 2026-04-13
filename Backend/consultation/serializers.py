from rest_framework import serializers
from authentication.models import User
from case.models import Case
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
	meeting_location = serializers.CharField(required=False, allow_blank=True)
	phone_number = serializers.CharField(required=False, allow_blank=True)
	lawyer = serializers.SerializerMethodField()
	client = serializers.SerializerMethodField()
	case_reference = serializers.SerializerMethodField()
	payment_status = serializers.SerializerMethodField()
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
			"payment_status",
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
		
		consultation_fee = None
		try:
			consultation_fee = obj.lawyer.lawyer_kyc.consultation_fee
		except Exception:
			consultation_fee = None

		return {
			"id": obj.lawyer.id,
			"name": obj.lawyer.name,
			"profile_image": profile_image_url,
			"consultation_fee": consultation_fee,
		}

	def get_client(self, obj):
		if not obj.client:
			return None
		
		profile_image_url = None
		if obj.client.profile_image:
			request = self.context.get('request')
			if request:
				profile_image_url = request.build_absolute_uri(obj.client.profile_image.url)
			else:
				profile_image_url = obj.client.profile_image.url
		
		return {
			"id": obj.client.id,
			"name": obj.client.name,
			"profile_image": profile_image_url,
		}

	def get_case_reference(self, obj):
		if not obj.case:
			return None
		return {
			"id": obj.case.id,
			"title": obj.case.title,
		}

	def get_payment_status(self, obj):
		appointment = obj.appointments.order_by("-updated_at").first()
		if appointment:
			return appointment.payment_status

		# Fallback for legacy records where appointment may not exist yet.
		if obj.mode == Consultation.MODE_IN_PERSON and obj.status == Consultation.STATUS_COMPLETED:
			return "paid"

		return "pending"

	def validate(self, data):
		if not data.get("title") or not data.get("title").strip():
			raise serializers.ValidationError(
				{"title": "Consultation title is required."}
			)

		# Prevent double-booking the same time slot for a lawyer while a consultation is pending or accepted
		lawyer = data.get("lawyer") or getattr(self.instance, "lawyer", None)
		requested_day = data.get("requested_day") or getattr(self.instance, "requested_day", None)
		requested_time = data.get("requested_time") or getattr(self.instance, "requested_time", None)
		if lawyer and requested_day and requested_time:
			existing = Consultation.objects.filter(
				lawyer=lawyer,
				requested_day=requested_day,
				requested_time=requested_time,
			).exclude(status__in=[Consultation.STATUS_REJECTED, Consultation.STATUS_COMPLETED])
			# If updating, ignore the current record
			if self.instance:
				existing = existing.exclude(pk=self.instance.pk)
			if existing.exists():
				raise serializers.ValidationError(
					{"requested_time": "This time slot is already booked. Choose another time."}
				)

		mode = data.get("mode")
		if mode == Consultation.MODE_IN_PERSON:
			if not data.get("meeting_location") or not data.get("meeting_location").strip():
				raise serializers.ValidationError(
					{"meeting_location": "Meeting location is required for in-person consultations."}
				)
			if not data.get("phone_number") or not data.get("phone_number").strip():
				raise serializers.ValidationError(
					{"phone_number": "Phone number is required for in-person consultations."}
				)
		return data

	def create(self, validated_data):
		request = self.context.get("request")
		if request and request.user and request.user.is_authenticated:
			validated_data["client"] = request.user
		return super().create(validated_data)
