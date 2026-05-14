const QRCode = require('qrcode');

async function generateQRCodeDataURL(data) {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

async function generateQRCodeBuffer(data) {
  return await QRCode.toBuffer(data, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

async function generateQRCodeBase64(data) {
  const dataUrl = await generateQRCodeDataURL(data);
  return dataUrl.split(',')[1];
}

module.exports = { generateQRCodeDataURL, generateQRCodeBuffer, generateQRCodeBase64 };
