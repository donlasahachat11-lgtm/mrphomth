import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TerminalIcon, AutoFixIcon, CodeIcon, SparklesIcon, VisibilityIcon, WorkflowIcon, ControlIcon } from "@/components/custom-icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              วิธีใช้งาน
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              คุณสมบัติ
            </Link>
            <Link href="#technology" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              เทคโนโลยี
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              เริ่มใช้งาน
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-foreground">สร้างเว็บไซต์ด้วย</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              พรอมท์เดียว
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            บอกความต้องการของคุณเพียงครั้งเดียว AI ของเราจะวิเคราะห์ ออกแบบ พัฒนา ทดสอบ และ Deploy เว็บแอปพลิเคชันที่พร้อมใช้งานให้คุณโดยอัตโนมัติ
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              เริ่มสร้างเลย
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 bg-background border border-border rounded-xl font-semibold hover:bg-muted transition-colors"
            >
              ดูตัวอย่าง
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>ไม่ต้องเขียนโค้ด</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>พร้อมใช้งานจริง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Deploy ได้ทันที</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">วิธีใช้งาน</h2>
            <p className="text-lg text-muted-foreground">
              ง่ายเพียง 3 ขั้นตอน ได้เว็บไซต์ที่พร้อมใช้งาน
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">บอกความต้องการ</h3>
              <p className="text-muted-foreground leading-relaxed">
                พิมพ์ prompt เดียว บอกว่าต้องการเว็บแบบไหน สีอะไร ฟีเจอร์อะไร ระบบจะเข้าใจและวิเคราะห์ให้
              </p>
            </div>

            <div className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI สร้างให้</h3>
              <p className="text-muted-foreground leading-relaxed">
                ระบบ AI วิเคราะห์ ออกแบบ พัฒนา และทดสอบเว็บให้คุณโดยอัตโนมัติ คุณเห็นทุกขั้นตอนแบบ real-time
              </p>
            </div>

            <div className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Deploy ได้เลย</h3>
              <p className="text-muted-foreground leading-relaxed">
                รับเว็บที่พร้อมใช้งาน พร้อม source code ครบถ้วน Deploy ไปยัง Vercel ได้ทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24 bg-muted/30 rounded-3xl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">คุณสมบัติเด่น</h2>
            <p className="text-lg text-muted-foreground">
              ทุกอย่างที่คุณต้องการ ในที่เดียว
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TerminalIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">เห็นการทำงานแบบ Real-time</h3>
                  <p className="text-sm text-muted-foreground">
                    ดูไฟล์ที่กำลังสร้าง คำสั่งที่กำลังรัน และ progress ทุกขั้นตอนแบบ live
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ControlIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">ควบคุมได้ทุกขั้นตอน</h3>
                  <p className="text-sm text-muted-foreground">
                    หยุด แก้ไข หรือดำเนินการต่อได้ตลอดเวลา คุณคือผู้ควบคุมเต็มรูปแบบ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CodeIcon className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Source Code ครบถ้วน</h3>
                  <p className="text-sm text-muted-foreground">
                    ได้ source code ทั้งหมด พร้อมปรับแต่งและพัฒนาต่อได้เองตามต้องการ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AutoFixIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI ซ่อมแซมตัวเอง</h3>
                  <p className="text-sm text-muted-foreground">
                    เจอ error? ไม่ต้องกังวล AI จะวิเคราะห์ แก้ไข และปรับปรุงให้อัตโนมัติ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <VisibilityIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">โปร่งใส ตรวจสอบได้</h3>
                  <p className="text-sm text-muted-foreground">
                    เห็นทุกไฟล์ที่สร้าง ทุกคำสั่งที่รัน ทุก log ที่เกิดขึ้น แบบเรียลไทม์
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <WorkflowIcon className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">ครบวงจร จบในที่เดียว</h3>
                  <p className="text-sm text-muted-foreground">
                    ตั้งแต่วิเคราะห์ ออกแบบ พัฒนา ทดสอบ ไปจนถึง Deploy ทำครบในแพลตฟอร์มเดียว
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">เทคโนโลยีที่ใช้</h2>
          <p className="text-lg text-muted-foreground mb-12">
            สร้างด้วยเครื่องมือและเฟรมเวิร์กมาตรฐานอุตสาหกรรม
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Supabase", "Vercel", "AI", "Node.js"].map((tech) => (
              <div key={tech} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <p className="font-semibold">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            พร้อมสร้างเว็บไซต์แล้วหรือยัง?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            เริ่มต้นสร้างเว็บแอปพลิเคชันของคุณวันนี้
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl transition-all"
          >
            เริ่มใช้งานเลย
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo />
              <p className="text-sm text-muted-foreground mt-4">
                สร้างเว็บไซต์ด้วย AI เพียงพรอมท์เดียว
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">ผลิตภัณฑ์</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">คุณสมบัติ</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">วิธีใช้งาน</Link></li>
                <li><Link href="#technology" className="hover:text-foreground transition-colors">เทคโนโลยี</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">บริษัท</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">เกี่ยวกับเรา</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">ติดต่อ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">กฎหมาย</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">ข้อกำหนด</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Mr.Promth. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
