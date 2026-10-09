import psycopg2

def init_postgres():
    conn = psycopg2.connect(host='localhost', port=5432, user='postgres', password='dhesik0505', dbname='postgres')
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT usename FROM pg_user WHERE usename = 'driva_user';")
    if not cur.fetchall():
        cur.execute("CREATE USER driva_user WITH PASSWORD 'dhesik0505' CREATEDB;")
        print("Created user driva_user")
    else:
        cur.execute("ALTER USER driva_user WITH PASSWORD 'dhesik0505';")
        print("Updated driva_user password")

    cur.execute("SELECT datname FROM pg_database WHERE datname = 'driva_db';")
    if not cur.fetchall():
        cur.execute("CREATE DATABASE driva_db OWNER driva_user;")
        print("Created database driva_db")
    else:
        print("Database driva_db already exists")

    cur.execute("GRANT ALL PRIVILEGES ON DATABASE driva_db TO driva_user;")
    print("Granted all privileges on driva_db to driva_user")
    cur.close()
    conn.close()

if __name__ == '__main__':
    init_postgres()
