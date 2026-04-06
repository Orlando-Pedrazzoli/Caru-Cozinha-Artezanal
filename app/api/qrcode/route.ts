import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { isAdmin } from '@/lib/utils/auth';

export async function GET(request: Request) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'png';
    const size = parseInt(searchParams.get('size') || '300');
    const customUrl = searchParams.get('url');

    const qrUrl = customUrl
      ? decodeURIComponent(customUrl)
      : process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/pt`
        : 'http://localhost:3000/pt';

    if (format === 'svg') {
      const svg = await QRCode.toString(qrUrl, {
        type: 'svg',
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': 'attachment; filename="caru-menu-qrcode.svg"',
        },
      });
    } else {
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="caru-menu-qrcode.png"',
        },
      });
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code', success: false },
      { status: 500 },
    );
  }
}
