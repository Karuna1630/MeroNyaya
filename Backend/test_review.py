"""Quick test to reproduce the 500 error in SubmitReviewView"""
import os, django, traceback as tb
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meronaya.settings')
django.setup()

from review.models import Review
from review.serializers import ReviewSerializer
from authentication.models import User
from appointment.models import Appointment

# Get the review that was just created
review = Review.objects.filter(appointment_id=2).first()
if not review:
    print("No review found for appointment 2, creating one...")
    user = User.objects.get(id=2)
    apt = Appointment.objects.get(id=2)
    lawyer = User.objects.get(id=4)
    review = Review.objects.create(client=user, lawyer=lawyer, comment='test', rating=4, appointment=apt)
    print(f"Created review {review.id}")

print(f"Review: {review.id}, client={review.client_id}, lawyer={review.lawyer_id}, apt={review.appointment_id}")

# Now try to serialize it - this is likely where the 500 happens
try:
    from django.test import RequestFactory
    from rest_framework.test import force_authenticate
    factory = RequestFactory()
    request = factory.get('/')
    force_authenticate(request, User.objects.get(id=2))
    
    serializer = ReviewSerializer(review, context={'request': request})
    data = serializer.data
    print(f"Serialized OK: {data}")
except Exception as e:
    print(f"\n=== SERIALIZATION ERROR ===")
    print(f"Error: {e}")
    tb.print_exc()
