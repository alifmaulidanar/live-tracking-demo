import { useRef } from 'react';
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button"
import landingImage from "@/assets/landing-map-preview.png";
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, History, Users, ArrowRight, Building2 } from 'lucide-react'

export default function Landing() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }) };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Set Page Title */}
      <Helmet>
        <title>Pasti Tracking</title>
      </Helmet>

      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center max-w-screen-lg mx-auto h-14">
          <Link to="/" className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-emerald-500" />
            <span className="font-bold">Pasti Tracking</span>
          </Link>
          <nav className="flex gap-4 ml-auto">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium hover:text-emerald-600">
                Masuk
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center max-w-screen-lg gap-4 pt-6 pb-8 mx-auto md:pb-12 md:pt-10 lg:py-32">
          <div className="relative">
            <div className="absolute inset-x-0 flex justify-center overflow-hidden -top-4 -z-10 blur-2xl" aria-hidden="true">
              <div
                className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-emerald-100 to-emerald-400 opacity-25"
                style={{
                  clipPath: "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
                }}
              />
            </div>
          </div>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Lacak Lokasi Tim Anda <br /> secara <span className='italic'>Real-Time</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Pantau dan kelola tenaga kerja Anda dengan mudah dengan solusi pelacakan lokasi yang canggih. Tetap terhubung, memastikan keamanan, dan mengoptimalkan kinerja.
            </p>
          </div>
          <div className="flex gap-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={scrollToBottom}>
              Mulai sekarang <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {/* <Button size="lg" variant="outline">
              Learn More
            </Button> */}
          </div>

          <div className="relative w-full max-w-4xl mx-auto mt-8">
            <div className="relative border rounded-lg shadow-2xl bg-background">
              <img
                src={landingImage}
                width={1200}
                height={600}
                alt="Dashboard Preview"
                className="rounded-lg"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        </section>

        <section className="container max-w-screen-lg py-12 mx-auto border-t md:py-24 lg:py-32">
          <div className="grid items-center max-w-5xl gap-8 mx-auto lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Fitur-fitur yang Kuat untuk Bisnis Anda
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Solusi komprehensif kami menyediakan semua yang Anda butuhkan untuk mengelola tenaga kerja mobile secara efektif.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <MapPin className="w-10 h-10 text-emerald-500" />
                  <h3 className="font-bold">Pelacakan <span className='italic'>Real-Time</span></h3>
                  <p className="text-sm text-muted-foreground">
                    Pantau lokasi tim secara <span className='italic'>real-time</span> dengan akurasi tinggi
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <History className="w-10 h-10 text-emerald-500" />
                  <h3 className="font-bold">Riwayat Lokasi</h3>
                  <p className="text-sm text-muted-foreground">
                    Laporan riwayat pergerakan dan aktivitas secara terperinci
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <Users className="w-10 h-10 text-emerald-500" />
                  <h3 className="font-bold">Manajemen Tim</h3>
                  <p className="text-sm text-muted-foreground">
                    Pengelolaan tenaga kerja secara efisien
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <Building2 className="w-10 h-10 text-emerald-500" />
                  <h3 className="font-bold">Dasbor Admin</h3>
                  <p className="text-sm text-muted-foreground">
                    Tinjauan menyeluruh atas seluruh aktivitas pemantauan
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer ref={bottomRef} className="py-6 border-t md:py-0">
        <div className="container flex flex-col items-center justify-between max-w-screen-lg gap-4 mx-auto md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Navigation className="w-6 h-6 text-emerald-500" />
            <p className="text-sm leading-loose text-center md:text-left">
              Pasti Tracking. © 2024 by <Badge variant="outline"><Link to="https://alifmaulidanar.com" target='_blank'>Alif Maulidanar</Link></Badge>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

