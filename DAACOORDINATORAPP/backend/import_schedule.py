import csv
from datetime import datetime
from api.models import Product  # Adjust 'yourapp' to the name of your app

# Path to your CSV file
csv_file_path = './Dummy Schedule.csv'

def import_schedule_data():
    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        # Print the column headers to debug
        print("CSV Columns:", reader.fieldnames)

        for row in reader:
            # Parse dates and times from the CSV
            shift_start_date = datetime.strptime(row['Shift Start Date'].strip(), '%d/%m/%Y').date()
            shift_start_time = datetime.strptime(row['Shift Start Time'].strip(), '%H:%M').time()
            shift_end_date = datetime.strptime(row['Shift End Date'].strip(), '%d/%m/%Y').date()
            shift_end_time = datetime.strptime(row['Shift End Time'].strip(), '%H:%M').time()

            # Create and save the Schedule object
            Product.objects.create(
                name=row['\ufeffName'].strip(),
                IDname=int(row['ID']),
                Location=row['Location'].strip(),
                Shift_Start_Date=shift_start_date,
                Shift_Start_Time=shift_start_time,
                Shift_End_Date=shift_end_date,
                Shift_End_Time=shift_end_time
            )

# Call the function
import_schedule_data()
