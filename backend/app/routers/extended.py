"""
Extended module routers: Food Court, Transport, Library, Leave, Hostel, Inventory, HR/Performance, Analytics.
All mounted under /api/v1.
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User
from app.models.foodcourt import FoodCategory, FoodItem, FoodOrder, FoodOrderItem
from app.models.transport import Vehicle, TransportRoute, RouteStop, StudentTransportAssignment
from app.models.library import BookCategory, Book, BookCopy, BookIssue
from app.models.leave import LeaveType, LeaveRequest, StaffTimesheet
from app.models.hostel import Hostel, HostelRoom, HostelBed, BedAllocation
from app.models.inventory import Supplier, InventoryCategory, InventoryItem, StockMovement
from app.models.hr import Department, StaffPerformanceRecord
from app.models.academic import ClassRoom, StudentEnrollment
from app.models.attendance import AttendanceRecord
from app.models.marks import MarkRecord, ExamSubject
from app.models.finance import FeeInvoice

router = APIRouter()


# ===========================================================================
# FOOD COURT (P13)
# ===========================================================================

food_router = APIRouter(prefix="/food", tags=["Food Court"])


class FoodItemOut(BaseModel):
    id: str; name: str; price: float; is_available: bool; is_vegetarian: bool
    category_name: Optional[str] = None
    model_config = {"from_attributes": True}


class FoodOrderItemIn(BaseModel):
    food_item_id: str; quantity: int = Field(ge=1)


class FoodOrderIn(BaseModel):
    items: List[FoodOrderItemIn]
    notes: Optional[str] = None


class FoodOrderOut(BaseModel):
    id: str; status: str; total_amount: float; notes: Optional[str] = None
    model_config = {"from_attributes": True}


@food_router.get("/menu", response_model=List[FoodItemOut], summary="Browse food menu")
def get_menu(
    category_id: Optional[str] = None,
    available_only: bool = True,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(FoodItem)
    if available_only:
        q = q.filter(FoodItem.is_available == True)
    if category_id:
        q = q.filter(FoodItem.category_id == category_id)
    items = q.all()
    return [FoodItemOut(id=i.id, name=i.name, price=i.price, is_available=i.is_available,
                        is_vegetarian=i.is_vegetarian, category_name=i.category.name if i.category else None)
            for i in items]


@food_router.post("/orders", response_model=FoodOrderOut, status_code=201, summary="Place food order")
def place_order(
    payload: FoodOrderIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = 0.0
    order_items = []
    for item_in in payload.items:
        food_item = db.query(FoodItem).filter(FoodItem.id == item_in.food_item_id).first()
        if not food_item:
            raise HTTPException(status_code=404, detail=f"Food item {item_in.food_item_id} not found.")
        if not food_item.is_available:
            raise HTTPException(status_code=400, detail=f"'{food_item.name}' is currently unavailable.")
        line_total = food_item.price * item_in.quantity
        total += line_total
        order_items.append(FoodOrderItem(food_item_id=food_item.id, quantity=item_in.quantity, unit_price=food_item.price))

    order = FoodOrder(user_id=current_user.id, total_amount=round(total, 2), notes=payload.notes, order_items=order_items)
    db.add(order)
    db.commit()
    db.refresh(order)
    return FoodOrderOut(id=order.id, status=order.status, total_amount=order.total_amount, notes=order.notes)


@food_router.get("/orders/mine", response_model=List[FoodOrderOut], summary="My orders")
def my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = db.query(FoodOrder).filter(FoodOrder.user_id == current_user.id).order_by(FoodOrder.created_at.desc()).limit(20).all()
    return [FoodOrderOut(id=o.id, status=o.status, total_amount=o.total_amount, notes=o.notes) for o in orders]


@food_router.patch("/orders/{order_id}/status", summary="Update order status (admin/staff)")
def update_order_status(
    order_id: str,
    new_status: str = Query(..., pattern="^(confirmed|preparing|ready|delivered|cancelled)$"),
    _: User = Depends(require_permission("events:manage")),  # reuse admin perm
    db: Session = Depends(get_db),
):
    order = db.query(FoodOrder).filter(FoodOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    order.status = new_status
    db.commit()
    return {"id": order_id, "status": new_status}


# ===========================================================================
# TRANSPORT (P14)
# ===========================================================================

transport_router = APIRouter(prefix="/transport", tags=["Transport"])


class RouteOut(BaseModel):
    id: str; name: str; start_time: str; is_active: bool
    vehicle_reg: Optional[str] = None
    stop_count: int = 0


class StopOut(BaseModel):
    id: str; stop_name: str; stop_order: int; arrival_time: str
    model_config = {"from_attributes": True}


@transport_router.get("/routes", response_model=List[RouteOut], summary="List transport routes")
def list_routes(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routes = db.query(TransportRoute).filter(TransportRoute.is_active == True).all()
    return [RouteOut(id=r.id, name=r.name, start_time=r.start_time, is_active=r.is_active,
                     vehicle_reg=r.vehicle.registration_number if r.vehicle else None,
                     stop_count=len(r.stops)) for r in routes]


@transport_router.get("/routes/{route_id}/stops", response_model=List[StopOut], summary="Route stops")
def route_stops(
    route_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")
    return route.stops


@transport_router.get("/my-assignment", summary="My transport assignment")
def my_assignment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = (
        db.query(StudentTransportAssignment)
        .filter(StudentTransportAssignment.student_id == current_user.id)
        .order_by(StudentTransportAssignment.created_at.desc())
        .first()
    )
    if not assignment:
        return {"assigned": False}
    return {
        "assigned": True,
        "route_id": assignment.route_id,
        "route_name": assignment.route.name if assignment.route else None,
        "pickup_stop": assignment.pickup_stop.stop_name if assignment.pickup_stop else None,
        "academic_year": assignment.academic_year,
    }


# ===========================================================================
# LIBRARY (P15)
# ===========================================================================

library_router = APIRouter(prefix="/library", tags=["Library"])


class BookOut(BaseModel):
    id: str; title: str; author: str; isbn: Optional[str] = None
    available_copies: int = 0; total_copies: int = 0
    category_name: Optional[str] = None
    model_config = {"from_attributes": True}


class IssueOut(BaseModel):
    id: str; copy_id: str; book_title: str; issued_date: str
    due_date: str; returned_date: Optional[str] = None
    status: str; fine_amount: float


@library_router.get("/books", response_model=List[BookOut], summary="Browse books")
def list_books(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = None,
    available_only: bool = False,
    limit: int = Query(30, ge=1, le=100),
    offset: int = 0,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Book)
    if search:
        q = q.filter(Book.title.ilike(f"%{search}%") | Book.author.ilike(f"%{search}%"))
    if category_id:
        q = q.filter(Book.category_id == category_id)
    books = q.offset(offset).limit(limit).all()
    result = []
    for b in books:
        available = sum(1 for c in b.copies if c.is_available)
        if available_only and available == 0:
            continue
        result.append(BookOut(id=b.id, title=b.title, author=b.author, isbn=b.isbn,
                               available_copies=available, total_copies=b.total_copies,
                               category_name=b.category.name if b.category else None))
    return result


@library_router.get("/issues/mine", response_model=List[IssueOut], summary="My issued books")
def my_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issues = db.query(BookIssue).filter(BookIssue.user_id == current_user.id).order_by(BookIssue.issued_date.desc()).all()
    return [IssueOut(id=i.id, copy_id=i.copy_id,
                     book_title=i.copy.book.title if i.copy and i.copy.book else "",
                     issued_date=i.issued_date, due_date=i.due_date,
                     returned_date=i.returned_date, status=i.status, fine_amount=i.fine_amount)
            for i in issues]


@library_router.post("/issues", status_code=201, summary="Issue book (librarian)")
def issue_book(
    copy_id: str,
    user_id: str,
    due_date: str,
    _: User = Depends(require_permission("events:manage")),
    db: Session = Depends(get_db),
):
    copy = db.query(BookCopy).filter(BookCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found.")
    if not copy.is_available:
        raise HTTPException(status_code=400, detail="Copy is not available.")
    issue = BookIssue(copy_id=copy_id, user_id=user_id,
                      issued_date=date.today().isoformat(), due_date=due_date, status="issued")
    copy.is_available = False
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return {"id": issue.id, "issued": True}


@library_router.post("/issues/{issue_id}/return", summary="Return book (librarian)")
def return_book(
    issue_id: str,
    _: User = Depends(require_permission("events:manage")),
    db: Session = Depends(get_db),
):
    issue = db.query(BookIssue).filter(BookIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue record not found.")
    today = date.today().isoformat()
    issue.returned_date = today
    issue.status = "returned"
    if today > issue.due_date:
        import math
        days_late = (date.fromisoformat(today) - date.fromisoformat(issue.due_date)).days
        issue.fine_amount = days_late * 2.0  # ₹2 per day
    if issue.copy:
        issue.copy.is_available = True
    db.commit()
    return {"returned": True, "fine_amount": issue.fine_amount}


# ===========================================================================
# LEAVE (P16)
# ===========================================================================

leave_router = APIRouter(prefix="/leave", tags=["Leave & Timesheet"])


class LeaveRequestIn(BaseModel):
    leave_type_id: str
    start_date: str
    end_date: str
    days_count: float
    reason: str


class LeaveRequestOut(BaseModel):
    id: str; leave_type_name: str; start_date: str; end_date: str
    days_count: float; status: str; reason: str
    model_config = {"from_attributes": True}


@leave_router.get("/types", summary="Leave types")
def leave_types(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return [{"id": t.id, "name": t.name, "max_days": t.max_days_per_year, "is_paid": t.is_paid}
            for t in db.query(LeaveType).all()]


@leave_router.post("/requests", status_code=201, summary="Apply for leave")
def apply_leave(
    payload: LeaveRequestIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    leave_type = db.query(LeaveType).filter(LeaveType.id == payload.leave_type_id).first()
    if not leave_type:
        raise HTTPException(status_code=404, detail="Leave type not found.")
    req = LeaveRequest(
        user_id=current_user.id,
        leave_type_id=payload.leave_type_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        days_count=payload.days_count,
        reason=payload.reason,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return {"id": req.id, "status": req.status}


@leave_router.get("/requests/mine", summary="My leave requests")
def my_leave_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reqs = db.query(LeaveRequest).filter(LeaveRequest.user_id == current_user.id).order_by(LeaveRequest.created_at.desc()).all()
    return [{"id": r.id, "type": r.leave_type.name if r.leave_type else "", "start": r.start_date,
             "end": r.end_date, "days": r.days_count, "status": r.status} for r in reqs]


@leave_router.patch("/requests/{request_id}/approve", summary="Approve leave (admin/HOD)")
def approve_leave(
    request_id: str,
    _: User = Depends(require_permission("users:manage")),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found.")
    req.status = "approved"
    req.approved_by_id = current_user.id
    db.commit()
    return {"approved": True}


@leave_router.patch("/requests/{request_id}/reject", summary="Reject leave (admin/HOD)")
def reject_leave(
    request_id: str,
    reason: str = Query(...),
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
):
    req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found.")
    req.status = "rejected"
    req.rejection_reason = reason
    db.commit()
    return {"rejected": True}


# ===========================================================================
# HOSTEL (P18)
# ===========================================================================

hostel_router = APIRouter(prefix="/hostel", tags=["Hostel"])


@hostel_router.get("/hostels", summary="List hostels")
def list_hostels(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    hostels = db.query(Hostel).all()
    return [{"id": h.id, "name": h.name, "type": h.type, "total_capacity": h.total_capacity} for h in hostels]


@hostel_router.get("/hostels/{hostel_id}/rooms", summary="Rooms in hostel")
def hostel_rooms(
    hostel_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rooms = db.query(HostelRoom).filter(HostelRoom.hostel_id == hostel_id).all()
    return [{"id": r.id, "room_number": r.room_number, "floor": r.floor,
             "capacity": r.capacity, "available_beds": sum(1 for b in r.beds if not b.is_occupied)}
            for r in rooms]


@hostel_router.get("/my-allocation", summary="My hostel allocation")
def my_allocation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allocation = (
        db.query(BedAllocation)
        .filter(BedAllocation.student_id == current_user.id, BedAllocation.is_active == True)
        .first()
    )
    if not allocation:
        return {"allocated": False}
    bed = allocation.bed
    room = bed.room if bed else None
    hostel = room.hostel if room else None
    return {
        "allocated": True,
        "hostel_name": hostel.name if hostel else None,
        "room_number": room.room_number if room else None,
        "bed_number": bed.bed_number if bed else None,
        "start_date": allocation.start_date,
    }


# ===========================================================================
# INVENTORY (P19)
# ===========================================================================

inventory_router = APIRouter(prefix="/inventory", tags=["Inventory"])


@inventory_router.get("/items", summary="List inventory items")
def list_inventory(
    low_stock_only: bool = False,
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
):
    q = db.query(InventoryItem)
    items = q.all()
    result = []
    for item in items:
        is_low = item.current_stock <= item.minimum_stock
        if low_stock_only and not is_low:
            continue
        result.append({
            "id": item.id, "name": item.name, "unit": item.unit,
            "current_stock": item.current_stock, "minimum_stock": item.minimum_stock,
            "is_low_stock": is_low, "category": item.category.name if item.category else None,
        })
    return result


@inventory_router.post("/items/{item_id}/movement", status_code=201, summary="Record stock movement")
def record_movement(
    item_id: str,
    movement_type: str = Query(..., pattern="^(in|out|adjustment)$"),
    quantity: float = Query(..., gt=0),
    reference: Optional[str] = None,
    _: User = Depends(require_permission("users:manage")),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    if movement_type == "out" and item.current_stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock.")

    if movement_type == "in":
        item.current_stock += quantity
    elif movement_type == "out":
        item.current_stock -= quantity
    else:
        item.current_stock = quantity

    movement = StockMovement(item_id=item_id, movement_type=movement_type,
                              quantity=quantity, reference=reference, recorded_by_id=current_user.id)
    db.add(movement)
    db.commit()
    return {"recorded": True, "new_stock": item.current_stock}


# ===========================================================================
# HR / PERFORMANCE (P20)
# ===========================================================================

hr_router = APIRouter(prefix="/hr", tags=["HR & Performance"])


@hr_router.get("/departments", summary="List departments")
def list_departments(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deps = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "head": d.head.name if d.head else None} for d in deps]


@hr_router.get("/performance/mine", summary="My performance records")
def my_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(StaffPerformanceRecord)
        .filter(StaffPerformanceRecord.staff_id == current_user.id)
        .order_by(StaffPerformanceRecord.review_period.desc())
        .all()
    )
    return [{"id": r.id, "period": r.review_period, "overall": r.overall_score,
             "teaching": r.teaching_score, "punctuality": r.punctuality_score,
             "status": r.status} for r in records]


@hr_router.post("/performance", status_code=201, summary="Submit performance review (admin)")
def submit_performance(
    staff_id: str,
    review_period: str,
    teaching_score: Optional[float] = None,
    punctuality_score: Optional[float] = None,
    communication_score: Optional[float] = None,
    comments: Optional[str] = None,
    _: User = Depends(require_permission("users:manage")),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores = [s for s in [teaching_score, punctuality_score, communication_score] if s is not None]
    overall = round(sum(scores) / len(scores), 2) if scores else None
    record = StaffPerformanceRecord(
        staff_id=staff_id, reviewer_id=current_user.id, review_period=review_period,
        teaching_score=teaching_score, punctuality_score=punctuality_score,
        communication_score=communication_score, overall_score=overall,
        comments=comments, status="submitted",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "overall_score": overall}


# ===========================================================================
# ANALYTICS (P21)
# ===========================================================================

analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])


@analytics_router.get("/overview", summary="School-wide analytics overview")
def analytics_overview(
    _: User = Depends(require_permission("users:read")),
    db: Session = Depends(get_db),
):
    from app.models.user import User as UserModel, Role
    total_students = db.query(UserModel).join(Role).filter(Role.name == "student", UserModel.is_active == True).count()
    total_teachers = db.query(UserModel).join(Role).filter(Role.name == "teacher", UserModel.is_active == True).count()
    total_parents = db.query(UserModel).join(Role).filter(Role.name == "parent", UserModel.is_active == True).count()
    total_classes = db.query(ClassRoom).count()

    # Attendance stats (last 30 days)
    from app.models.attendance import AttendanceRecord
    total_att = db.query(AttendanceRecord).count()
    present_att = db.query(AttendanceRecord).filter(AttendanceRecord.status == "present").count()
    overall_att_pct = round((present_att / total_att * 100), 1) if total_att else 0

    # Finance stats
    from app.models.finance import FeeInvoice
    total_invoiced = db.query(func.sum(FeeInvoice.amount)).scalar() or 0
    total_paid = db.query(func.sum(FeeInvoice.amount)).filter(FeeInvoice.status == "paid").scalar() or 0
    total_pending = db.query(func.sum(FeeInvoice.amount)).filter(FeeInvoice.status == "pending").scalar() or 0

    return {
        "enrollment": {
            "students": total_students,
            "teachers": total_teachers,
            "parents": total_parents,
            "classes": total_classes,
        },
        "attendance": {
            "total_records": total_att,
            "present_records": present_att,
            "overall_percentage": overall_att_pct,
        },
        "finance": {
            "total_invoiced": round(total_invoiced, 2),
            "total_collected": round(total_paid, 2),
            "total_outstanding": round(total_pending, 2),
            "collection_rate": round((total_paid / total_invoiced * 100), 1) if total_invoiced else 0,
        },
    }


@analytics_router.get("/attendance/class/{class_id}", summary="Class attendance analytics")
def class_attendance_analytics(
    class_id: str,
    _: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
):
    from app.models.attendance import AttendanceRecord
    enrollments = db.query(StudentEnrollment).filter(StudentEnrollment.class_id == class_id).all()
    student_ids = [e.student_id for e in enrollments]

    results = []
    for sid in student_ids:
        enrollment = next((e for e in enrollments if e.student_id == sid), None)
        records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == sid).all()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        pct = round((present / total * 100), 1) if total else 0
        results.append({
            "student_id": sid,
            "student_name": enrollment.student.name if enrollment and enrollment.student else "",
            "total_days": total, "present_days": present, "percentage": pct,
        })
    return {"class_id": class_id, "students": results}


# ===========================================================================
# Register all sub-routers
# ===========================================================================

router.include_router(food_router)
router.include_router(transport_router)
router.include_router(library_router)
router.include_router(leave_router)
router.include_router(hostel_router)
router.include_router(inventory_router)
router.include_router(hr_router)
router.include_router(analytics_router)
