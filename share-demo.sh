#!/bin/bash
# สคริปต์สำหรับเปิดแชร์ลิงก์โปรเจกต์ให้เข้าถึงได้ผ่านอินเทอร์เน็ตทันที (สำหรับการ Demo/พรีเซนต์)
echo "🚀 กำลังสร้างลิงก์ Public สำหรับ SmartCare..."

# ตรวจสอบว่ามี localtunnel หรือยัง
if ! command -v npx &> /dev/null
then
    echo "⚠️ ไม่พบคำสั่ง npx กรุณาติดตั้ง Node.js ก่อน"
    exit
fi

echo "🌐 1. กำลังสร้างลิงก์สำหรับ Next.js (Frontend - Port 3000)"
npx localtunnel --port 3000 > frontend-link.txt &
FRONTEND_PID=$!

echo "🧠 2. กำลังสร้างลิงก์สำหรับ AI Service (Backend - Port 8000)"
npx localtunnel --port 8000 > backend-link.txt &
BACKEND_PID=$!

sleep 3

echo "---------------------------------------------------"
echo "✅ สำเร็จ! ลิงก์สำหรับการ Demo งานของคุณคือ:"
echo ""
echo "🖥️ Frontend (หน้าเว็บ): $(cat frontend-link.txt)"
echo "⚙️ AI Backend (API): $(cat backend-link.txt)"
echo "---------------------------------------------------"
echo "📌 หมายเหตุ: "
echo "1. อย่าลืมรัน 'npm run dev' และ 'uvicorn' ไว้ในอีก Terminal"
echo "2. นำลิงก์ AI Backend ไปใส่ในไฟล์ .env ของ Frontend (AI_SERVICE_URL) หากต้องการให้เว็บเรียก API ผ่าน Net ได้สมบูรณ์"
echo ""
echo "กด Ctrl+C เพื่อปิดลิงก์เมื่อพรีเซนต์เสร็จ"

# ปิด Process เมื่อจบการทำงาน
trap "kill $FRONTEND_PID $BACKEND_PID; rm frontend-link.txt backend-link.txt; exit" SIGINT SIGTERM
wait
