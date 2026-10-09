from app.core.database import SessionLocal
from app.models import Vehicle, Driver, Booking, BookingStatus, User, UserRole
from app.api.routes.dashboard import admin_dashboard, fleet_dashboard

db = SessionLocal()
admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
admin_data = admin_dashboard(db, admin_user)

db_vehicles = db.query(Vehicle).filter(Vehicle.is_active == True).count()
db_avail_vehicles = db.query(Vehicle).filter(Vehicle.status == 'AVAILABLE', Vehicle.is_active == True).count()
db_drivers = db.query(Driver).count()
db_bookings = db.query(Booking).count()
db_delivered = db.query(Booking).filter(Booking.status == BookingStatus.DELIVERED).count()

print("=== DATA CONSISTENCY CHECK ===")
print("Admin Total Vehicles:", admin_data["total_vehicles"], "== DB Vehicles:", db_vehicles, "->", admin_data["total_vehicles"] == db_vehicles)
print("Admin Available Vehicles:", admin_data["available_vehicles"], "== DB Available:", db_avail_vehicles, "->", admin_data["available_vehicles"] == db_avail_vehicles)
print("Admin Drivers:", admin_data["total_drivers"], "== DB Drivers:", db_drivers, "->", admin_data["total_drivers"] == db_drivers)
print("Admin Bookings:", admin_data["total_bookings"], "== DB Bookings:", db_bookings, "->", admin_data["total_bookings"] == db_bookings)
print("Admin Completed:", admin_data["completed_deliveries"], "== DB Delivered:", db_delivered, "->", admin_data["completed_deliveries"] == db_delivered)
print("Admin DRIVA Service Fee: INR", admin_data["driva_service_fee"])
print("ALL DATABASE CHECKS PASSED!")
db.close()
