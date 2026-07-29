/* 
    Este script se encarga de manejar principalmente la base de datos de las
    raids y funciones generales, no se debe escribir codigo para programar una
    raid en especifico.
*/
// declarar el "lib" si no existe
if (global.lib == undefined) global.lib = {}

//Cargar configuracion
const ScriptConfig = JSON.parse(JsonIO.readString('kubejs/config/lib_raidManager_config.json'));

//Obtener las configuraciones de las rais segun la lista
const raidsConfig={};
ScriptConfig.RAIDS.LIST.forEach(x=>{
    let raid = JSON.parse(JsonIO.readString(`${ScriptConfig.RAIDS.DIR}/${x}.json`));
    raidsConfig[Object.keys(raid)[0]] = raid[Object.keys(raid)[0]];
})

var raidsDB = JSON.parse(JsonIO.readString(ScriptConfig.RAID_DB_DIR));

//Crear ride
function raidCreate(type,owner){
        if(typeof raidsConfig[type] != 'object')
            throw Error(ScriptConfig.ERROR.RAID_DO_NOT_EXIST);
        if(!owner)
            throw Error(ScriptConfig.ERROR.NOT_VALID_PLAYER_ID);
        this.raidType=type;
        this.raidOwner=owner.toString();
        this.raidPlayers=[owner.toString()];
        this.running=false;
}

//Editar raid
function raidEdit(raid){
    if(typeof raid != 'object')
        throw Error(ScriptConfig.ERROR.NOT_VALID_PARAMETERS);
    Object.keys(raid).forEach(x=>this[x] = raid[x]);
}
raidEdit.prototype.set = function(parameter, val){
    if(this[parameter] == undefined)
        throw Error(ScriptConfig.ERROR.NOT_FOUND_PARAMETER);
    this[parameter] = val;
}

global.lib.raid = function(execution, parametersObj){

    if(typeof parametersObj != 'object')
        throw Error(ScriptConfig.ERROR.NOT_VALID_PARAMETERS);

    switch(execution){
        case ScriptConfig.CREATE_RAID_EVENT_KEY:
            //Evitar que alguien en una raid cree otra.
            if(
                raidsDB.raidsList.filter(x=>x.owner == parametersObj.owner)[0]||
                raidsDB.raidsList.filter(x=>x.raidPlayers.filter(z=>z==parametersObj.owner))[0]
            )  throw Error(ScriptConfig.ERROR.PLAYER_ALREADY_IN_RAID);
            raidsDB.raidsList[raidsDB.raidsList.length] = new raidCreate(parametersObj.type, parametersObj.owner);  
        break;
        case ScriptConfig.EDIT_RAID_EVENT_KEY:
            let raidIndex;
            for(let index = 0; index < raidsDB.raidsList.length; index++)
                if(raidsDB.raidsList[index]==parametersObj.owner){
                        raidIndex = index;
                    break;
                }
            raidsDB.raidsList[raidIndex] = parametersObj.callback(new raidEdit(raidsDB.raidsList[raidIndex]));
        break;
        case ScriptConfig.DELETE_RAID_EVENT_KEY:
            raidsDB.raidsList = raidsDB.raidsList.filter(raid=>raid.owner!=parametersObj.owner);
        break;
        default:
             throw Error(ScriptConfig.ERROR.RAID_TYPE_EXECUTION);
    }

    //refrescar base de datos
    JsonIO.write(ScriptConfig.RAID_DB_DIR, raidsDB);
    raidsDB = JSON.parse(JsonIO.readString(ScriptConfig.RAID_DB_DIR));
}