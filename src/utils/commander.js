// Commander: librería que me permite configurar mis propios argumentos de consola
 //Command: Clase que me permite generar una instancia
const { Command } = require('commander');

// Instancia de Command que se va a llamar program y con esto programo mis argumentos de consola
const program = new Command();

 //1- Comando <acá va el puerto> // 2 - La descripción  //   3 - Un valor por default, si no se pone argumento
program
    .option("-p <port>", "puerto en donde se inicia el servidor", 8080)//Recibir el puerto como argumento
    .option("--mode <mode>", "modo de trabajo", "produccion")//Modo de trabajo
program.parse();
//Finalizamos acá la configuración.


module.exports = program;