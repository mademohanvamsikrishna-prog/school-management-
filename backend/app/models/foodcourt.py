"""Food Court models: categories, items, orders."""
from typing import List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class FoodCategory(Base, TimestampMixin):
    __tablename__ = "food_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    items: Mapped[List["FoodItem"]] = relationship("FoodItem", back_populates="category")


class FoodItem(Base, TimestampMixin):
    __tablename__ = "food_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("food_categories.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, default=False)

    category: Mapped[FoodCategory] = relationship("FoodCategory", back_populates="items")
    order_items: Mapped[List["FoodOrderItem"]] = relationship("FoodOrderItem", back_populates="food_item")


class FoodOrder(Base, TimestampMixin):
    __tablename__ = "food_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    # pending, confirmed, preparing, ready, delivered, cancelled
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    order_items: Mapped[List["FoodOrderItem"]] = relationship("FoodOrderItem", back_populates="order", cascade="all, delete-orphan")


class FoodOrderItem(Base, TimestampMixin):
    __tablename__ = "food_order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("food_orders.id", ondelete="CASCADE"), nullable=False)
    food_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("food_items.id", ondelete="RESTRICT"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)

    order: Mapped[FoodOrder] = relationship("FoodOrder", back_populates="order_items")
    food_item: Mapped[FoodItem] = relationship("FoodItem", back_populates="order_items")
