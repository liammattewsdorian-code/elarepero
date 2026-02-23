const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Creamos una nueva instancia del cliente
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generamos el código QR para el escaneo
client.on('qr', (qr) => {
    console.log('--- ESCANEA EL SIGUIENTE CÓDIGO QR CON TU WHATSAPP ---');
    qrcode.generate(qr, { small: true });
});

// Cuando el cliente esté listo
client.on('ready', () => {
    console.log('¡Conexión exitosa! El bot está listo para recibir mensajes.');
});

// Escuchamos los mensajes entrantes
client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();

    // Lógica básica de respuesta
    if (text === 'hola') {
        msg.reply('¡Hola! Soy un bot de WhatsApp automatizado. ¿En qué puedo ayudarte?');
    } else if (text === 'ping') {
        msg.reply('pong');
    } else if (text.includes('informacion') || text.includes('info')) {
        msg.reply('Puedes encontrar toda nuestra información en el sitio web principal.');
    }
});

// Inicializamos el cliente
client.initialize();
