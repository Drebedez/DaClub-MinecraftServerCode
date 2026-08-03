/**
 * Proposito:
 *  Este script se encarga de manejar principalmente la base de datos de las
 *  raids y funciones generales, no se debe escribir codigo para programar una
 *  raid en especifico.
 * 
 * Uso:
 *  Las raids tienen dos base de datos distintas, en la base de datos de configuraciones estos tienen
 *  datos estaticos no dinamicas las cuales se usaran al momento de consultar la cantidad minima de jugadores,
 *  la cantidad maxima de jugadores, las estructuras, entre otras cosas mas.
 */

//Forzar tipado de configuracion. (No usar para programar.)
import * as config from '../config/lib_raidManager_config.json';
/**
 * Exportar configuraciones de script.
 * @type {config}
 * @private
 * @readonly
 */
const ScriptConfig_raid = JSON.parse(JsonIO.readString('kubejs/config/lib_raidManager_config.json'));

/**
 * Lista de rais y sus configuraciones las cuales seran usadas al momento de generacion y administracion.
 * 
 * @type {object} - Lista de las raids y sus configuraciones.
 * @private
 * @readonly
 */
const raidsConfig={};

/**
 * Cargar la lista de raids.
 */
ScriptConfig_raid.RAIDS.LIST.forEach(x=>{
    let raid = JSON.parse(JsonIO.readString(`${ScriptConfig_raid.RAIDS.DIR}/${x}.json`));
    raidsConfig[Object.keys(raid)[0]] = raid[Object.keys(raid)[0]];
})

/**
 * Cargar la lista de raids vigentes en la base de datos para su administracion.
 * 
 * @type {object}
 * @private
 */
var raidsDB = JSON.parse(JsonIO.readString(ScriptConfig_raid.RAID_DB_DIR));

/**
 * Crear objeto el cual entregara una estructura que contendra los datos para ser introducida y
 * administrada en la base de datos.
 * 
 * @typedef {Object} RaidCreateObject
 * @property {string} raidType - Nombre de la raid según su key.
 * @property {string} raidOwner - UUID del creador de la raid.
 * @property {string[]} raidPlayers - Lista de jugadores que participan.
 * @property {boolean} running - Estado de ejecución de la raid.
 */
/**
 * Constructor para crear una nueva instancia de raid.
 * 
 * @constructor
 * @param {string} type - Declarar el nombre de la raid segun su nombre de key. 
 * @param {object | string} owner - Entregar el objeto jugador o el UUID del creador.
 * @returns {RaidCreateObject}
 * @private
 */
function raidCreate(type,owner){
        if(typeof raidsConfig[type] != 'object')
            throw Error(ScriptConfig_raid.ERROR.RAID_DO_NOT_EXIST);
        if(!owner)
            throw Error(ScriptConfig_raid.ERROR.NOT_VALID_PLAYER_ID);
        this.raidType=type;
        this.raidOwner=owner.toString();
        this.raidPlayers=[owner.toString()];
        this.running=false;
}

/**
 * Objeto equipado con metodos para editar una raid de la base de datos.
 * 
 * @typedef {Object} RaidEditObject
 * @property {(string, any) => void} set - Modifica un parámetro de la raid.
 */
/**
 * Constructor para editar raids en base de datos.
 * 
 * @constructor
 * @param {object} raid - Objeto de la raid en la base de datos.
 * @returns {RaidEditObject}
 * @throws Tirara error si el objeto no tiene las propiedades necesarias completas.
 * @private
 */
function raidEdit(raid){
    if(typeof raid != 'object')
        throw Error(ScriptConfig_raid.ERROR.NOT_VALID_PARAMETERS);
    
    /**
     * Esta variable que es equivalente a una raid en la base de datos es privada para exponerla a
     * cambios de manera correcta.
     * 
     * @private
     * @type {{
     *   raidType: string,
     *   raidOwner: string,
     *   raidPlayers: string[],
     *   running: boolean
     * }}
     */
    const raidModify = raid;

    if(
        raidModify.raidType == undefined ||
        raidModify.raidOwner == undefined ||
        raidModify.raidPlayers == undefined ||
        raidModify.running == undefined
    ) throw Error(ScriptConfig_raid.ERROR.INCOMPLETED_OBJECT);

    /**
     * Declara un parámetro de la raid.
     * 
     * @this {RaidEditObject}
     * 
     * @overload
     * @param {'owner'} key - Cambiar dueño de la raid.
     * @param {string | object} val - Nuevo valor que se asignará a la propiedad.
     * @returns {void}
     * 
     * @overload
     * @param {'run'} key - Cambiar estado de arranque de la raid.
     * @param {boolean} val - Nuevo valor que se asignará a la propiedad.
     * @returns {void}
     */
    this.set = function(key, val){
        switch (key){
            case ScriptConfig_raid.EDIT_OPTION_KEYS.SET.OWNER:
                raidModify.raidOwner = val.toString();
            break;
            case ScriptConfig_raid.EDIT_OPTION_KEYS.SET.RUN:
                if(typeof val != 'boolean')
                    throw Error(ScriptConfig_raid.ERROR.NOT_BOOLEAN);
                raidModify.running = val;
            break;
            default:
                throw Error(ScriptConfig_raid.ERROR.RAID_TYPE_EXECUTION);
        }
    }

    /**
     * Añade a un parámetro de la raid un valor.
     * 
     * @this {RaidEditObject}
     * 
     * @overload
     * @param {'player'} key - Cambiar dueño de la raid.
     * @param {string | object} val - Nuevo valor que se asignará a la propiedad.
     * @returns {void}
     */
    this.add = function(key, val){
        switch (key) {
            case ScriptConfig_raid.EDIT_OPTION_KEYS.ADD.PLAYER:
                raidModify.raidPlayers.push(val.toString());
            break;
            default:
                throw Error(ScriptConfig_raid.ERROR.RAID_TYPE_EXECUTION);
        }
    }

    /**
     * Elimina un valor de la raid.
     * 
     * @this {RaidEditObject}
     * @throws {Error} Si se intenta remover al dueño de la raid.
     * 
     * @overload
     * @param {'player'} key - Remover un participante de la raid.
     * @param {string | object} val - Nuevo valor que se asignará a la propiedad.
     * @returns {void}
     */
    this.remove = function(key, val){
        switch (key) {
            case ScriptConfig_raid.EDIT_OPTION_KEYS.ADD.PLAYER:
                if(raidModify.raidOwner == val.toString())
                    throw Error(ScriptConfig_raid.ERROR.REMOVE_OWNER_FROM_RAID);
                raidModify.raidPlayers = raidModify.raidPlayers.filter(x=> x!=val.toString());
            break;
            default:
                throw Error(ScriptConfig_raid.ERROR.RAID_TYPE_EXECUTION);
        }
    }
}

/**
 * Funcion para manejar las raids en la base de datos.
 * 
 * @overload //Crear:
 * @param {'create'} execution - Usa 'create'para crear una raid en la base de datos.
 * @param {Object.<string, { type: string, owner: object | string }>} parametersObj - Declarar el tipo de raid segun el nombre de la key en la configuracion y el uuid del jugador dueño de esta raid por crear.
 * @returns {void}
 * @throws {Error} Puede tirar error si se intenta crear una raid con un dueño que ya esta en una.
 * 
 * @example 
 * //(Crear) (contexto: Jugador ejecutando comando.)
 * raid('create', {
 *      type: 'FIRE_DRAGON', //Declarar la raid de dragon de fuego.
 *      owner: source.player.uuid //Entregar el uuid del dueño de la raid.
 * });
 * 
 * @overload //Editar:
 * @param {'edit'} execution - Usa 'edit'  para manejar una raid de la base de datos.
 * @param {Object.<string, { owner: object | string, callback: function(RaidEditObject): void }>} parametersObj - Declarar el uuid del jugador dueño de la raid y la funcion para manejar la raid.
 * @returns {RaidEditObject}
 * 
 * @example
 * //(Editar)  (contexto: Nuevo jugador en la lista.)
 * raid('edit', {
 *      owner: player.uuid, //Entregar el uuid del dueño de la raid.
 *      callback: (raid) => {
 *          raid.add('player', player.uuid ) //Declarar 'player' para indicar que se manipula la list de jugadores y entregar el uuid del respectivo jugador.
 *      }
 * });
 * 
 * @overload //Eliminar:
 * @param {'delete'} execution - Usa 'delete' para eliminar una raid de la base de datos.
 * @param {Object.<string, { owner: object | string }>} parametersObj - Declarar el uuid del jugador dueño de la raid.
 * @returns {void}
 * 
 * @example
 * //(Eliminar) (contexto: Cancelacion de la raid.)
 * raid('delete', {
 *      owner: player.uuid //Entregar el uuid del dueño de la raid.
 * });
*/
function raid(execution, parametersObj){

    if(typeof parametersObj != 'object')
        throw Error(ScriptConfig_raid.ERROR.NOT_VALID_PARAMETERS);

    switch(execution){
        case ScriptConfig_raid.CREATE_RAID_EVENT_KEY:
            if(
                raidsDB.raidsList.filter(x=>x.owner == parametersObj.owner)[0]||
                raidsDB.raidsList.filter(x=>x.raidPlayers.filter(z=>z==parametersObj.owner))[0]
            )  throw Error(ScriptConfig_raid.ERROR.PLAYER_ALREADY_IN_RAID);
            raidsDB.raidsList[raidsDB.raidsList.length] = new raidCreate(parametersObj.type, parametersObj.owner);  
        break;
        case ScriptConfig_raid.EDIT_RAID_EVENT_KEY:
            let raidIndex;
            for(let index = 0; index < raidsDB.raidsList.length; index++)
                if(raidsDB.raidsList[index]==parametersObj.owner){
                        raidIndex = index;
                    break;
                }
            let raidOutput = parametersObj.callback(new raidEdit(raidsDB.raidsList[raidIndex]));

            raidsDB.raidsList[raidIndex] = raidOutput;
        break;
        case ScriptConfig_raid.DELETE_RAID_EVENT_KEY:
            raidsDB.raidsList = raidsDB.raidsList.filter(raid=>raid.owner!=parametersObj.owner);
        break;
        default:
             throw Error(ScriptConfig_raid.ERROR.RAID_TYPE_EXECUTION);
    }

    //refrescar base de datos
    JsonIO.write(ScriptConfig_raid.RAID_DB_DIR, raidsDB);
    raidsDB = JSON.parse(JsonIO.readString(ScriptConfig_raid.RAID_DB_DIR));
}

/**
 * Exportar funciones.
 */
global.lib.raid = raid;