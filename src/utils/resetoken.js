function generateResetToken() {
    // Generar un número aleatorio entre 100000 y 999999
    const token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
}

module.exports = { generateResetToken }