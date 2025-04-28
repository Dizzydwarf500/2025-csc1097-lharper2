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

load_dotenv()

# ✅ Set up OpenAI client safely
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

        # 🚀 Safer Debugging
        print("🚀 Incoming data:")
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

        # ✅ Build GPT Prompt
        prompt = (
    f"You are an AI assistant managing shift data at an airport.\n"
    f"Here is the current shift information:\n\n"
    f"🟢 On Duty (currently working):\n"
    f"{format_staff_list(onDuty)}\n\n"
    f"🟡 On Break (currently on break):\n"
    f"{format_staff_list(onBreak)}\n\n"
    f"🔵 Finished (already completed shift):\n"
    f"{format_staff_list(finished)}\n\n"
    f"Answer the following user query based on the information above:\n"
    f"{query}\n\n"
    f"Only answer based on the provided data. If you cannot answer, say 'No available data.'"
)


        # ✅ Call OpenAI
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
        print("❌ Assistant Error:", str(e))
        return Response({"error": str(e)}, status=500)

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        # ✅ Base filter: Terminal 1 only
        queryset = Product.objects.filter(Location="Terminal 1")

        ENABLE_DATE_FILTER = True
        if ENABLE_DATE_FILTER:
            queryset = queryset.filter(Shift_Start_Date="2024-09-15")

        queryset = queryset.order_by('name', 'Shift_Start_Date')

        # ✅ Deduplicate by name
        seen_names = set()
        unique_products = []
        for product in queryset:
            if product.name not in seen_names:
                unique_products.append(product)
                seen_names.add(product.name)

        return unique_products
