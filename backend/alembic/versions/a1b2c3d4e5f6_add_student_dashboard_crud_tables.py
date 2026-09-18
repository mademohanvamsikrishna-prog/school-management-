"""add_student_dashboard_crud_tables

Revision ID: a1b2c3d4e5f6
Revises: 9c2aed5324e9
Create Date: 2026-09-15 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9c2aed5324e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create student_assignments, notices, and student_leaves tables."""

    # ------------------------------------------------------------------
    # student_assignments
    # ------------------------------------------------------------------
    op.create_table(
        'student_assignments',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('class_id', sa.String(length=36), nullable=True),
        sa.Column('subject_name', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('due_date', sa.String(length=10), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('submission_notes', sa.Text(), nullable=True),
        sa.Column('attachment_url', sa.String(length=255), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('max_score', sa.Float(), nullable=False, server_default='100.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_student_assignments_student_id', 'student_assignments', ['student_id'])
    op.create_index('ix_student_assignments_due_date', 'student_assignments', ['due_date'])
    op.create_index('ix_student_assignments_status', 'student_assignments', ['status'])

    # ------------------------------------------------------------------
    # notices
    # ------------------------------------------------------------------
    op.create_table(
        'notices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='academic'),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('target_role', sa.String(length=50), nullable=False, server_default='all'),
        sa.Column('class_id', sa.String(length=36), nullable=True),
        sa.Column('posted_by_id', sa.String(length=36), nullable=True),
        sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('is_acknowledged', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('date', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['posted_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_notices_category', 'notices', ['category'])
    op.create_index('ix_notices_date', 'notices', ['date'])

    # ------------------------------------------------------------------
    # student_leaves
    # ------------------------------------------------------------------
    op.create_table(
        'student_leaves',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('student_id', sa.String(length=36), nullable=False),
        sa.Column('leave_type', sa.String(length=50), nullable=False, server_default='Medical'),
        sa.Column('start_date', sa.String(length=10), nullable=False),
        sa.Column('end_date', sa.String(length=10), nullable=False),
        sa.Column('days_count', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_student_leaves_student_id', 'student_leaves', ['student_id'])
    op.create_index('ix_student_leaves_start_date', 'student_leaves', ['start_date'])
    op.create_index('ix_student_leaves_end_date', 'student_leaves', ['end_date'])
    op.create_index('ix_student_leaves_status', 'student_leaves', ['status'])


def downgrade() -> None:
    """Drop student_assignments, notices, and student_leaves tables."""
    op.drop_index('ix_student_leaves_status', table_name='student_leaves')
    op.drop_index('ix_student_leaves_end_date', table_name='student_leaves')
    op.drop_index('ix_student_leaves_start_date', table_name='student_leaves')
    op.drop_index('ix_student_leaves_student_id', table_name='student_leaves')
    op.drop_table('student_leaves')

    op.drop_index('ix_notices_date', table_name='notices')
    op.drop_index('ix_notices_category', table_name='notices')
    op.drop_table('notices')

    op.drop_index('ix_student_assignments_status', table_name='student_assignments')
    op.drop_index('ix_student_assignments_due_date', table_name='student_assignments')
    op.drop_index('ix_student_assignments_student_id', table_name='student_assignments')
    op.drop_table('student_assignments')
