from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from openai import OpenAI
import os
from dotenv import load_dotenv
import traceback

load_dotenv()

# Set up OpenAI client safely
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    raise ValueError("No OPENAI_API_KEY set for OpenAI client")

client = OpenAI(api_key=openai_api_key)

def format_staff_list(staff_list):
    if not staff_list or not isinstance(staff_list, list):
        return "None."
    output = []
    for s in staff_list:
        if isinstance(s, dict):
            output.append(f"{s.get('name', 'Unknown')} {s.get('IDname', '')} ({s.get('Shift_Start_Time', '')} - {s.get('Shift_End_Time', '')}), Breaks Taken: {s.get('finishedCount', 0)}")
        else:
            output.append(str(s))
    return "\n".join(output)

@csrf_exempt
@api_view(['POST'])
def assistant_query(request):
    try:
        data = request.data
        query = data.get('query', '')
        onDuty = data.get('onDuty', [])
        onBreak = data.get('onBreak', [])
        finished = data.get('finished', [])

        # Safer Debugging
        print("Incoming data")
        print("Query:", query)
        if isinstance(onDuty, list):
            print("OnDuty sample:", onDuty[0] if onDuty else "empty")
        else:
            print("OnDuty not a list")

        if isinstance(onBreak, list):
            print("OnBreak sample:", onBreak[0] if onBreak else "empty")
        else:
            print("OnBreak not a list")

        if isinstance(finished, list):
            print("Finished sample:", finished[0] if finished else "empty")
        else:
            print("Finished not a list")

        if not query:
            return Response({"error": "No query provided."}, status=400)

        # Build GPT Prompt
        prompt = (
    "You are an AI assistant responsible for managing shift schedules at an airport. "
    "Your job is to suggest who should go on break, who can finish early, and ensure operational rules are followed.\n\n"

    "Staff are in one of three categories:\n"
    "🟢 On Duty – Currently working\n"
    "🟡 On Break – Currently on a break\n"
    "🔵 Finished – Already completed their shift\n\n"

    "Here is the current shift data:\n"
    f"🟢 On Duty:\n{format_staff_list(onDuty)}\n\n"
    f"🟡 On Break:\n{format_staff_list(onBreak)}\n\n"
    f"🔵 Finished:\n{format_staff_list(finished)}\n\n"

    "You must follow these rules:\n"
    "- No critical role (e.g. VIP, FastTrack, QM, Sweep) should be left uncovered.\n"
    "- Avoid sending too many staff on break at once.\n"
    "- Breaks should be scheduled during low passenger traffic (not provided here, assume now is acceptable).\n"
    "- Staff should receive a first break before 4.5 hours into their shift.\n"
    "- Staff with short shifts (< 6.5 hours) only need one break.\n"
    "- Once a person has had all their breaks, they may be finished if coverage is sufficient.\n\n"

    "Answer this user query using the information above:\n"
    f"{query}\n\n"

    "Respond clearly and concisely. If there’s not enough information to decide, reply with 'No available data.'"
)


        # Call OpenAI
        response = client.chat.completions.create(
            model="o4-mini",
            messages=[
                {"role": "system", "content": "You are a highly efficient scheduling assistant specialized in airport staff shifts."},
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=16000,
        )

        answer = response.choices[0].message.content.strip()

        return Response({"answer": answer})

    except Exception as e:
        print("Assistant Error", str(e))
        return Response({"error": str(e)}, status=500)

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Base filter: Terminal 1 only
        queryset = Product.objects.filter(Location="Terminal 1")

        ENABLE_DATE_FILTER = True
        if ENABLE_DATE_FILTER:
            queryset = queryset.filter(Shift_Start_Date="2024-09-15")

        queryset = queryset.order_by('name', 'Shift_Start_Date')

        # Deduplicate by name
        seen_names = set()
        unique_products = []
        for product in queryset:
            if product.name not in seen_names:
                unique_products.append(product)
                seen_names.add(product.name)

        return unique_products

@csrf_exempt
@api_view(['POST'])
def analyze_shifts(request):
    try:
        data = request.data
        on_duty = data.get('onDuty', [])
        on_break = data.get('onBreak', [])
        passenger_data = data.get('passengerData', [])
        current_hour = data.get('currentHour', 0)

        def format_shift_data(staff_list):
            result = []
            for person in staff_list:
                try:
                    shift_start = datetime.strptime(person['Shift_Start_Time'], "%H:%M:%S")
                    shift_end = datetime.strptime(person['Shift_End_Time'], "%H:%M:%S")
                except Exception:
                    result.append(f"{person.get('IDname')} {person.get('name')} | Invalid shift time")
                    continue

                # Handle overnight shift
                if shift_end < shift_start:
                    shift_end = shift_end.replace(day=2)


                # Calculate minutes worked so far
                shift_length_minutes = int((shift_end - shift_start).total_seconds() / 60)
                current_minutes = int(current_hour) * 60
                shift_start_minutes = shift_start.hour * 60 + shift_start.minute
                minutes_worked = max(0, current_minutes - shift_start_minutes)

                breaks = person.get('finishedCount', 0)

                # Calculate ideal break window
                break_earliest = shift_start_minutes + 120  # 2 hours in
                break_latest = min(shift_start_minutes + 270, shift_start_minutes + shift_length_minutes - 30)

                break_earliest_str = f"{break_earliest // 60:02}:{break_earliest % 60:02}"
                break_latest_str = f"{break_latest // 60:02}:{break_latest % 60:02}"

                breaks = person.get('finishedCount', 0)
                result.append(
                    f"{person.get('IDname')} {person.get('name')} | Shift: {person.get('Shift_Start_Time')} - {person.get('Shift_End_Time')} | "
                    f"Worked: {minutes_worked}min | Total: {shift_length_minutes}min | Breaks: {breaks}"
                    f"Ideal Break Window: {break_earliest_str} - {break_latest_str}"
                )

            return "\n".join(result) or "None"



        def format_traffic(data):
            return "\n".join([f"{entry['time']}: {entry['status']}" for entry in passenger_data])

        prompt = (
    f"You are an AI shift scheduling assistant for an airport.\n\n"
    f"The current hour is {current_hour}.\n\n"

    f"🟢 On Duty Staff:\n{format_shift_data(on_duty)}\n\n"
    f"🟡 On Break:\n{format_shift_data(on_break)}\n\n"
    f"Passenger traffic status:\n{format_traffic(passenger_data)}\n\n"

    "📋 Your job is to assign a first break time to some of the staff currently on duty.\n\n"

    "⏳ All staff below have an 'Ideal Break Window' listed. Choose a break time **within that window**, even if they just started their shift.\n"
    "- You may schedule the break for a future hour (e.g., someone who started at 03:50 could be scheduled for break at 06:00).\n"
    "- Assign a break time to every single staff member currently on duty using their Ideal Break Window.\n\n"

    "🛑 Do not check how long someone has worked. Just assign break times **inside their ideal window**.\n"
    "- Avoid red (busy) traffic periods.\n"
    "- Prefer green (quiet) traffic periods.\n"
    "- Try to balance load so that at least 93 people remain on duty, unless someone must go urgently.\n\n"

    "🧠 Use smart logic to spread out breaks evenly across the available green traffic hours.\n\n"

    "🧾 Return only the people you've assigned a break to, in this exact format:\n"
    "(ID) (BreakTime)\n"
    "Example:\n100354 06:00\n\n"

    "If somehow no break times could be assigned, return this exact sentence:\n"
    "No one qualifies for a break at this time."
)






        response = client.chat.completions.create(
            model="o4-mini",
            messages=[
                {"role": "system", "content": "You are a highly efficient scheduling assistant specialized in airport staff shifts."},
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=16000,
        )

        output = response.choices[0].message.content.strip()
        print("GPT Prompt Sent:\n", prompt)
        print("GPT Raw Output:\n", output)

        lines = output.splitlines()
        schedule = {}

        for line in lines:
            parts = line.strip().split()
            if len(parts) == 2:
                staff_id, break_time = parts
                schedule[staff_id] = break_time

        return Response(schedule)

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)