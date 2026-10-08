"""
DRIVA Database Seed
====================
Creates demo users, providers, vehicles, drivers, and a sample booking.
Run after migrations: python database/seed/seed.py

Demo credentials:
  business@driva.demo / driva2024
  fleet@driva.demo    / driva2024
  agency@driva.demo   / driva2024
  driver@driva.demo   / driva2024
  admin@driva.demo    / driva2024
"""

import sys
from pathlib import Path
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Allow imports from backend/
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend"))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, Provider, Driver, Vehicle, FuelType, VehicleStatus,
    TransportRequest, Priority, RequestStatus
)

DEMO_PASSWORD = get_password_hash("driva2024")


def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Demo Users ──────────────────────────────────────────────────
        def upsert_user(email, name, phone, role):
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, name=name, phone=phone, password_hash=DEMO_PASSWORD, role=role)
                db.add(u)
                db.flush()
                print(f"  Created user: {email}")
            return u

        business1 = upsert_user("business@driva.demo", "Rajan Kumar (Salem Electronics)", "+91-9876543210", UserRole.BUSINESS_OWNER)
        business2 = upsert_user("kongu@driva.demo", "Murugan M (Kongu Manufacturing)", "+91-9876543211", UserRole.BUSINESS_OWNER)
        fleet_user = upsert_user("fleet@driva.demo", "Selvam Raj (Fleet Owner)", "+91-9876543212", UserRole.FLEET_OWNER)
        agency_user = upsert_user("agency@driva.demo", "Priya S (Agency Manager)", "+91-9876543213", UserRole.LOGISTICS_AGENCY)
        driver_user = upsert_user("driver@driva.demo", "Karthik V", "+91-9876543214", UserRole.DRIVER)
        admin_user = upsert_user("admin@driva.demo", "DRIVA Admin", "+91-9876543215", UserRole.ADMIN)
        db.commit()

        # ── Providers ───────────────────────────────────────────────────
        def upsert_provider(user_id, company_name, service_areas, rating, reliability):
            p = db.query(Provider).filter(Provider.user_id == user_id).first()
            if not p:
                p = Provider(
                    user_id=user_id,
                    company_name=company_name,
                    service_areas=service_areas,
                    provider_rating=rating,
                    reliability_score=reliability,
                    completed_deliveries=0,
                    total_vehicles=0,
                )
                db.add(p)
                db.flush()
                print(f"  Created provider: {company_name}")
            return p

        provider_fleet = upsert_provider(
            fleet_user.id, "ABC Logistics",
            "Salem,Bangalore,Chennai,Coimbatore,Madurai",
            4.7, 94.0
        )
        provider_agency = upsert_provider(
            agency_user.id, "SouthLine Transport",
            "Chennai,Coimbatore,Salem,Trichy",
            4.3, 89.0
        )

        # Extra seed providers (standalone — no login required for demo)
        extra_users = [
            ("rapidmove@driva.demo", "RapidMove Logistics Manager", UserRole.LOGISTICS_AGENCY,
             "RapidMove Logistics", "Bangalore,Chennai,Coimbatore", 4.5, 91.0),
            ("greenroute@driva.demo", "GreenRoute Manager", UserRole.FLEET_OWNER,
             "GreenRoute Mobility", "Salem,Coimbatore,Madurai", 4.1, 87.0),
        ]
        extra_providers = []
        for email, name, role, company, areas, rating, rel in extra_users:
            u = upsert_user(email, name, "+91-9000000001", role)
            p = upsert_provider(u.id, company, areas, rating, rel)
            extra_providers.append(p)

        db.commit()

        # ── Driver ──────────────────────────────────────────────────────
        drv = db.query(Driver).filter(Driver.user_id == driver_user.id).first()
        if not drv:
            drv = Driver(
                user_id=driver_user.id,
                license_number="TN32AB1234",
                experience_years=7.0,
                is_available=True,
                current_location="Salem",
                rating=4.6,
            )
            db.add(drv)
            db.flush()
            print("  Created driver: Karthik V")
        db.commit()

        # ── Vehicles ────────────────────────────────────────────────────
        vehicle_specs = [
            # ABC Logistics vehicles
            ("TN33AB1001", "Tata Ace",       FuelType.DIESEL, 750,  8.0,  2.0,  1.2,  "Salem",     provider_fleet.id,   fleet_user.id),
            ("TN33AB1002", "Bolero Pickup",  FuelType.DIESEL, 1000, 10.0, 3.0,  1.0,  "Salem",     provider_fleet.id,   fleet_user.id),
            ("TN33AB1003", "Mini Truck",     FuelType.DIESEL, 2500, 25.0, 5.0,  0.9,  "Chennai",   provider_fleet.id,   fleet_user.id),
            ("TN33AB1004", "EV Cargo Van",   FuelType.EV,     800,  8.0,  1.0,  1.5,  "Bangalore", provider_fleet.id,   fleet_user.id),
            # SouthLine Transport
            ("TN07CD2001", "Mini Truck",     FuelType.DIESEL, 2500, 25.0, 4.0,  0.95, "Chennai",   provider_agency.id,  agency_user.id),
            ("TN07CD2002", "Heavy Truck",    FuelType.DIESEL, 15000,150.0,8.0,  0.6,  "Chennai",   provider_agency.id,  agency_user.id),
            # RapidMove
            ("KA01EF3001", "Bolero Pickup",  FuelType.DIESEL, 1000, 10.0, 2.0,  1.0,  "Bangalore", extra_providers[0].id, extra_providers[0].user_id),
            ("KA01EF3002", "Medium Truck",   FuelType.DIESEL, 5000, 50.0, 6.0,  0.8,  "Bangalore", extra_providers[0].id, extra_providers[0].user_id),
            # GreenRoute
            ("TN38GH4001", "EV Cargo Van",   FuelType.EV,     800,  8.0,  1.5,  1.5,  "Coimbatore",extra_providers[1].id, extra_providers[1].user_id),
            ("TN38GH4002", "Tata Ace",       FuelType.DIESEL, 750,  8.0,  3.0,  1.1,  "Salem",     extra_providers[1].id, extra_providers[1].user_id),
        ]

        for vnum, vtype, fuel, cap_kg, cap_vol, age, eff, loc, prov_id, owner_id in vehicle_specs:
            exists = db.query(Vehicle).filter(Vehicle.vehicle_number == vnum).first()
            if not exists:
                v = Vehicle(
                    vehicle_number=vnum,
                    vehicle_type=vtype,
                    fuel_type=fuel,
                    capacity_kg=cap_kg,
                    capacity_volume_m3=cap_vol,
                    vehicle_age_years=age,
                    efficiency=eff,
                    current_location=loc,
                    status=VehicleStatus.AVAILABLE,
                    provider_id=prov_id,
                    owner_id=owner_id,
                )
                db.add(v)
                print(f"  Created vehicle: {vnum} ({vtype})")

        db.commit()

        # Update provider vehicle counts
        for p in [provider_fleet, provider_agency] + extra_providers:
            count = db.query(Vehicle).filter(Vehicle.provider_id == p.id, Vehicle.is_active == True).count()
            p.total_vehicles = count
        db.commit()

        print("\n✅ Seed complete!")
        print("\nDemo credentials (password: driva2024):")
        print("  business@driva.demo — Business Owner")
        print("  fleet@driva.demo    — Fleet Owner (ABC Logistics)")
        print("  agency@driva.demo   — Agency (SouthLine Transport)")
        print("  driver@driva.demo   — Driver")
        print("  admin@driva.demo    — Admin")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
