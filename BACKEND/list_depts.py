from app import app, Department

def list_depts():
    with app.app_context():
        depts = Department.query.all()
        for d in depts:
            print(f"DEPT: {d.name} (ID: {d.id})")

if __name__ == "__main__":
    list_depts()
