import os
import sys
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context

# Add Auth-Backend to sys.path so model imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Auth-Backend"))

# Load .env from Auth-Backend
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "Auth-Backend", ".env"))

# Import models
from src.data.models.postgres.base import Base  # noqa: E402
from src.data.models.postgres.permission import Permission  # noqa: E402, F401
from src.data.models.postgres.refresh_token import RefreshToken  # noqa: E402, F401
from src.data.models.postgres.role import Role  # noqa: E402, F401
from src.data.models.postgres.role_permission import RolePermission  # noqa: E402, F401
from src.data.models.postgres.user import User  # noqa: E402, F401

# Alembic Config object
config = context.config

# Build database URL from env vars
DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{os.getenv('POSTGRES_USER')}:"
    f"{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST')}:"
    f"{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}"
)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
