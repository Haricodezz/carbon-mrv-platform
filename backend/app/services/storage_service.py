import uuid
import mimetypes
from typing import Tuple
from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
supabase_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf"
}

MAX_FILE_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def ensure_buckets_exist():
    """Programmatically checks and creates the required storage buckets if they do not exist."""
    try:
        existing_buckets = supabase_client.storage.list_buckets()
        existing_names = [b.name for b in existing_buckets]
        
        buckets_to_create = [
            ("kyc-documents", False),
            ("land-documents", False),
            ("certificates", True),
            ("reports", True),
            ("project-media", True)
        ]
        
        for name, is_public in buckets_to_create:
            if name not in existing_names:
                supabase_client.storage.create_bucket(name, options={"public": is_public})
    except Exception as e:
        print(f"[STORAGE WARNING] Could not verify/create storage buckets programmatically: {e}")


# Run bucket check immediately on import/initialization
ensure_buckets_exist()


def validate_file(file_content: bytes, filename: str, content_type: str | None = None) -> Tuple[bool, str]:
    """
    Validates file content type and size.
    Returns (is_valid, error_message).
    """
    # Validate size
    if len(file_content) > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds the limit of {settings.MAX_UPLOAD_SIZE_MB}MB."

    # Validate mime type
    mime = content_type
    if not mime:
        mime, _ = mimetypes.guess_type(filename)

    if not mime or mime.lower() not in ALLOWED_MIME_TYPES:
        return False, "Unsupported file format. Only PDF, JPG, JPEG, and PNG are allowed."

    return True, ""


def secure_filename(filename: str) -> str:
    """Generates a secure UUID-based filename preserving the extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    if ext not in ["pdf", "png", "jpg", "jpeg"]:
        ext = "bin"
    return f"{uuid.uuid4()}.{ext}"


def upload_file(
    file_content: bytes,
    bucket_name: str,
    destination_path: str,
    content_type: str = "application/octet-stream"
) -> str:
    """
    Uploads a file to Supabase Storage.
    Returns the public URL if the bucket is public, or the relative storage path if private.
    """
    # Upload to Supabase Storage
    # The SDK storage upload method accepts a file object or bytes
    res = supabase_client.storage.from_(bucket_name).upload(
        path=destination_path,
        file=file_content,
        file_options={"content-type": content_type, "upsert": "true"}
    )
    
    # Check if public
    is_public = bucket_name in ["certificates", "reports", "project-media"]
    if is_public:
        # Get public URL
        # For supabase storage public URL, we can get it via the API:
        # URL structure: {url}/storage/v1/object/public/{bucket}/{path}
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{destination_path}"
    else:
        # Return path relative to bucket for generating signed URLs later
        return destination_path


def delete_file(bucket_name: str, file_path: str):
    """Deletes a file from a Supabase Storage bucket."""
    try:
        supabase_client.storage.from_(bucket_name).remove([file_path])
    except Exception as e:
        print(f"[STORAGE WARNING] Failed to delete file {file_path} from bucket {bucket_name}: {e}")


def generate_signed_url(bucket_name: str, file_path: str, expires_in: int = 3600) -> str:
    """Generates a signed URL for a file in a private bucket."""
    try:
        # If file_path contains the bucket name prefix, strip it
        clean_path = file_path
        if file_path.startswith(f"{bucket_name}/"):
            clean_path = file_path[len(bucket_name) + 1:]
            
        res = supabase_client.storage.from_(bucket_name).create_signed_url(
            path=clean_path,
            expires_in=expires_in
        )
        # res returns a dict like {'signedURL': '...'} or similar depending on client wrapper
        if isinstance(res, dict) and "signedURL" in res:
            return res["signedURL"]
        elif hasattr(res, "signed_url"):
            return res.signed_url
        elif isinstance(res, dict) and "signed_url" in res:
            return res["signed_url"]
        return str(res)
    except Exception as e:
        print(f"[STORAGE ERROR] Error generating signed URL for {file_path} in {bucket_name}: {e}")
        # Return empty string or fallback path
        return ""


def upload_certificate(file_content: bytes, filename: str) -> str:
    """Uploads a certificate PDF to the public 'certificates' bucket and returns its public URL."""
    dest_name = secure_filename(filename)
    return upload_file(
        file_content=file_content,
        bucket_name="certificates",
        destination_path=dest_name,
        content_type="application/pdf"
    )


def upload_kyc_document(file_content: bytes, user_id: str, filename: str, content_type: str) -> str:
    """Uploads a KYC document to the private 'kyc-documents' bucket."""
    valid, err = validate_file(file_content, filename, content_type)
    if not valid:
        raise ValueError(err)

    dest_name = f"{user_id}/{secure_filename(filename)}"
    return upload_file(
        file_content=file_content,
        bucket_name="kyc-documents",
        destination_path=dest_name,
        content_type=content_type
    )


def upload_land_document(file_content: bytes, project_id: str, filename: str, content_type: str) -> str:
    """Uploads a land document to the private 'land-documents' bucket."""
    valid, err = validate_file(file_content, filename, content_type)
    if not valid:
        raise ValueError(err)

    dest_name = f"{project_id}/{secure_filename(filename)}"
    return upload_file(
        file_content=file_content,
        bucket_name="land-documents",
        destination_path=dest_name,
        content_type=content_type
    )
