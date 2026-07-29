ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event

    event.register(
        Commands.literal('start_raid_test')
            .requires(source => source.hasPermission(2))
            .then(
                Commands.literal('FireDragon')
                .executes(ctx=>{
                    try{
                        if(!ctx.source.player.uuid){
                            ctx.source.getPlayer().tell(`Error con UUID no valido: ${ctx.source.player.uuid}`);
                            return 0;
                        }
                        global.lib.raid('create', {
                            type:'FIRE_DRAGON',
                            owner:ctx.source.player.uuid
                        });
                    } catch(e){
                        console.error(e);
                        return 0;
                    }
                    return 1;
                })
            )
    )
})