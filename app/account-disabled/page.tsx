import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Home, Mail } from 'lucide-react'

export default function AccountDisabledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="mb-6">
          <span className="text-8xl">⛔</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          บัญชีถูกระงับ
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          บัญชีของคุณถูกระงับการใช้งาน
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </p>
        
        <Alert variant="warning" className="mb-8 text-left max-w-md mx-auto">
          <AlertDescription>
            <p className="font-semibold mb-2">
              เหตุผลที่เป็นไปได้:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>การละเมิดเงื่อนไขการใช้งาน</li>
              <li>กิจกรรมที่น่าสงสัย</li>
              <li>การร้องขอจากผู้ใช้</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="secondary" size="lg">
            <Link href="/">
              <Home className="w-5 h-5" />
              กลับหน้าแรก
            </Link>
          </Button>
          
          <Button asChild size="lg">
            <a href="mailto:support@mrphomth.com">
              <Mail className="w-5 h-5" />
              ติดต่อฝ่ายสนับสนุน
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
