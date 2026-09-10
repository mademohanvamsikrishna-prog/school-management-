"""Inventory models: categories, items, stock movements, suppliers."""
from typing import List, Optional
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class InventoryCategory(Base, TimestampMixin):
    __tablename__ = "inventory_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    items: Mapped[List["InventoryItem"]] = relationship("InventoryItem", back_populates="category")


class InventoryItem(Base, TimestampMixin):
    __tablename__ = "inventory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("inventory_categories.id"), nullable=True)
    supplier_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("suppliers.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)  # pcs, kg, liters, etc.
    current_stock: Mapped[float] = mapped_column(Float, default=0.0)
    minimum_stock: Mapped[float] = mapped_column(Float, default=10.0)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)

    category: Mapped[Optional[InventoryCategory]] = relationship("InventoryCategory", back_populates="items")
    supplier = relationship("Supplier", foreign_keys=[supplier_id])
    movements: Mapped[List["StockMovement"]] = relationship("StockMovement", back_populates="item")


class StockMovement(Base, TimestampMixin):
    __tablename__ = "stock_movements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    item_id: Mapped[str] = mapped_column(String(36), ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False)
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)  # in, out, adjustment
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    reference: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    recorded_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    item: Mapped[InventoryItem] = relationship("InventoryItem", back_populates="movements")
    recorded_by = relationship("User", foreign_keys=[recorded_by_id])
