"""DRIVA Operational Database Seeder"""
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "backend"))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, BusinessProfile, Provider, ProviderType, Driver,
    Vehicle, FuelType, VehicleStatus, TransportRequest, Priority, RequestStatus,
    Booking, BookingStatus
)

DEMO_PASSWORD = get_password_hash("driva2024")

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Starting DRIVA Operational Database Seeding...")

        # 1. Test Users
        users = [
            ("admin@driva.demo", "Admin", UserRole.ADMIN),
            ("business@driva.demo", "Test Business", UserRole.BUSINESS_OWNER),
            ("fleet@driva.demo", "Test Fleet", UserRole.FLEET_OWNER),
            ("agency@driva.demo", "Test Agency", UserRole.LOGISTICS_AGENCY),
        ]
        
        user_objs = {}
        for email, name, role in users:
            u = db.query(User).filter_by(email=email).first()
            if not u:
                u = User(email=email, name=name, password_hash=DEMO_PASSWORD, role=role, phone=f"+9198765{len(user_objs)}4321")
                db.add(u)
                db.flush()
            user_objs[role] = u

        # 2. Profiles and Providers
        biz = db.query(BusinessProfile).filter_by(user_id=user_objs[UserRole.BUSINESS_OWNER].id).first()
        if not biz:
            biz = BusinessProfile(user_id=user_objs[UserRole.BUSINESS_OWNER].id, business_name="Tech Logistics Corp", city="Bangalore", email="business@driva.demo", phone="+919876504321", industry="Electronics")
            db.add(biz)
            db.flush()

        fleet = db.query(Provider).filter_by(user_id=user_objs[UserRole.FLEET_OWNER].id).first()
        if not fleet:
            fleet = Provider(user_id=user_objs[UserRole.FLEET_OWNER].id, provider_type=ProviderType.FLEET_OWNER, company_name="Salem Transports", city="Salem", email="fleet@driva.demo", phone="+919876514321", provider_rating=4.8)
            db.add(fleet)
            db.flush()

        agency = db.query(Provider).filter_by(user_id=user_objs[UserRole.LOGISTICS_AGENCY].id).first()
        if not agency:
            agency = Provider(user_id=user_objs[UserRole.LOGISTICS_AGENCY].id, provider_type=ProviderType.LOGISTICS_AGENCY, company_name="South Cargo Agency", city="Chennai", email="agency@driva.demo", phone="+919876524321", provider_rating=4.5)
            db.add(agency)
            db.flush()

        # 3. 10 Distinct Drivers
        drivers = [
            ("Ramesh K", "TN34 201800001", 5.0, 4.8, fleet, "Salem", True),
            ("Suresh P", "TN34 201900002", 4.0, 4.5, fleet, "Salem", True),
            ("Mani S", "TN34 202000003", 3.0, 4.2, fleet, "Bangalore", False),
            ("Arun B", "TN34 202100004", 2.0, 4.0, fleet, "Chennai", True),
            ("Karthik M", "TN38 201800005", 6.0, 4.9, fleet, "Coimbatore", True),
            ("Vignesh R", "TN38 201900006", 5.0, 4.7, agency, "Coimbatore", True),
            ("Dinesh V", "TN01 201800007", 7.0, 4.6, agency, "Chennai", False),
            ("Prakash C", "TN01 201900008", 4.0, 4.4, agency, "Chennai", True),
            ("Selvam S", "TN45 202000009", 3.0, 4.1, agency, "Trichy", True),
            ("Murugan K", "TN45 202100010", 2.0, 4.3, agency, "Trichy", True),
        ]
        
        drv_objs = []
        for name, lic, exp, rating, prov, loc, avail in drivers:
            d = db.query(Driver).filter_by(license_number=lic).first()
            if not d:
                d = Driver(provider_id=prov.id, name=name, license_number=lic, experience_years=exp, rating=rating, current_location=loc, is_available=avail, phone=f"+9198765{len(drv_objs)}9999", email=f"{name.lower().replace(' ', '')}@driva.demo")
                db.add(d)
                db.flush()
            drv_objs.append(d)

        # 4. 20 Operational Vehicles
        vehicles = [
            ("TN34 AB 1001", "Tata Ace", FuelType.DIESEL, 750, 4.0, VehicleStatus.AVAILABLE, fleet, drv_objs[0], "Salem"),
            ("TN34 AB 1002", "Mahindra Bolero Pickup", FuelType.DIESEL, 1500, 5.0, VehicleStatus.IN_TRANSIT, fleet, drv_objs[1], "Bangalore"),
            ("TN34 AB 1003", "EV Cargo Van", FuelType.EV, 1000, 4.5, VehicleStatus.MAINTENANCE, fleet, None, "Salem"),
            ("TN34 AB 1004", "Mini Truck", FuelType.DIESEL, 2500, 8.0, VehicleStatus.AVAILABLE, fleet, drv_objs[3], "Chennai"),
            ("TN34 AB 1005", "Tata 407", FuelType.DIESEL, 3000, 12.0, VehicleStatus.OFFLINE, fleet, None, "Coimbatore"),
            ("TN38 CD 2001", "Tata 709", FuelType.DIESEL, 5000, 18.0, VehicleStatus.AVAILABLE, fleet, drv_objs[4], "Coimbatore"),
            ("TN38 CD 2002", "Light Commercial Vehicle", FuelType.DIESEL, 4000, 15.0, VehicleStatus.IN_TRANSIT, fleet, None, "Salem"),
            ("TN38 CD 2003", "Medium Truck", FuelType.DIESEL, 7000, 24.0, VehicleStatus.AVAILABLE, fleet, None, "Chennai"),
            ("TN01 EF 3001", "Heavy Truck", FuelType.DIESEL, 15000, 40.0, VehicleStatus.AVAILABLE, agency, drv_objs[5], "Chennai"),
            ("TN01 EF 3002", "Tata Ace", FuelType.DIESEL, 750, 4.0, VehicleStatus.IN_TRANSIT, agency, drv_objs[6], "Bangalore"),
            ("TN01 EF 3003", "Mahindra Bolero Pickup", FuelType.DIESEL, 1500, 5.0, VehicleStatus.AVAILABLE, agency, drv_objs[7], "Chennai"),
            ("TN01 EF 3004", "EV Cargo Van", FuelType.EV, 1000, 4.5, VehicleStatus.MAINTENANCE, agency, None, "Trichy"),
            ("TN45 GH 4001", "Mini Truck", FuelType.DIESEL, 2500, 8.0, VehicleStatus.AVAILABLE, agency, drv_objs[8], "Trichy"),
            ("TN45 GH 4002", "Tata 407", FuelType.DIESEL, 3000, 12.0, VehicleStatus.OFFLINE, agency, None, "Madurai"),
            ("TN45 GH 4003", "Tata 709", FuelType.DIESEL, 5000, 18.0, VehicleStatus.AVAILABLE, agency, drv_objs[9], "Salem"),
            ("TN45 GH 4004", "Light Commercial Vehicle", FuelType.DIESEL, 4000, 15.0, VehicleStatus.AVAILABLE, agency, None, "Coimbatore"),
            ("KA01 IJ 5001", "Medium Truck", FuelType.DIESEL, 7000, 24.0, VehicleStatus.IN_TRANSIT, fleet, None, "Bangalore"),
            ("KA01 IJ 5002", "Heavy Truck", FuelType.DIESEL, 15000, 40.0, VehicleStatus.AVAILABLE, fleet, None, "Salem"),
            ("KL01 KL 6001", "Tata Ace", FuelType.DIESEL, 750, 4.0, VehicleStatus.AVAILABLE, agency, None, "Coimbatore"),
            ("KL01 KL 6002", "EV Cargo Van", FuelType.EV, 1000, 4.5, VehicleStatus.MAINTENANCE, agency, None, "Chennai"),
        ]

        veh_objs = []
        for reg, vtype, fuel, cap, vol, stat, prov, drv, loc in vehicles:
            v = db.query(Vehicle).filter_by(registration_number=reg).first()
            if not v:
                v = Vehicle(
                    provider_id=prov.id, owner_id=prov.user_id, driver_id=drv.id if drv else None,
                    registration_number=reg, vehicle_number=reg.replace(" ", ""), vehicle_type=vtype, fuel_type=fuel, capacity_kg=cap,
                    volume_m3=vol, capacity_volume_m3=vol, status=stat, availability=stat==VehicleStatus.AVAILABLE,
                    current_location=loc, home_location=loc, is_active=True
                )
                db.add(v)
                db.flush()
                
            veh_objs.append(v)
            if drv and not drv.assigned_vehicle_id:
                drv.assigned_vehicle_id = v.id

        db.commit()
        
        for prov in [fleet, agency]:
            tot = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.is_active == True).count()
            avail = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.status == VehicleStatus.AVAILABLE, Vehicle.is_active == True).count()
            ass = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.status != VehicleStatus.AVAILABLE, Vehicle.is_active == True).count()
            prov.total_vehicles = tot
            prov.available_vehicles = avail
            prov.assigned_vehicles = ass
            
        db.commit()
        print("✅ Operational DB Seeded Successfully!")
        print(f"Total Vehicles: {len(veh_objs)}")
        print(f"Total Drivers: {len(drv_objs)}")
        
    except Exception as e:
        db.rollback()
        print(f"Seed Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
