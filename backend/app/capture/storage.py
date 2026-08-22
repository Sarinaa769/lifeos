from minio import Minio
from app.core.config import settings

client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False,
)

if not client.bucket_exists(settings.MINIO_BUCKET):
    client.make_bucket(settings.MINIO_BUCKET)


def save_audio(local_path: str, object_name: str) -> str:
    client.fput_object(settings.MINIO_BUCKET, object_name, local_path)
    return object_name