"""Seed script - test ma'lumotlarini bazaga qo'shish"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.database.session import async_session
from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment
from app.core.security import hash_password
from app.utils.enums import UserRole, UserStatus, TaskStatus, TaskPriority


async def seed():
    async with async_session() as db:
        # === USERS ===
        # Admin allaqachon bor (jaxjax9114@gmail.com), uni topamiz
        result = await db.execute(select(User).where(User.role == UserRole.ADMIN))
        admin = result.scalar_one_or_none()

        if not admin:
            print("Admin topilmadi! Avval signup qiling.")
            return

        print(f"Admin topildi: {admin.full_name} ({admin.email})")

        # Approved developers
        developers_data = [
            {"full_name": "Ali Valiyev", "email": "ali@example.com"},
            {"full_name": "Vali Aliyev", "email": "vali@example.com"},
            {"full_name": "Sardor Karimov", "email": "sardor@example.com"},
            {"full_name": "Nodira Umarova", "email": "nodira@example.com"},
            {"full_name": "Bekzod Toshmatov", "email": "bekzod@example.com"},
        ]

        developers = []
        for dev_data in developers_data:
            existing = await db.execute(select(User).where(User.email == dev_data["email"]))
            if existing.scalar_one_or_none():
                continue
            dev = User(
                full_name=dev_data["full_name"],
                email=dev_data["email"],
                hashed_password=hash_password("Developer1"),
                role=UserRole.DEVELOPER,
                status=UserStatus.APPROVED,
                approved_by=admin.id,
            )
            db.add(dev)
            developers.append(dev)

        # Pending users
        pending_data = [
            {"full_name": "Jasur Ergashev", "email": "jasur@example.com"},
            {"full_name": "Malika Rahimova", "email": "malika@example.com"},
        ]
        for p_data in pending_data:
            existing = await db.execute(select(User).where(User.email == p_data["email"]))
            if existing.scalar_one_or_none():
                continue
            pending_user = User(
                full_name=p_data["full_name"],
                email=p_data["email"],
                hashed_password=hash_password("Pending123"),
                role=UserRole.DEVELOPER,
                status=UserStatus.PENDING,
            )
            db.add(pending_user)

        # Rejected user
        existing = await db.execute(select(User).where(User.email == "rejected@example.com"))
        if not existing.scalar_one_or_none():
            db.add(User(
                full_name="Rad Etilgan User",
                email="rejected@example.com",
                hashed_password=hash_password("Rejected1"),
                role=UserRole.DEVELOPER,
                status=UserStatus.REJECTED,
            ))

        await db.commit()

        # Reload developers
        result = await db.execute(
            select(User).where(User.role == UserRole.DEVELOPER, User.status == UserStatus.APPROVED)
        )
        developers = result.scalars().all()
        print(f"Developerlar soni: {len(developers)}")

        now = datetime.now(timezone.utc)

        # === TASKS ===
        tasks_data = [
            # NEW tasks
            {
                "title": "Login sahifasiga 'Parolni unutdim' qo'shish",
                "description": "Foydalanuvchi parolni tiklash uchun email orqali link olishi kerak. Reset token 1 soat amal qilsin.",
                "status": TaskStatus.NEW,
                "priority": TaskPriority.MEDIUM,
                "assigned_to": developers[0].id,
                "deadline": now + timedelta(days=7),
            },
            {
                "title": "API rate limiting qo'shish",
                "description": "Har bir IP uchun daqiqasiga 100 ta so'rov cheklovi o'rnatish kerak. Redis yoki in-memory cache ishlatilsin.",
                "status": TaskStatus.NEW,
                "priority": TaskPriority.HIGH,
                "assigned_to": developers[1].id,
                "deadline": now + timedelta(days=5),
            },
            {
                "title": "Foydalanuvchi profil sahifasi",
                "description": "User o'z ismini va parolini o'zgartira olsin. Avatar yuklash keyingi bosqichda.",
                "status": TaskStatus.NEW,
                "priority": TaskPriority.LOW,
                "assigned_to": developers[2].id,
                "deadline": now + timedelta(days=14),
            },
            {
                "title": "Dark mode qo'shish",
                "description": "Tailwind dark mode yoqilsin, toggle button header ga qo'yilsin.",
                "status": TaskStatus.NEW,
                "priority": TaskPriority.LOW,
                "assigned_to": None,
                "deadline": None,
            },

            # IN_PROGRESS tasks
            {
                "title": "Dashboard grafiklari",
                "description": "Chart.js yoki Recharts bilan vizual statistika: pie chart (status), bar chart (developer). Real-time yangilanish shart emas.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.HIGH,
                "assigned_to": developers[0].id,
                "deadline": now + timedelta(days=3),
            },
            {
                "title": "Task filtrlash va qidiruv optimizatsiyasi",
                "description": "Debounce qo'shish (300ms), URL query params bilan sync qilish, filter holatini saqlash.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.MEDIUM,
                "assigned_to": developers[3].id,
                "deadline": now + timedelta(days=4),
            },
            {
                "title": "Email bildirishnomalar tizimi",
                "description": "Task assign bo'lganda, status o'zgarganda developer ga email yuborish. SMTP sozlamalari .env dan olinsin.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.URGENT,
                "assigned_to": developers[1].id,
                "deadline": now + timedelta(days=2),
            },

            # REVIEW tasks
            {
                "title": "Unit testlar yozish - Auth service",
                "description": "pytest + httpx bilan signup, login, refresh endpointlari uchun testlar. Kamida 90% coverage.",
                "status": TaskStatus.REVIEW,
                "priority": TaskPriority.HIGH,
                "assigned_to": developers[2].id,
                "deadline": now + timedelta(days=1),
            },
            {
                "title": "Responsive dizayn tuzatishlari",
                "description": "Mobile (320px-768px) da sidebar, task card, forma elementlari to'g'ri ko'rinishi kerak. Safari va Chrome da test qilingan.",
                "status": TaskStatus.REVIEW,
                "priority": TaskPriority.MEDIUM,
                "assigned_to": developers[4].id,
                "deadline": now + timedelta(days=2),
            },

            # DONE tasks
            {
                "title": "JWT autentifikatsiya tizimi",
                "description": "Access + Refresh token mexanizmi. bcrypt password hashing. Token muddati: access 30 min, refresh 7 kun.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.URGENT,
                "assigned_to": developers[0].id,
                "deadline": now - timedelta(days=2),
                "completed_at": now - timedelta(days=3),
            },
            {
                "title": "User CRUD API",
                "description": "Admin foydalanuvchilarni ko'rish, tasdiqlash, rad etish, rol o'zgartirish endpointlari.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.HIGH,
                "assigned_to": developers[1].id,
                "deadline": now - timedelta(days=5),
                "completed_at": now - timedelta(days=6),
            },
            {
                "title": "Docker Compose konfiguratsiya",
                "description": "PostgreSQL, Backend, Frontend uchun docker-compose.yml. Health check, volume mount, env file sozlamalari.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.MEDIUM,
                "assigned_to": developers[3].id,
                "deadline": now - timedelta(days=10),
                "completed_at": now - timedelta(days=11),
            },
            {
                "title": "Alembic migration tizimi",
                "description": "Async engine bilan Alembic sozlash, initial migration yaratish.",
                "status": TaskStatus.DONE,
                "priority": TaskPriority.MEDIUM,
                "assigned_to": developers[4].id,
                "deadline": now - timedelta(days=12),
                "completed_at": now - timedelta(days=13),
            },

            # OVERDUE tasks (deadline o'tgan, lekin done emas)
            {
                "title": "Xavfsizlik audit - SQL injection tekshiruv",
                "description": "Barcha endpointlarni SQL injection ga tekshirish. Parameterized query ishlatilganini tasdiqlash.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.URGENT,
                "assigned_to": developers[2].id,
                "deadline": now - timedelta(days=1),
            },
            {
                "title": "CI/CD pipeline sozlash",
                "description": "GitHub Actions: lint, test, build, deploy. Staging va production muhitlari uchun.",
                "status": TaskStatus.NEW,
                "priority": TaskPriority.HIGH,
                "assigned_to": developers[4].id,
                "deadline": now - timedelta(days=3),
            },
        ]

        created_tasks = []
        for t_data in tasks_data:
            task = Task(
                title=t_data["title"],
                description=t_data["description"],
                status=t_data["status"],
                priority=t_data["priority"],
                assigned_to=t_data.get("assigned_to"),
                created_by=admin.id,
                deadline=t_data.get("deadline"),
                completed_at=t_data.get("completed_at"),
            )
            db.add(task)
            created_tasks.append(task)

        await db.commit()

        # Refresh tasks to get IDs
        for t in created_tasks:
            await db.refresh(t)

        print(f"Tasklar yaratildi: {len(created_tasks)}")

        # === COMMENTS ===
        comments_data = [
            (created_tasks[4], developers[0], "Recharts tanlandi, boshlandi. Pie chart tayyor."),
            (created_tasks[4], admin, "Bar chart ham kerak, developer bo'yicha progress ko'rsatsin."),
            (created_tasks[4], developers[0], "Tushunarli, bugun qo'shaman."),

            (created_tasks[6], developers[1], "SMTP sozlamalari qo'shildi, test emaillar yuborilmoqda."),
            (created_tasks[6], admin, "Gmail SMTP ishlatamizmi yoki SendGrid?"),
            (created_tasks[6], developers[1], "Hozircha Gmail, keyinroq SendGrid ga o'tamiz."),

            (created_tasks[7], developers[2], "Barcha testlar yashil, PR tayyor."),
            (created_tasks[7], admin, "Coverage 92% ekan, zo'r. Edge case lar ham bormi?"),

            (created_tasks[8], developers[4], "Safari da flexbox bilan muammo bor edi, tuzatdim."),

            (created_tasks[13], developers[2], "2 ta endpoint da raw SQL bor edi, parameterized qildim."),
            (created_tasks[13], admin, "Deadline o'tdi, tezroq tugatish kerak!"),
        ]

        for task, author, text in comments_data:
            comment = Comment(
                text=text,
                task_id=task.id,
                author_id=author.id,
            )
            db.add(comment)

        await db.commit()
        print(f"Kommentlar yaratildi: {len(comments_data)}")

        print("\n=== SEED TUGADI ===")
        print(f"Userlar: 1 admin + {len(developers)} developer + 2 pending + 1 rejected")
        print(f"Tasklar: {len(created_tasks)} ta (NEW: 4, IN_PROGRESS: 3, REVIEW: 2, DONE: 4, OVERDUE: 2)")
        print(f"Kommentlar: {len(comments_data)} ta")
        print("\nLogin ma'lumotlari:")
        print("  Developerlar: ali@example.com / Developer1")
        print("                vali@example.com / Developer1")
        print("                sardor@example.com / Developer1")
        print("                nodira@example.com / Developer1")
        print("                bekzod@example.com / Developer1")


if __name__ == "__main__":
    asyncio.run(seed())
