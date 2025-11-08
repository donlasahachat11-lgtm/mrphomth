import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, LogIn } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-8xl">🚫</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          403 - ไม่มีสิทธิ์เข้าถึง
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/app/dashboard">
              <Home className="w-5 h-5" />
              กลับไปหน้าหลัก
            </Link>
          </Button>
          
          <Button asChild variant="secondary" size="lg">
            <Link href="/login">
              <LogIn className="w-5 h-5" />
              Login ใหม่
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
