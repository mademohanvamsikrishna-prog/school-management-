"""Library models: book categories, books, copies, issues."""
from typing import List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class BookCategory(Base, TimestampMixin):
    __tablename__ = "book_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    books: Mapped[List["Book"]] = relationship("Book", back_populates="category")


class Book(Base, TimestampMixin):
    __tablename__ = "books"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("book_categories.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    author: Mapped[str] = mapped_column(String(150), nullable=False)
    isbn: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    publisher: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    publication_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_copies: Mapped[int] = mapped_column(Integer, default=1)

    category: Mapped[Optional[BookCategory]] = relationship("BookCategory", back_populates="books")
    copies: Mapped[List["BookCopy"]] = relationship("BookCopy", back_populates="book", cascade="all, delete-orphan")


class BookCopy(Base, TimestampMixin):
    __tablename__ = "book_copies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    book_id: Mapped[str] = mapped_column(String(36), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    copy_number: Mapped[str] = mapped_column(String(50), nullable=False)
    condition: Mapped[str] = mapped_column(String(30), default="good")  # good, fair, poor, lost
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    book: Mapped[Book] = relationship("Book", back_populates="copies")
    issues: Mapped[List["BookIssue"]] = relationship("BookIssue", back_populates="copy")


class BookIssue(Base, TimestampMixin):
    __tablename__ = "book_issues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    copy_id: Mapped[str] = mapped_column(String(36), ForeignKey("book_copies.id", ondelete="RESTRICT"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    issued_date: Mapped[str] = mapped_column(String(10), nullable=False)   # YYYY-MM-DD
    due_date: Mapped[str] = mapped_column(String(10), nullable=False)      # YYYY-MM-DD
    returned_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    fine_amount: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="issued", index=True)  # issued, returned, overdue

    copy: Mapped[BookCopy] = relationship("BookCopy", back_populates="issues")
    user = relationship("User", foreign_keys=[user_id])
