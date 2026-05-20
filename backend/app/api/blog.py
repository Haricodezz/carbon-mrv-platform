from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
import re

from app.db.session import get_db
from app.models.user import User
from app.models.blog_post import BlogPost
from app.core.dependencies import require_role
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse

router = APIRouter(
    prefix="/api/blog",
    tags=["Blog"]
)

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

@router.get("/", response_model=list[BlogPostResponse])
def get_blog_posts(
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(BlogPost)
    if status:
        query = query.filter(BlogPost.status == status)
    # Exclude drafts for non-admins by default, but allow everyone to read published
    return query.order_by(BlogPost.created_at.desc()).all()

@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog_post(
    slug: str,
    db: Session = Depends(get_db)
):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@router.post("/", response_model=BlogPostResponse)
def create_blog_post(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    slug = slugify(payload.title)
    
    # Ensure unique slug
    if db.query(BlogPost).filter(BlogPost.slug == slug).first():
        import time
        slug = f"{slug}-{int(time.time())}"
        
    post = BlogPost(
        title=payload.title,
        slug=slug,
        content=payload.content,
        thumbnail=payload.thumbnail,
        status=payload.status,
        category=payload.category,
        author_id=current_admin.id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.put("/{post_id}", response_model=BlogPostResponse)
def update_blog_post(
    post_id: UUID,
    payload: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(post, key, value)
        
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_blog_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    db.delete(post)
    db.commit()
    return {"status": "success"}
