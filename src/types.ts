const Types = {
    authorizer: Symbol('authorizer'),
    database:   Symbol('database'),
    discord:    {
        token:   Symbol('discord.token'),
        options: Symbol('discord.options'),
        client:  Symbol('discord.client'),
    },
    logger:     Symbol('logger'),
    manager:    {
        entity: Symbol('manager.entity'),
    },
    queue:      {
        host:     Symbol('queue.host'),
        port:     Symbol('queue.port'),
        username: Symbol('queue.username'),
        password: Symbol('queue.password'),
        producer: Symbol('queue.producer'),
    },
    subscriber: {
        report: Symbol('subscriber.report'),
    },
    vault:      {
        client: Symbol('vault.client'),
        config: Symbol('vault.config'),
    },
};

export default Types;
