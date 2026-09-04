from typing import List, Optional
from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class FeeCategory(Base, TimestampMixin):
    __tablename__ = "fee_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class FeeInvoice(Base, TimestampMixin):
    __tablename__ = "fee_invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("fee_categories.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    due_date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)  # paid, pending, overdue

    student = relationship("User", foreign_keys=[student_id])
    category = relationship("FeeCategory", foreign_keys=[category_id])
    payments: Mapped[List["PaymentRecord"]] = relationship("PaymentRecord", back_populates="invoice", cascade="all, delete-orphan")


class PaymentRecord(Base, TimestampMixin):
    __tablename__ = "payment_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    invoice_id: Mapped[str] = mapped_column(String(36), ForeignKey("fee_invoices.id", ondelete="CASCADE"), index=True, nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="simulated_sandbox")  # Explicitly simulated
    transaction_reference: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="success")

    invoice: Mapped[FeeInvoice] = relationship("FeeInvoice", back_populates="payments")
