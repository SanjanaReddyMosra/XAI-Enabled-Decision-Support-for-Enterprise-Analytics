"""001_initial_schema: users, analyses, and audit logs

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-29 08:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Create users table
    if 'users' not in existing_tables:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('first_name', sa.String(length=100), nullable=False),
            sa.Column('last_name', sa.String(length=100), nullable=False),
            sa.Column('date_of_birth', sa.String(length=30), nullable=False),
            sa.Column('gender', sa.String(length=30), nullable=False),
            sa.Column('phone', sa.String(length=30), nullable=False),
            sa.Column('email', sa.String(length=150), nullable=False),
            sa.Column('organization', sa.String(length=150), nullable=False),
            sa.Column('job_title', sa.String(length=150), nullable=False),
            sa.Column('department', sa.String(length=100), nullable=False),
            sa.Column('years_of_experience', sa.Float(), nullable=False),
            sa.Column('username', sa.String(length=100), nullable=False),
            sa.Column('password_hash', sa.String(length=255), nullable=False),
            sa.Column('role', sa.String(length=50), server_default='user', nullable=False),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
            sa.Column('terms_accepted_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('last_login', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # 2. Create analyses table
    if 'analyses' not in existing_tables:
        op.create_table(
            'analyses',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('analysis_name', sa.String(length=200), nullable=True),
            sa.Column('applicant_reference', sa.String(length=100), nullable=True),
            sa.Column('input_features', sa.JSON(), nullable=False),
            sa.Column('predicted_class', sa.String(length=50), nullable=False),
            sa.Column('good_risk_probability', sa.Float(), nullable=False),
            sa.Column('bad_risk_probability', sa.Float(), nullable=False),
            sa.Column('shap_results', sa.JSON(), nullable=True),
            sa.Column('counterfactual_results', sa.JSON(), nullable=True),
            sa.Column('uncertainty_results', sa.JSON(), nullable=True),
            sa.Column('fairness_results', sa.JSON(), nullable=True),
            sa.Column('decision_summary', sa.Text(), nullable=True),
            sa.Column('model_version', sa.String(length=50), server_default='xgboost-v1.0', nullable=False),
            sa.Column('status', sa.String(length=30), server_default='completed', nullable=False),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_analyses_id'), 'analyses', ['id'], unique=False)
        op.create_index(op.f('ix_analyses_user_id'), 'analyses', ['user_id'], unique=False)
        op.create_index(op.f('ix_analyses_created_at'), 'analyses', ['created_at'], unique=False)

    # 3. Create prediction_audit_logs table
    if 'prediction_audit_logs' not in existing_tables:
        op.create_table(
            'prediction_audit_logs',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('timestamp', sa.DateTime(), nullable=True),
            sa.Column('model_version', sa.String(length=50), server_default='xgboost-v1.0', nullable=True),
            sa.Column('prediction_class', sa.Integer(), nullable=True),
            sa.Column('prediction_label', sa.String(length=50), nullable=True),
            sa.Column('probability_good', sa.Float(), nullable=True),
            sa.Column('probability_bad', sa.Float(), nullable=True),
            sa.Column('conformal_set', sa.String(length=100), nullable=True),
            sa.Column('top_shap_factors', sa.Text(), nullable=True),
            sa.Column('applicant_metadata', sa.Text(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_prediction_audit_logs_id'), 'prediction_audit_logs', ['id'], unique=False)
        op.create_index(op.f('ix_prediction_audit_logs_user_id'), 'prediction_audit_logs', ['user_id'], unique=False)
        op.create_index(op.f('ix_prediction_audit_logs_timestamp'), 'prediction_audit_logs', ['timestamp'], unique=False)

def downgrade() -> None:
    op.drop_table('prediction_audit_logs')
    op.drop_table('analyses')
    op.drop_table('users')
