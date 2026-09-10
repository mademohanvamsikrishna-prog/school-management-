"""Transport models: vehicles, routes, stops, student assignments."""
from typing import List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    registration_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    driver_name: Mapped[str] = mapped_column(String(150), nullable=False)
    driver_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    routes: Mapped[List["TransportRoute"]] = relationship("TransportRoute", back_populates="vehicle")


class TransportRoute(Base, TimestampMixin):
    __tablename__ = "transport_routes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    vehicle_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("vehicles.id"), nullable=True)
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)   # "07:30"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    vehicle: Mapped[Optional[Vehicle]] = relationship("Vehicle", back_populates="routes")
    stops: Mapped[List["RouteStop"]] = relationship("RouteStop", back_populates="route", order_by="RouteStop.stop_order")
    assignments: Mapped[List["StudentTransportAssignment"]] = relationship("StudentTransportAssignment", back_populates="route")


class RouteStop(Base, TimestampMixin):
    __tablename__ = "route_stops"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    route_id: Mapped[str] = mapped_column(String(36), ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False)
    stop_name: Mapped[str] = mapped_column(String(150), nullable=False)
    stop_order: Mapped[int] = mapped_column(Integer, nullable=False)
    arrival_time: Mapped[str] = mapped_column(String(10), nullable=False)   # "07:45"

    route: Mapped[TransportRoute] = relationship("TransportRoute", back_populates="stops")


class StudentTransportAssignment(Base, TimestampMixin):
    __tablename__ = "student_transport_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    route_id: Mapped[str] = mapped_column(String(36), ForeignKey("transport_routes.id", ondelete="CASCADE"), nullable=False)
    pickup_stop_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("route_stops.id"), nullable=True)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2026-2027")

    student = relationship("User", foreign_keys=[student_id])
    route: Mapped[TransportRoute] = relationship("TransportRoute", back_populates="assignments")
    pickup_stop: Mapped[Optional[RouteStop]] = relationship("RouteStop", foreign_keys=[pickup_stop_id])
