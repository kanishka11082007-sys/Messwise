import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.user import User, AdminProfile, StudentProfile, NgoProfile
from app.core.security import get_password_hash


async def create_admin(username: str, email: str, password: str, name: str = "Admin"):
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.username == username))
        if existing.scalar_one_or_none():
            print(f"Error: User with username '{username}' already exists.")
            return

        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role="admin",
            is_active=True
        )
        db.add(user)
        await db.flush()

        profile = AdminProfile(
            user_id=user.id,
            name=name,
            username=username
        )
        db.add(profile)
        await db.commit()
        print(f"Successfully created admin '{username}' ({email}).")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python create_admin.py <username> <email> <password> [name]")
        print("Example: python create_admin.py supervisor admin@messwise.org AdminPass@123 'Rajesh Kumar'")
        sys.exit(1)

    username_arg = sys.argv[1]
    email_arg = sys.argv[2]
    password_arg = sys.argv[3]
    name_arg = sys.argv[4] if len(sys.argv) > 4 else "Mess Supervisor"

    asyncio.run(create_admin(username_arg, email_arg, password_arg, name_arg))
