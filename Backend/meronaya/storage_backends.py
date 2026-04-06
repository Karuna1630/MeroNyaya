from cloudinary_storage.storage import (
    MediaCloudinaryStorage,
    RawMediaCloudinaryStorage,
    VideoMediaCloudinaryStorage,
)

# Image-only assets (profile photos, etc.)
profile_image_storage = MediaCloudinaryStorage()

# Generic files (pdf/docs/kyc/case docs)
raw_file_storage = RawMediaCloudinaryStorage()

# Voice messages (webm/audio) are handled as video resource type in Cloudinary
voice_audio_storage = VideoMediaCloudinaryStorage()
