"""
DRIVA Database Seed
===================
Creates comprehensive, realistic, and interconnected demo records in PostgreSQL.
Idempotent: Safe to run multiple times without duplicating records.

Demo Credentials (all accounts use password: driva2024):
  business@driva.demo        — Business Owner (Salem Electronics)
  kovai@driva.demo           — Business Owner (Kovai Retail Distribution)
  fleet@driva.demo           — Fleet Owner (Salem Transport Solutions)
  coimbatore_fleet@driva.demo— Fleet Owner (Coimbatore Fleet Services)
  agency@driva.demo          — Logistics Agency (SouthLine Logistics)
  primeroute@driva.demo      — Logistics Agency (PrimeRoute Transport)
  driver@driva.demo          — Commercial Driver (Arun Kumar)
  driver2@driva.demo         — Commercial Driver (Karthik V)
  admin@driva.demo           — Platform Admin
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure app imports work from backend/
backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, BusinessProfile, Provider, ProviderType, Driver,
    Vehicle, FuelType, VehicleStatus, TransportRequest, Priority, RequestStatus,
    Booking, BookingStatus, TrackingUpdate, Rating, VehicleAssignment, Notification
)

DEMO_PASSWORD = get_password_hash("driva2024")


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[DRIVA SEED] Starting idempotent database population...")

        # ── 1. Users ─────────────────────────────────────────────────────────
        users_meta = [
            ("business@driva.demo", "Rajan Kumar", "+91-9842711001", UserRole.BUSINESS_OWNER),
            ("kovai@driva.demo", "Kavitha S", "+91-9842711002", UserRole.BUSINESS_OWNER),
            ("chennai_auto@driva.demo", "Venkatesh R", "+91-9842711003", UserRole.BUSINESS_OWNER),
            ("bangalore_goods@driva.demo", "Deepa N", "+91-9842711004", UserRole.BUSINESS_OWNER),
            ("fleet@driva.demo", "Selvam Raj", "+91-9842722001", UserRole.FLEET_OWNER),
            ("coimbatore_fleet@driva.demo", "Karthikeyan K", "+91-9842722002", UserRole.FLEET_OWNER),
            ("south_cargo@driva.demo", "Ramesh P", "+91-9842722003", UserRole.FLEET_OWNER),
            ("rapidmove@driva.demo", "Manoj T", "+91-9842722004", UserRole.FLEET_OWNER),
            ("agency@driva.demo", "Priya S", "+91-9842733001", UserRole.LOGISTICS_AGENCY),
            ("primeroute@driva.demo", "Sanjay Verma", "+91-9842733002", UserRole.LOGISTICS_AGENCY),
            ("tn_cargo@driva.demo", "Anandhi G", "+91-9842733003", UserRole.LOGISTICS_AGENCY),
            ("driver@driva.demo", "Arun Kumar", "+91-9842744001", UserRole.DRIVER),
            ("driver2@driva.demo", "Karthik V", "+91-9842744002", UserRole.DRIVER),
            ("driver3@driva.demo", "Suresh Raman", "+91-9842744003", UserRole.DRIVER),
            ("driver4@driva.demo", "Vigneshwaran S", "+91-9842744004", UserRole.DRIVER),
            ("driver5@driva.demo", "Rajesh Kannan", "+91-9842744005", UserRole.DRIVER),
            ("driver6@driva.demo", "Murugan P", "+91-9842744006", UserRole.DRIVER),
            ("driver7@driva.demo", "Anand Babu", "+91-9842744007", UserRole.DRIVER),
            ("driver8@driva.demo", "Prakash M", "+91-9842744008", UserRole.DRIVER),
            ("admin@driva.demo", "DRIVA Admin", "+91-9842799999", UserRole.ADMIN),
        ]

        users_by_email = {}
        for email, name, phone, role in users_meta:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, name=name, phone=phone, password_hash=DEMO_PASSWORD, role=role)
                db.add(u)
                db.flush()
                print(f"  Created user: {email} ({role.value})")
            else:
                u.name = name
                u.phone = phone
                u.role = role
                db.flush()
            users_by_email[email] = u
        db.commit()

        # ── 2. Business Profiles ─────────────────────────────────────────────
        biz_data = [
            ("business@driva.demo", "Salem Electronics", "Rajan Kumar", "Salem", "Consumer Electronics", 14, 2, 12, 68400.0),
            ("kovai@driva.demo", "Kovai Retail Distribution", "Kavitha S", "Coimbatore", "Retail & FMCG", 9, 1, 8, 42100.0),
            ("chennai_auto@driva.demo", "Chennai Auto Components", "Venkatesh R", "Chennai", "Automotive Parts", 18, 3, 15, 124500.0),
            ("bangalore_goods@driva.demo", "Bangalore Consumer Goods", "Deepa N", "Bangalore", "E-Commerce", 11, 2, 9, 54200.0),
        ]

        for email, bname, contact, city, industry, reqs, active, done, spend in biz_data:
            u = users_by_email[email]
            bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == u.id).first()
            if not bp:
                bp = BusinessProfile(
                    user_id=u.id, business_name=bname, contact_person=contact, email=email,
                    phone=u.phone, city=city, industry=industry, total_requests=reqs,
                    active_shipments=active, completed_shipments=done, total_spend=spend
                )
                db.add(bp)
                print(f"  Created business profile: {bname}")
            else:
                bp.business_name = bname
                bp.total_spend = spend
                bp.total_requests = reqs
                bp.completed_shipments = done
        db.commit()

        # ── 3. Fleet Owners & Logistics Agencies (Providers) ─────────────────
        provider_data = [
            # Fleet Owners
            ("fleet@driva.demo", ProviderType.FLEET_OWNER, "Salem Transport Solutions", "Selvam Raj", "Salem", "Salem,Bangalore,Chennai,Coimbatore", 4.8, 94.5, 98.2, 5, 4, 1),
            ("coimbatore_fleet@driva.demo", ProviderType.FLEET_OWNER, "Coimbatore Fleet Services", "Karthikeyan K", "Coimbatore", "Coimbatore,Salem,Madurai,Bangalore", 4.7, 92.0, 96.5, 4, 3, 1),
            ("south_cargo@driva.demo", ProviderType.FLEET_OWNER, "South India Cargo Movers", "Ramesh P", "Madurai", "Madurai,Trichy,Chennai,Salem", 4.6, 91.0, 95.0, 3, 3, 0),
            ("rapidmove@driva.demo", ProviderType.FLEET_OWNER, "RapidMove Logistics", "Manoj T", "Bangalore", "Bangalore,Salem,Chennai,Coimbatore", 4.8, 95.0, 97.8, 2, 2, 0),
            # Logistics Agencies
            ("agency@driva.demo", ProviderType.LOGISTICS_AGENCY, "SouthLine Logistics", "Priya S", "Chennai", "Chennai,Coimbatore,Salem,Bangalore,Trichy", 4.8, 93.5, 96.0, 0, 0, 0),
            ("primeroute@driva.demo", ProviderType.LOGISTICS_AGENCY, "PrimeRoute Transport", "Sanjay Verma", "Bangalore", "Bangalore,Chennai,Coimbatore,Salem", 4.7, 91.5, 94.5, 0, 0, 0),
            ("tn_cargo@driva.demo", ProviderType.LOGISTICS_AGENCY, "Tamil Nadu Cargo Network", "Anandhi G", "Salem", "Salem,Chennai,Madurai,Trichy", 4.6, 90.0, 93.0, 0, 0, 0),
        ]

        providers_by_name = {}
        for email, ptype, cname, owner, city, areas, rating, rel, succ, tot_v, avail_v, ass_v in provider_data:
            u = users_by_email[email]
            p = db.query(Provider).filter(Provider.user_id == u.id).first()
            if not p:
                p = Provider(
                    user_id=u.id, provider_type=ptype, company_name=cname, owner_name=owner,
                    contact_person=owner, email=email, phone=u.phone, city=city,
                    service_areas=areas, provider_rating=rating, reliability_score=rel,
                    success_rate=succ, total_vehicles=tot_v, available_vehicles=avail_v,
                    assigned_vehicles=ass_v, completed_deliveries=142 if ptype == ProviderType.FLEET_OWNER else 320,
                    verification_status="VERIFIED"
                )
                db.add(p)
                db.flush()
                print(f"  Created provider: {cname} ({ptype.value})")
            else:
                p.company_name = cname
                p.provider_type = ptype
                p.owner_name = owner
                p.city = city
                p.provider_rating = rating
                p.reliability_score = rel
                p.success_rate = succ
            providers_by_name[cname] = p
        db.commit()

        # ── 4. Drivers ───────────────────────────────────────────────────────
        drivers_meta = [
            ("driver@driva.demo", "Salem Transport Solutions", "Arun Kumar", "TN34 20180001234", "Commercial LMV", 6.0, 4.8, 182, 177, True, "Salem"),
            ("driver2@driva.demo", "Salem Transport Solutions", "Karthik V", "TN34 20190005678", "Commercial HMV", 5.0, 4.7, 145, 140, True, "Bangalore"),
            ("driver3@driva.demo", "Salem Transport Solutions", "Suresh Raman", "TN34 20160009012", "Commercial HMV", 8.0, 4.9, 260, 254, True, "Chennai"),
            ("driver4@driva.demo", "Coimbatore Fleet Services", "Vigneshwaran S", "TN38 20200003456", "Commercial LMV", 4.0, 4.6, 98, 95, True, "Coimbatore"),
            ("driver5@driva.demo", "Coimbatore Fleet Services", "Rajesh Kannan", "TN38 20170007890", "Commercial HMV", 7.0, 4.8, 210, 205, True, "Salem"),
            ("driver6@driva.demo", "South India Cargo Movers", "Murugan P", "TN58 20190002345", "Commercial HMV", 5.5, 4.7, 164, 158, True, "Madurai"),
            ("driver7@driva.demo", "RapidMove Logistics", "Anand Babu", "KA01 20210006789", "Commercial LMV", 3.5, 4.5, 82, 79, False, "Bangalore"),
            ("driver8@driva.demo", "Salem Transport Solutions", "Prakash M", "TN34 20150001122", "Commercial HMV", 9.0, 4.9, 310, 304, False, "Chennai"),
            (None, "Coimbatore Fleet Services", "Selvakumar R", "TN38 20200004455", "Commercial LMV", 4.5, 4.6, 112, 108, True, "Coimbatore"),
            (None, "RapidMove Logistics", "Dinesh Kumar", "KA01 20180007788", "Commercial HMV", 6.0, 4.7, 175, 169, True, "Salem"),
        ]

        drivers_by_name = {}
        for u_email, prov_name, dname, lic, ltype, exp, rating, tot, succ, avail, loc in drivers_meta:
            d_user = users_by_email[u_email] if u_email else None
            prov = providers_by_name[prov_name]
            drv = db.query(Driver).filter(Driver.license_number == lic).first()
            if not drv:
                drv = Driver(
                    user_id=d_user.id if d_user else None,
                    provider_id=prov.id,
                    name=dname,
                    phone=d_user.phone if d_user else f"+91-98427{len(drivers_by_name)+50:05d}",
                    email=u_email if u_email else f"{dname.lower().replace(' ', '.')}@driva.demo",
                    license_number=lic,
                    license_type=ltype,
                    experience_years=exp,
                    rating=rating,
                    total_deliveries=tot,
                    successful_deliveries=succ,
                    completed_trips=succ,
                    is_available=avail,
                    current_location=loc,
                )
                db.add(drv)
                db.flush()
                print(f"  Created driver: {dname} ({prov_name})")
            else:
                drv.name = dname
                drv.provider_id = prov.id
                drv.rating = rating
                drv.is_available = avail
                drv.current_location = loc
            drivers_by_name[dname] = drv
        db.commit()

        # ── 5. Vehicles (14 Realistic Vehicles with Indian Plates) ────────────
        # (reg_no, vtype, make, model, year, fuel, cap_kg, vol_m3, len_ft, wid_ft, hgt_ft, loc, status, prov_name, driver_name)
        vehicle_specs = [
            ("TN 34 AB 1234", "Tata Ace", "Tata", "Ace Gold Diesel", 2023, FuelType.DIESEL, 750, 4.0, 7.0, 5.0, 5.0, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Arun Kumar"),
            ("TN 52 CD 4567", "Mahindra Bolero Pickup", "Mahindra", "Bolero Maxi Truck Plus", 2022, FuelType.DIESEL, 1200, 5.5, 8.5, 5.5, 5.5, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Rajesh Kannan"),
            ("KA 01 EF 7890", "Tata Intra V30", "Tata", "Intra V30 Smart", 2023, FuelType.DIESEL, 1300, 6.0, 8.8, 5.6, 5.5, "Bangalore", VehicleStatus.AVAILABLE, "RapidMove Logistics", "Dinesh Kumar"),
            ("TN 33 GH 2345", "Ashok Leyland Dost", "Ashok Leyland", "Dost Strong", 2022, FuelType.DIESEL, 1500, 7.0, 9.5, 5.8, 6.0, "Coimbatore", VehicleStatus.AVAILABLE, "Coimbatore Fleet Services", "Selvakumar R"),
            ("TN 07 JK 6789", "Tata 407", "Tata", "407 Gold SFC", 2021, FuelType.DIESEL, 2500, 12.0, 12.0, 6.5, 6.5, "Chennai", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Suresh Raman"),
            ("TN 34 EV 1001", "EV Cargo Van", "Tata", "Ace EV", 2024, FuelType.EV, 1000, 7.0, 9.0, 5.5, 5.5, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Karthik V"),
            ("TN 28 LM 3456", "Tata 709", "Tata", "709g LPT", 2021, FuelType.DIESEL, 5000, 25.0, 17.0, 7.0, 7.5, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Murugan P"),
            ("TN 38 NP 7890", "Eicher Pro 2049", "Eicher", "Pro 2049 Light Truck", 2022, FuelType.DIESEL, 5000, 28.0, 19.0, 7.2, 7.5, "Coimbatore", VehicleStatus.ASSIGNED, "Coimbatore Fleet Services", "Vigneshwaran S"),
            ("TN 02 QR 4567", "Tata 1109", "Tata", "1109 LPT Haulage", 2020, FuelType.DIESEL, 7500, 35.0, 21.0, 7.5, 8.0, "Chennai", VehicleStatus.IN_TRANSIT, "South India Cargo Movers", "Prakash M"),
            ("TN 34 ST 8901", "BharatBenz 1217", "BharatBenz", "1217C Medium Hauler", 2021, FuelType.DIESEL, 9000, 40.0, 24.0, 8.0, 8.5, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Arun Kumar"),
            ("KA 05 EV 2002", "EV Cargo Van", "Mahindra", "Zor Grand EV", 2023, FuelType.EV, 1000, 7.0, 9.0, 5.5, 5.5, "Bangalore", VehicleStatus.AVAILABLE, "RapidMove Logistics", "Anand Babu"),
            ("TN 54 UV 5678", "Mahindra Bolero Pickup", "Mahindra", "Bolero City Pickup", 2022, FuelType.DIESEL, 1200, 5.5, 8.5, 5.5, 5.5, "Salem", VehicleStatus.AVAILABLE, "South India Cargo Movers", "Rajesh Kannan"),
            ("TN 30 WX 9012", "Ashok Leyland Dost", "Ashok Leyland", "Dost+ Heavy", 2023, FuelType.DIESEL, 1500, 7.0, 9.5, 5.8, 6.0, "Salem", VehicleStatus.AVAILABLE, "Salem Transport Solutions", "Karthik V"),
            ("TN 27 YZ 3456", "Tata Ace", "Tata", "Ace HT Plus", 2022, FuelType.DIESEL, 750, 4.0, 7.0, 5.0, 5.0, "Coimbatore", VehicleStatus.AVAILABLE, "Coimbatore Fleet Services", "Selvakumar R"),
        ]

        vehicles_by_plate = {}
        for reg, vtype, make, model, myear, fuel, cap_kg, vol_m3, l_ft, w_ft, h_ft, loc, stat, prov_name, drv_name in vehicle_specs:
            prov = providers_by_name[prov_name]
            drv = drivers_by_name.get(drv_name)
            v = db.query(Vehicle).filter(Vehicle.registration_number == reg).first()
            if not v:
                v = Vehicle(
                    owner_id=prov.user_id,
                    provider_id=prov.id,
                    driver_id=drv.id if drv else None,
                    registration_number=reg,
                    vehicle_number=reg.replace(" ", ""),
                    vehicle_type=vtype,
                    make=make,
                    model=model,
                    manufacture_year=myear,
                    fuel_type=fuel,
                    capacity_kg=cap_kg,
                    volume_m3=vol_m3,
                    capacity_volume_m3=vol_m3,
                    length_ft=l_ft,
                    width_ft=w_ft,
                    height_ft=h_ft,
                    current_location=loc,
                    home_location=prov.city,
                    status=stat,
                    availability=stat == VehicleStatus.AVAILABLE,
                    vehicle_age_years=float(2024 - myear),
                    vehicle_age=float(2024 - myear),
                    mileage=35000.0 + (2024 - myear) * 15000.0,
                    efficiency=1.1 if fuel == FuelType.EV else 1.0,
                    fuel_efficiency=18.0 if fuel == FuelType.EV else 14.5,
                    rating=4.8,
                    total_deliveries=120,
                    successful_deliveries=116,
                    insurance_expiry="2027-05-15",
                    fitness_expiry="2027-04-10",
                    last_service_date="2024-09-01",
                    is_active=True,
                )
                db.add(v)
                db.flush()
                print(f"  Created vehicle: {reg} ({vtype}) - {prov_name}")
            else:
                v.current_location = loc
                v.status = stat
                v.availability = stat == VehicleStatus.AVAILABLE
                v.driver_id = drv.id if drv else v.driver_id
                v.capacity_kg = cap_kg
                v.volume_m3 = vol_m3
            vehicles_by_plate[reg] = v

            # Connect driver to vehicle
            if drv and not drv.assigned_vehicle_id:
                drv.assigned_vehicle_id = v.id
        db.commit()

        # Update provider vehicle counts based on real vehicles
        for prov in providers_by_name.values():
            tot = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.is_active == True).count()
            avail = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.status == VehicleStatus.AVAILABLE, Vehicle.is_active == True).count()
            ass = db.query(Vehicle).filter(Vehicle.provider_id == prov.id, Vehicle.status != VehicleStatus.AVAILABLE, Vehicle.is_active == True).count()
            prov.total_vehicles = tot
            prov.available_vehicles = avail
            prov.assigned_vehicles = ass
        db.commit()

        # ── 6. Realistic Transport Requests ──────────────────────────────────
        shippers = [users_by_email["business@driva.demo"], users_by_email["kovai@driva.demo"]]
        requests_meta = [
            (shippers[0].id, "Salem", "Bangalore", "Electronics", 200.0, 0.8, 1.2, 0.8, 0.8, "Tata Ace", 8, Priority.HIGH, "Fragile electronics — weather-protected and shock-isolated handling", RequestStatus.BOOKED, 340.0),
            (shippers[0].id, "Chennai", "Coimbatore", "Auto Components", 1400.0, 6.0, 2.5, 1.4, 1.4, "Ashok Leyland Dost", 14, Priority.NORMAL, "Industrial pallet load, forklift required at pickup", RequestStatus.BOOKED, 500.0),
            (shippers[1].id, "Bangalore", "Salem", "Retail Goods", 650.0, 3.5, 2.0, 1.2, 1.2, "Tata Ace", 10, Priority.HIGH, "High-density retail packages, deliver before 6 PM", RequestStatus.BOOKED, 340.0),
            (shippers[0].id, "Salem", "Bangalore", "Electronics", 200.0, 0.8, 1.2, 0.8, 0.8, "Tata Ace", 8, Priority.HIGH, "Fragile electronics demo test requirement", RequestStatus.MATCHED, 340.0),
            (shippers[1].id, "Coimbatore", "Chennai", "Industrial Hardware", 3200.0, 16.0, 4.0, 1.8, 1.8, "Tata 709", 16, Priority.NORMAL, "Steel bolts and heavy fasteners in wooden crates", RequestStatus.PENDING, 500.0),
            (shippers[0].id, "Salem", "Chennai", "Textiles & Garments", 850.0, 4.5, 2.2, 1.3, 1.3, "Mahindra Bolero Pickup", 9, Priority.URGENT, "Export ready yarn consignments, express corridor dispatch", RequestStatus.PENDING, 340.0),
        ]

        requests_saved = []
        for bid, origin, dest, cargo, wt, vol, l_m, w_m, h_m, pref, dl_hrs, prio, spec, st, dist in requests_meta:
            req = db.query(TransportRequest).filter(
                TransportRequest.business_id == bid,
                TransportRequest.pickup_location == origin,
                TransportRequest.destination == dest,
                TransportRequest.cargo_type == cargo,
                TransportRequest.cargo_weight_kg == wt
            ).first()

            dl_time = datetime.utcnow() + timedelta(hours=dl_hrs)
            if not req:
                req = TransportRequest(
                    business_id=bid,
                    pickup_location=origin,
                    destination=dest,
                    cargo_type=cargo,
                    cargo_weight_kg=wt,
                    cargo_volume_m3=vol,
                    cargo_length_m=l_m,
                    cargo_width_m=w_m,
                    cargo_height_m=h_m,
                    cargo_dimensions=f"{l_m}m x {w_m}m x {h_m}m",
                    vehicle_type_preference=pref,
                    deadline=dl_time,
                    priority=prio,
                    special_requirements=spec,
                    status=st,
                    estimated_distance_km=dist,
                )
                db.add(req)
                db.flush()
                print(f"  Created transport request: {origin} → {dest} ({cargo}, {wt} kg)")
            else:
                req.status = st
            requests_saved.append(req)
        db.commit()

        # ── 7. Bookings, Deliveries, DRIVA Service Fee, Tracking & Ratings ───
        # Transparent 5% DRIVA Service Fee
        salem_prov = providers_by_name["Salem Transport Solutions"]
        cbe_prov = providers_by_name["Coimbatore Fleet Services"]

        v_tata_ace = vehicles_by_plate["TN 34 AB 1234"]
        v_dost = vehicles_by_plate["TN 33 GH 2345"]
        v_ev = vehicles_by_plate["TN 34 EV 1001"]

        d_arun = drivers_by_name["Arun Kumar"]
        d_karthik = drivers_by_name["Karthik V"]
        d_suresh = drivers_by_name["Suresh Raman"]

        booking_fixtures = [
            (requests_saved[0], salem_prov, v_tata_ace, d_arun, 4800.0, 7.1, 94.0, BookingStatus.DELIVERED, 240.0),
            (requests_saved[1], cbe_prov, v_dost, d_suresh, 14500.0, 9.8, 91.5, BookingStatus.DELIVERED, 725.0),
            (requests_saved[2], salem_prov, v_ev, d_karthik, 5200.0, 6.8, 93.0, BookingStatus.IN_TRANSIT, 260.0),
        ]

        for req, prov, v, d, price, eta, score, bstatus, fee in booking_fixtures:
            b = db.query(Booking).filter(Booking.request_id == req.id).first()
            if not b:
                b = Booking(
                    request_id=req.id,
                    provider_id=prov.id,
                    vehicle_id=v.id,
                    driver_id=d.id,
                    quoted_price=price,
                    estimated_eta_hours=eta,
                    match_score=score,
                    status=bstatus,
                    driva_fee_rate=0.05,
                    driva_service_fee=fee,
                    commission_rate=0.05,
                    driva_commission=fee,
                    pickup_time=datetime.utcnow() - timedelta(hours=10),
                    delivered_time=datetime.utcnow() - timedelta(hours=2) if bstatus == BookingStatus.DELIVERED else None,
                )
                db.add(b)
                db.flush()
                print(f"  Created booking: #{b.id} for request #{req.id} (Status: {bstatus.value}, DRIVA Fee: ₹{fee})")

                # Add Tracking Updates
                updates = [
                    (BookingStatus.CONFIRMED, req.pickup_location, "Consignment booked and scheduled."),
                    (BookingStatus.DRIVER_ASSIGNED, req.pickup_location, f"Driver {d.name} assigned with {v.vehicle_type} ({v.registration_number})."),
                    (BookingStatus.PICKUP_COMPLETED, req.pickup_location, "Cargo verified and loaded onto vehicle."),
                    (BookingStatus.IN_TRANSIT, "NH44 Corridor Toll", "Vehicle traveling along optimal NH44 freight route."),
                ]
                if bstatus == BookingStatus.DELIVERED:
                    updates.append((BookingStatus.DELIVERED, req.destination, "Consignment delivered. E-way bill closed."))

                for ust, loc, note in updates:
                    db.add(TrackingUpdate(booking_id=b.id, status=ust, location=loc, notes=note))

                # Add Rating for delivered booking
                if bstatus == BookingStatus.DELIVERED:
                    db.add(Rating(
                        booking_id=b.id,
                        rater_id=req.business_id,
                        provider_id=prov.id,
                        driver_id=d.id,
                        overall_rating=4.9,
                        timeliness_rating=5.0,
                        cost_rating=4.8,
                        service_rating=4.9,
                        comment="Excellent transport turnaround! Cargo arrived safely within the specified ETA window."
                    ))

                # Add Vehicle Assignment
                db.add(VehicleAssignment(
                    vehicle_id=v.id,
                    driver_id=d.id,
                    request_id=req.id,
                    booking_id=b.id,
                    status="ACTIVE" if bstatus != BookingStatus.DELIVERED else "COMPLETED",
                    notes="Assigned via DRIVA Smart Match Engine."
                ))
        db.commit()

        # ── 8. System Notifications ──────────────────────────────────────────
        admin_user = users_by_email["admin@driva.demo"]
        notifs = [
            (admin_user.id, "Platform Health Optimal", "FastAPI microservices and Scikit-learn inference engines operating normally.", "SUCCESS"),
            (admin_user.id, "DRIVA Service Fee Settlement", "Total collected platform service fee: ₹1,225 on active consignments.", "INFO"),
        ]
        for uid, title, msg, ntype in notifs:
            exists = db.query(Notification).filter(Notification.user_id == uid, Notification.title == title).first()
            if not exists:
                db.add(Notification(user_id=uid, title=title, message=msg, notification_type=ntype))
        db.commit()

        # ── Summary Verification ─────────────────────────────────────────────
        total_u = db.query(User).count()
        total_p = db.query(Provider).count()
        total_v = db.query(Vehicle).count()
        avail_v = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
        total_d = db.query(Driver).count()
        total_r = db.query(TransportRequest).count()
        total_b = db.query(Booking).count()
        delivered_b = db.query(Booking).filter(Booking.status == BookingStatus.DELIVERED).count()

        print("\n" + "="*50)
        print("✅ DRIVA DATABASE SEED SUCCESSFUL (PostgreSQL)")
        print("="*50)
        print(f"  • Total Users:              {total_u}")
        print(f"  • Total Fleet & Agencies:   {total_p}")
        print(f"  • Total Commercial Vehicles:{total_v} (Available: {avail_v})")
        print(f"  • Total Certified Drivers:  {total_d}")
        print(f"  • Transport Requests:       {total_r}")
        print(f"  • Total Consignment Bookings:{total_b} (Delivered: {delivered_b})")
        print("="*50 + "\n")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
