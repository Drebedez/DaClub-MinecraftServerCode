//Importar configuracion.
const ScriptConfig = JsonIO.read("kubejs/config/restricted_zone_config.json");

//crear si no extiste
if(global.lib == undefined) global.lib = {};

var restrictedZoneEvents=[
    //Prueba, borrar cuando se termine el desarrollo.
    {
        callback: function(x){
            x.setStatusMessage(Text.of('¡Zona restringida!').red().bold());
            x.teleportTo(x.x+5, x.y, x.z);
        }
    }
];

function restrictedZoneEvent(exec, customID, callback){
    if(
        ScriptConfig.CREATE_EVENT_KEY != exec &&
        ScriptConfig.DELETE_EVENT_KEY != exec
    ) throw Error(ScriptConfig.ERROR.TYPE_EXECUTION)

    if(
        ScriptConfig.CREATE_EVENT_KEY == exec &&
        typeof callback != 'function'
    ) throw Error(ScriptConfig.ERROR.CALLBACK);

    if(!customID) throw Error(ScriptConfig.ERROR.CUSTOMID_NOT_EXIST);

    if(ScriptConfig.DELETE_EVENT_KEY == exec)
        return restrictedZoneEvents = restrictedZoneEvents.filter(x=>x.customID!=customID);

    if(restrictedZoneEvents.find(x=>x.customID==customID)) throw Error(ScriptConfig.ERROR.CUSTOMID_EXIST);

    restrictedZoneEvents.push({
        customID:customID,
        callback:callback
    });

}

ServerEvents.tick(event => {
    event.server.players.forEach(player => {
        if (player.block.id == ScriptConfig.RESTRICTED_ZONE_BLOCK) {
            restrictedZoneEvents.forEach(x=>x.callback(player));
        }
    })
});

//Exportar
global.lib.restrictedZoneEvent = restrictedZoneEvent;