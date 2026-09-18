from app.db.base import Base
from app.models.user import (
    Permission,
    Role,
    User,
    StudentProfile,
    TeacherProfile,
    ParentProfile,
    role_permissions,
    parent_students,
)
from app.models.academic import (
    ClassRoom,
    Subject,
    ClassSubject,
    StudentEnrollment,
)
from app.models.attendance import AttendanceRecord
from app.models.timetable import TimetableEntry
from app.models.marks import Exam, ExamSubject, MarkRecord
from app.models.communication import (
    Event,
    Notification,
    Conversation,
    Message,
    conversation_participants,
)
from app.models.finance import FeeCategory, FeeInvoice, PaymentRecord
from app.models.refresh_token import RefreshToken
# Extended modules (P13–P20)
from app.models.foodcourt import FoodCategory, FoodItem, FoodOrder, FoodOrderItem
from app.models.transport import Vehicle, TransportRoute, RouteStop, StudentTransportAssignment
from app.models.library import BookCategory, Book, BookCopy, BookIssue
from app.models.leave import LeaveType, LeaveRequest, StaffTimesheet
from app.models.files import FileRecord
from app.models.hostel import Hostel, HostelRoom, HostelBed, BedAllocation
from app.models.inventory import Supplier, InventoryCategory, InventoryItem, StockMovement
from app.models.hr import Department, StaffPerformanceRecord
# Student Dashboard CRUD modules
from app.models.dashboard_modules import StudentAssignment, Notice, StudentLeave


__all__ = [
    "Base",
    "Permission",
    "Role",
    "User",
    "StudentProfile",
    "TeacherProfile",
    "ParentProfile",
    "role_permissions",
    "parent_students",
    "ClassRoom",
    "Subject",
    "ClassSubject",
    "StudentEnrollment",
    "AttendanceRecord",
    "TimetableEntry",
    "Exam",
    "ExamSubject",
    "MarkRecord",
    "Event",
    "Notification",
    "Conversation",
    "Message",
    "conversation_participants",
    "FeeCategory",
    "FeeInvoice",
    "PaymentRecord",
    "RefreshToken",
    # Student Dashboard CRUD
    "StudentAssignment",
    "Notice",
    "StudentLeave",
]

