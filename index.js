const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId, mongoURI } = require('./config.json');
const { registerWallet, getWallet, withdrawSOL, setMainWallet } = require('./commands/wallet');
const { notifyDeposit, depositSOL } = require('./commands/depositCommands');
const { coinflip } = require('./commands/coinflip');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

client.once('ready', async () => {
    console.log('Bot ready');

    const commands = [
        {
            name: 'register',
            description: 'Register a new wallet',
        },
        {
            name: 'wallet',
            description: 'View your discord wallet',
        },
        {
            name: 'deposit',
            description: 'Deposit SOL to your wallet',
            options: [
                {
                    name: 'amount',
                    description: 'Amount of SOL to deposit',
                    type: 10,
                    required: true,
                },
            ],
        },
        {
            name: 'withdraw',
            description: 'Withdraw SOL to your registered wallet if true, or specify a new wallet address.',
            options: [
                {
                    name: 'amount',
                    description: 'Amount of SOL to withdraw',
                    type: 10, // Number
                    required: true,
                },
                {
                    name: 'new_wallet',
                    description: 'Deposit wallet address (optional if using registered wallet)',
                    type: 3, // String
                    required: false,
                },
                {
                    name: 'registered_wallet',
                    description: 'Use your main wallet address (true or false)',
                    type: 5, // Boolean
                    required: false,
                },
            ],
        },
        {
            name: 'main-wallet',
            description: 'Set your main wallet',
            options: [
                {
                    name: 'main_wallet',
                    description: 'Main wallet address',
                    type: 3,
                    required: true,
                },
            ],
        },
        {
            name: 'notify-deposit',
            description: 'Notify when a deposit is received',
        },
        {
            name: 'coinflip',
            description: 'Bet on heads or tails',
            options: [
                {
                    name: 'choice',
                    description: 'Choose heads or tails',
                    type: 3, // String
                    required: true,
                    choices: [
                        {
                            name: 'Heads',
                            value: 'heads',
                        },
                        {
                            name: 'Tails',
                            value: 'tails',
                        },
                    ],
                },
                {
                    name: 'amount',
                    description: 'Amount of SOL to bet',
                    type: 10, // Number
                    required: true,
                },
            ],
        },
    ];

    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'register') {
        console.log('Command /register received');
        registerWallet(interaction);
    } else if (commandName === 'wallet') {
        console.log('Command /wallet received');
        getWallet(interaction);
    } else if (commandName === 'deposit') {
        console.log('Command /deposit received');
        const amount = options.getNumber('amount');
        depositSOL(interaction, amount);
    } else if (commandName === 'withdraw') {
        const amount = options.getNumber('amount');
        const newWallet = options.getString('new_wallet');
        const useRegisteredWallet = options.getBoolean('registered_wallet') || false;

        if (useRegisteredWallet) {
            // Logic to use the external wallet from DB
            withdrawSOL(interaction, amount, null, useRegisteredWallet);
        } else if (newWallet) {
            // Logic to use the provided target wallet
            withdrawSOL(interaction, amount, newWallet);
        } else {
            // Error handling if no wallet is provided
            interaction.reply("Please provide a target wallet or use your main wallet.");
        }
    } else if (commandName === 'main-wallet') {
        console.log('Command /main-wallet received');
        const mainWallet = options.getString('main_wallet');
        setMainWallet(interaction, mainWallet);
    } else if (commandName === 'notify-deposit') {
        console.log('Command /notify-deposit received');
        notifyDeposit(interaction);
    } else if (commandName === 'coinflip') {
        console.log('Command /coinflip received');
        const choice = options.getString('choice');
        const amount = options.getNumber('amount');
        coinflip(interaction, choice, amount);
    }
});

client.login(token);
