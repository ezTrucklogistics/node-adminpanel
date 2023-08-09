const qrcode = require('qrcode-terminal');
const open = require('open');

function main() {
    const qrText = 'https://livoso.ai'; // The URL you want to encode in the QR code

    // Display the QR code in the terminal
    qrcode.generate(qrText, { small: true });

    // Open the URL in the default web browser
    open(qrText);
}

main()