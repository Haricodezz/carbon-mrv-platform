# Auth & Role System Context

## 1. Authentication Protocol
The platform uses JSON Web Tokens (JWT) for authentication.

### Token Lifecycle
1. **Login**: User posts credentials to `/api/auth/login`.
2. **Generation**: The backend verifies the password hash (using `passlib.context.CryptContext` with `bcrypt`).
3. **Payload Structure**:
   ```json
   {
     "sub": "user_email@example.com",
     "id": "user-uuid-here",
     "role": "farmer",
     "exp": 1779218135
   }
   ```
4. **Encryption**: The payload is signed with the `SECRET_KEY` using the `HS256` algorithm.
5. **Authorization Header**: The client sends the token in subsequent HTTP requests:
   `Authorization: Bearer <token>`

---

## 2. Role-Based Access Control (RBAC) Matrix

We enforce strict role separation:

| API Router | Required Roles | Allowed Actions |
| :--- | :--- | :--- |
| **`/api/projects/`** | `farmer`, `ngo`, `nco`, `admin` | Create projects, submit boundaries, view own projects. |
| **`/api/auditor/`** | `auditor`, `admin` | View pending documents, retrieve private file signed URLs, approve/reject projects, flag fraud. |
| **`/api/blockchain/mint`** | `admin` | Mint ERC-20 credits for approved projects. |
| **`/api/marketplace/`** | `company`, `admin` | Purchase carbon credits, view sales history. |

---

## 3. Implementation Details

### FastAPI Dependencies
Role checks are defined as reusable dependencies:
```python
def require_role(allowed_roles: list[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Operation not allowed for this user role."
            )
        return current_user
    return dependency
```

### Password Policy
Passwords are hashed before database insertion. Salt rounds are set to `12` by default. Passwords must be a minimum of 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.
