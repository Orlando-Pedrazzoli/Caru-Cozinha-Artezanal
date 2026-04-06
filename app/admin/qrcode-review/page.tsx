'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Download,
  QrCode,
  Printer,
  Share2,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function QRCodeReviewPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(300);

  // TODO: Substituir pelo Google Place ID da Caru
  const reviewUrl =
    'https://search.google.com/local/writereview?placeid=SUBSTITUIR_PLACE_ID_CARU';

  useEffect(() => {
    generateQRCode();
  }, [selectedSize]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(reviewUrl, {
        width: selectedSize,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg') => {
    try {
      const response = await fetch(
        `/api/qrcode?format=${format}&size=${selectedSize}&url=${encodeURIComponent(reviewUrl)}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caru-review-qrcode.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Caru - Avaliação Google</title>
            <style>
              body { margin: 0; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Georgia', serif; }
              .container { text-align: center; border: 2px solid #6B3A7D; padding: 30px; border-radius: 15px; }
              h1 { color: #6B3A7D; margin-bottom: 5px; font-size: 36px; }
              .tagline { color: #666; margin-bottom: 20px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
              img { max-width: 400px; height: auto; margin: 20px 0; }
              .instructions { color: #333; font-size: 18px; margin-top: 20px; font-weight: bold; }
              .scan-text { color: #666; font-size: 14px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Caru</h1>
              <p class="tagline">Avalie sua experiência no Google</p>
              <img src="${qrCodeUrl}" alt="QR Code Avaliação" />
              <p class="instructions">⭐ Escaneie para deixar sua avaliação</p>
              <p class="scan-text">Ajude-nos a crescer com sua opinião!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const printTableCard = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Caru - Cartão Avaliação</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @page { size: A5 landscape; margin: 0; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Georgia', serif; background: #f9f5f0; }
              .card { width: 210mm; height: 148mm; background: #fefcf9; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; }
              .top-decoration { position: absolute; top: 0; left: 0; right: 0; height: 25mm; background: linear-gradient(135deg, #6B3A7D 0%, #8B5A9D 100%); }
              .stars-row { position: absolute; top: 8mm; left: 50%; transform: translateX(-50%); font-size: 24pt; color: white; letter-spacing: 10px; }
              .content { position: relative; z-index: 10; text-align: center; padding: 30mm 15mm 20mm; }
              .restaurant-name { font-size: 38pt; color: #6B3A7D; font-weight: bold; letter-spacing: 3px; margin-bottom: 3mm; }
              .tagline { font-size: 12pt; color: #8B6B9B; font-style: italic; margin-bottom: 8mm; letter-spacing: 1px; }
              .qr-container { background: white; padding: 10mm; border-radius: 15px; box-shadow: 0 8px 25px rgba(107,58,125,0.2); display: inline-block; border: 3px solid #6B3A7D; }
              .qr-code { width: 45mm; height: 45mm; }
              .instructions { margin-top: 8mm; }
              .rating-stars { font-size: 28pt; color: #FFD700; margin-bottom: 3mm; }
              .scan-text { font-size: 16pt; color: #333; font-weight: bold; margin-bottom: 2mm; }
              .scan-subtitle { font-size: 11pt; color: #666; font-style: italic; }
              .thank-you { font-size: 10pt; color: #6B3A7D; margin-top: 3mm; font-weight: bold; }
              .bottom-decoration { position: absolute; bottom: 0; left: 0; right: 0; height: 15mm; background: linear-gradient(135deg, #6B3A7D 0%, #8B5A9D 100%); }
              .restaurant-info { position: absolute; bottom: 4mm; left: 50%; transform: translateX(-50%); color: white; font-size: 9pt; z-index: 11; }
              @media print { body { background: white; } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="top-decoration"></div>
              <div class="stars-row">⭐⭐⭐⭐⭐</div>
              <div class="content">
                <h1 class="restaurant-name">Caru</h1>
                <p class="tagline">✨ Sua Opinião é Importante ✨</p>
                <div class="qr-container">
                  <img src="${qrCodeUrl}" alt="QR Code Avaliação" class="qr-code" />
                </div>
                <div class="instructions">
                  <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                  <p class="scan-text">AVALIE NO GOOGLE</p>
                  <p class="scan-subtitle">Escaneie e compartilhe sua experiência</p>
                  <p class="thank-you">AGRADECEMOS SUA AVALIAÇÃO!</p>
                </div>
              </div>
              <div class="bottom-decoration"></div>
              <div class="restaurant-info">Portugal • Obrigado pela visita!</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(reviewUrl);
    alert('URL copiada para área de transferência!');
  };

  const sizes = [
    { label: 'Pequeno (200px)', value: 200 },
    { label: 'Médio (300px)', value: 300 },
    { label: 'Grande (500px)', value: 500 },
    { label: 'Extra Grande (800px)', value: 800 },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center gap-4'>
            <Link href='/admin/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>QR Code de Avaliação</h1>
              <p className='text-sm text-muted-foreground'>
                Gere e imprima o QR Code para incentivar avaliações no Google
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <div className='grid gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <QrCode className='w-5 h-5' />
                Preview do QR Code
              </CardTitle>
              <CardDescription>
                Este QR Code leva diretamente ao formulário de avaliação no
                Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg'>
                {loading ? (
                  <div className='flex flex-col items-center gap-4'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500'></div>
                    <p className='text-sm text-muted-foreground'>
                      Gerando QR Code...
                    </p>
                  </div>
                ) : qrCodeUrl ? (
                  <div className='text-center'>
                    <div className='bg-white p-6 rounded-lg shadow-lg inline-block'>
                      <Image
                        src={qrCodeUrl}
                        alt='QR Code Avaliação'
                        width={selectedSize}
                        height={selectedSize}
                        className='mx-auto'
                      />
                    </div>
                    <p className='mt-4 text-sm font-medium'>
                      Caru - Avaliação Google
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Escaneie para deixar sua opinião
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tamanho do QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {sizes.map(size => (
                  <Button
                    key={size.value}
                    variant={
                      selectedSize === size.value ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedSize(size.value)}
                    className='w-full'
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>URL de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <div className='flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all'>
                  {reviewUrl}
                </div>
                <Button variant='outline' size='icon' onClick={copyUrl}>
                  <Share2 className='w-4 h-4' />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download e Impressão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <Button
                  onClick={() => downloadQRCode('png')}
                  className='w-full'
                  variant='default'
                >
                  <Download className='w-4 h-4 mr-2' />
                  Download PNG
                </Button>
                <Button
                  onClick={() => downloadQRCode('svg')}
                  className='w-full'
                  variant='outline'
                >
                  <Download className='w-4 h-4 mr-2' />
                  Download SVG
                </Button>
                <Button
                  onClick={printQRCode}
                  className='w-full'
                  variant='secondary'
                >
                  <Printer className='w-4 h-4 mr-2' />
                  Imprimir Simples
                </Button>
                <Button
                  onClick={printTableCard}
                  className='w-full'
                  variant='default'
                >
                  <CreditCard className='w-4 h-4 mr-2' />
                  Imprimir Cartão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
