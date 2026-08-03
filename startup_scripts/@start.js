/**
 * Proposito:
 *  Debido a que kubejs presenta limitaciones de importacion/exportacion siendo que todo rodea a la
 *  variable 'global' el orden de ejecucion de los script no se puede controlar a deseo por lo que
 *  usando el orden de ejecucion de Kubejs ( (startup_scripts => server_scripts) (simbolos => A-Z) )
 *  se hicieron dos scripts para tener una buena ejecucion de scripts.
 * 
 * Uso:
 *  Para tener una correcta ejecucion de scripts se debe declarar las instrucciones que dependan de otros
 *  con la funcion 'OnLoad'. Por seguridad una instruccion no debe depender de otra instruccion declarada
 *  en 'OnLoad' 
 */ 

/**
 * Declarar variable global 'lib' cuyo uso es habilitar funciones de este script y otros para ser usada por todos los demas.
 * 
 * @type {typeof global.lib}
 */
global.lib = global.lib || /** @type {any} */ ({});

/**
 * Lista de funciones que es inyectado por otros script que se ejecuta una vez todos
 * los scripts cargan.
 * @type {object}
 * @private
*/
const OnLoadList=[];

/**
 * Funcion para asignar instrucciones una vez cargado los scripts.
 * 
 * @global
 * @param {() => void} func - Funcion que se ejecutara una vez cargado los scripts.
 * @returns {void}
 */
function OnLoad(func){
    if(typeof func != 'function')
        throw Error('No se recibio una funcion.');
    OnLoad.push(func); //Asignar la funcion a las lista de funciones por ejecutar.
}

/**
 * Esta funcion se usa por el ultimo script cargado por Kubejs para cargar elementos
 * una vez todos esten cargados para evitar errores de ejecucion.
 * 
 * @global
 * @returns {void}
 */
function load(){

    if(!Array.isArray(OnLoadList))
        return console.error("La lista de funciones de 'OnLoad' no existe.");

    OnLoadList.forEach(func => {
        try{
            func();
        } catch(e){
            console.error(e);
        }
    });
    
}

/**
 * Exportar funciones.
 */
global.lib.load = load;
global.lib.OnLoad = OnLoad;