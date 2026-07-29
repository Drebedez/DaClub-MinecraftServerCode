// server_scripts/npc_lock.js
const LOCK_TAG = 'locked_npc_pos'

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event

    event.register(
        Commands.literal('EntityLock')
            .requires(source => source.hasPermission(2))
            .then(
                Commands.literal('lock')
                    .then(
                        Commands.argument('uuid', Arguments.STRING.create(event))
                            .executes(ctx => {
                                try {
                                    return lockNpc(ctx.source, Arguments.STRING.getResult(ctx, 'uuid'), true)
                                } catch (e) {
                                    console.error('Error en /npclock lock: ' + e)
                                    ctx.source.sendFailure(Text.red('Error interno, revisa la consola.'))
                                    return 0
                                }
                            })
                    )
            )
            .then(
                Commands.literal('unlock')
                    .then(
                        Commands.argument('uuid', Arguments.STRING.create(event))
                            .executes(ctx => {
                                try {
                                    return lockNpc(ctx.source, Arguments.STRING.getResult(ctx, 'uuid'), false)
                                } catch (e) {
                                    console.error('Error en /npclock unlock: ' + e)
                                    ctx.source.sendFailure(Text.red('Error interno, revisa la consola.'))
                                    return 0
                                }
                            })
                    )
            )
    )
})

function lockNpc(source, uuidStr, lockState) {
    const entity = source.level.getEntities().find(e => e.uuid.toString() === uuidStr)

    if (!entity) {
        source.sendFailure(Text.red('No se encontró ninguna entidad con ese UUID en esta dimensión.'))
        return 0
    }

    const data = entity.persistentData

    if (lockState) {
        entity.addTag(LOCK_TAG)
        data.putBoolean('locked', true)
        data.putDouble('lockX', entity.x)
        data.putDouble('lockY', entity.y)
        data.putDouble('lockZ', entity.z)
        data.putFloat('lockYaw', entity.yRot)
        data.putFloat('lockPitch', entity.xRot)
        data.putString('lockName', entity.customName ? entity.customName.string : '')
        source.sendSuccess(() => Text.green('NPC bloqueado (posición y nombre).'), true)
    } else {
        data.putBoolean('locked', false) // esta es la bandera que de verdad detiene el bucle
        entity.removeTag(LOCK_TAG)
        source.sendSuccess(() => Text.yellow('NPC desbloqueado.'), true)
    }

    return 1
}

ServerEvents.tick(event => {
    const locked = event.server.entities.filterSelector(`@e[tag=${LOCK_TAG}]`)

    locked.forEach(entity => {
        const data = entity.persistentData

        if (!data.getBoolean('locked')) return // <-- el freno real, no depende del tag
        if (!data.contains('lockX')) return

        const dx = entity.x - data.getDouble('lockX')
        const dy = entity.y - data.getDouble('lockY')
        const dz = entity.z - data.getDouble('lockZ')

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || Math.abs(dz) > 0.01) {
            entity.teleportTo(data.getDouble('lockX'), data.getDouble('lockY'), data.getDouble('lockZ'))
            entity.yRot = data.getFloat('lockYaw')
            entity.xRot = data.getFloat('lockPitch')
            entity.deltaMovement = [0, 0, 0]
        }

        const lockedName = data.getString('lockName')
        const currentName = entity.customName ? entity.customName.string : ''

        if (currentName !== lockedName) {
            entity.customName = lockedName ? Text.of(lockedName) : null
        }
    })
})