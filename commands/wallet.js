const solanaWeb3 = require('@solana/web3.js');
require('dotenv').config();
const User = require('../models/User');
const { EmbedBuilder } = require('discord.js');
const { encrypt, decrypt } = require('../utils/encryptionUtils');

// Function for registering a new wallet
async function registerWallet(interaction) {
    const userId = interaction.user.id;

    // Checks if the user already exists in the database
    let user = await User.findOne({ userId });
    if (user) {
        return interaction.reply('You already have a registered wallet.');
    }

    // Generates a new wallet
    const { publicKey, secretKey } = await generateSolanaWallet();

    // Registers user in the database
    user = new User({ userId, solanaWallet: publicKey, privateKey: secretKey, balance: 0 });
    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('Wallet Registered')
        .setDescription(`New wallet registered:\nBalance: 0 SOL\nAddress: ${publicKey}`)
        .setColor("#00FF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

// Function for viewing the saved wallet
async function getWallet(interaction) {
    const userId = interaction.user.id;

    // Checks if the user already exists in the database
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply({ content: "You don't have a registered wallet. Use /register to create one.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('Your Wallet')
        .setDescription(`Balance: ${user.balance} SOL\nAddress: ${user.solanaWallet}`)
        .setColor("#FFFF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

const Solana = new solanaWeb3.Connection("https://api.devnet.solana.com");

// Function to generate a new Solana wallet
function generateSolanaWallet() {
    const genWallet = async () => {
        const recentBlock = await Solana.getEpochInfo();
        console.log("~~~~~~~~~~~~~~~~~NEW BLOCK~~~~~~~~~~~~\n", recentBlock);
        const keyPair = solanaWeb3.Keypair.generate();

        console.log("Public Key:", keyPair.publicKey.toString());
        const secretKeyArray = Array.from(keyPair.secretKey);
        console.log("Secret Key Array:", secretKeyArray);

        const encryptedSecretKey = encrypt(Buffer.from(secretKeyArray));
        console.log("Encrypted Secret Key:", encryptedSecretKey);

        const encryptedSecretKeyString = JSON.stringify(encryptedSecretKey);
        console.log("Encrypted Secret Key String:", encryptedSecretKeyString);

        return { publicKey: keyPair.publicKey.toString(), secretKey: encryptedSecretKeyString };
    };

    return genWallet();
}

// Function for withdrawing SOL
async function withdrawSOL(interaction, amount, targetWallet, useMainWallet = false) {
    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    if (useMainWallet) {
        if (!user.externalWallet) {
            return interaction.reply("You don't have a main wallet set. Please set one or provide a wallet address.");
        }
        targetWallet = user.externalWallet;
    }

    if (user.balance < amount) {
        return interaction.reply("Insufficient balance to withdraw.");
    }

    try {
        const decryptedPrivateKeyArray = decrypt(user.privateKey);
        if (decryptedPrivateKeyArray.length !== 64) {
            throw new Error("Wrong private key size.");
        }

        const keypair = solanaWeb3.Keypair.fromSecretKey(Buffer.from(decryptedPrivateKeyArray));

        const solanaWalletString = user.solanaWallet;
        if (!solanaWalletString) {
            return interaction.editReply("Invalid Solana wallet. Please check your wallet and try again.");
        }

        await interaction.deferReply();

        const fromPubkey = new solanaWeb3.PublicKey(solanaWalletString);
        const balance = await Solana.getBalance(fromPubkey);
        console.log(`Discord account balance: ${balance} lamports`);
        const toPubkey = new solanaWeb3.PublicKey(targetWallet);

        const transactionFee = 5000;
        const totalAmount = solanaWeb3.LAMPORTS_PER_SOL * amount + transactionFee;

        if (balance < totalAmount) {
            if (balance >= solanaWeb3.LAMPORTS_PER_SOL * amount) {
                amount = (balance - transactionFee) / solanaWeb3.LAMPORTS_PER_SOL;
            } else {
                return interaction.editReply(`Insufficient funds to complete the withdrawal. Your balance is ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL and the transaction fee is ${transactionFee / solanaWeb3.LAMPORTS_PER_SOL} SOL.`);
            }
        }

        const { blockhash } = await Solana.getLatestBlockhash();
        const transaction = new solanaWeb3.Transaction({ recentBlockhash: blockhash });


        transaction.add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports: Math.round(solanaWeb3.LAMPORTS_PER_SOL * amount),
            })
        );

        transaction.sign(keypair);

        const signature = await solanaWeb3.sendAndConfirmTransaction(Solana, transaction, [keypair]);

        user.balance -= amount + transactionFee / solanaWeb3.LAMPORTS_PER_SOL;
        await user.save();

        const embed = new EmbedBuilder()
            .setTitle('Withdrawal Successful')
            .setDescription(`Withdrawn ${amount} SOL from your wallet. New balance: ${user.balance} SOL. Transaction ID: ${signature}`)
            .setColor("#00FF00")
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error during withdrawal:", error);
        interaction.editReply("An error occurred while processing the withdrawal.");
    }
}

// Function for setting the main wallet
async function setMainWallet(interaction, mainWallet) {
    const userId = interaction.user.id;

    // Check if the user has a registered wallet
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    // Update the user's main wallet in the database
    user.externalWallet = mainWallet;
    await user.save();

    const embed = new EmbedBuilder()
        .setTitle('Main Wallet Set')
        .setDescription(`Main wallet set to: ${mainWallet}`)
        .setColor("#00FF00")
        .setTimestamp();

    interaction.reply({ embeds: [embed] });
}

module.exports = { registerWallet, getWallet, generateSolanaWallet, withdrawSOL, setMainWallet };