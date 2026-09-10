"""Hostel models: hostels, rooms, beds, allocations."""
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Hostel(Base, TimestampMixin):
    __tablename__ = "hostels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # boys, girls, staff
    warden_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_capacity: Mapped[int] = mapped_column(Integer, default=0)

    warden = relationship("User", foreign_keys=[warden_id])
    rooms: Mapped[List["HostelRoom"]] = relationship("HostelRoom", back_populates="hostel", cascade="all, delete-orphan")


class HostelRoom(Base, TimestampMixin):
    __tablename__ = "hostel_rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hostel_id: Mapped[str] = mapped_column(String(36), ForeignKey("hostels.id", ondelete="CASCADE"), nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    floor: Mapped[int] = mapped_column(Integer, default=1)
    capacity: Mapped[int] = mapped_column(Integer, default=4)
    room_type: Mapped[str] = mapped_column(String(30), default="general")  # general, ac, deluxe

    hostel: Mapped[Hostel] = relationship("Hostel", back_populates="rooms")
    beds: Mapped[List["HostelBed"]] = relationship("HostelBed", back_populates="room", cascade="all, delete-orphan")


class HostelBed(Base, TimestampMixin):
    __tablename__ = "hostel_beds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("hostel_rooms.id", ondelete="CASCADE"), nullable=False)
    bed_number: Mapped[str] = mapped_column(String(10), nullable=False)
    is_occupied: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    room: Mapped[HostelRoom] = relationship("HostelRoom", back_populates="beds")
    allocations: Mapped[List["BedAllocation"]] = relationship("BedAllocation", back_populates="bed")


class BedAllocation(Base, TimestampMixin):
    __tablename__ = "bed_allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    bed_id: Mapped[str] = mapped_column(String(36), ForeignKey("hostel_beds.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2026-2027")
    start_date: Mapped[str] = mapped_column(String(10), nullable=False)
    end_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    bed: Mapped[HostelBed] = relationship("HostelBed", back_populates="allocations")
    student = relationship("User", foreign_keys=[student_id])
