const solanaWeb3 = require('@solana/web3.js');
const User = require('../models/User');

const Solana = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

// Function to notify the user of a deposit
async function notifyDeposit(interaction) {
    const userId = interaction.user.id;
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    const fromPubkey = new solanaWeb3.PublicKey(user.solanaWallet);
    const balanceInLamports = await Solana.getBalance(fromPubkey);
    const balanceInSol = balanceInLamports / solanaWeb3.LAMPORTS_PER_SOL;

    if (balanceInSol !== user.balance) {
        user.balance = balanceInSol;
        await user.save();
        interaction.reply(`Your balance has been updated to ${balanceInSol} SOL.`);
    } else {
        interaction.reply("Your balance is already up to date.");
    }
}

// Function for depositing SOL
async function depositSOL(interaction, amount) {
    const userId = interaction.user.id;

    // Check if the user has a registered wallet
    const user = await User.findOne({ userId });

    if (!user) {
        return interaction.reply("You don't have a registered wallet. Use /register to create one.");
    }

    // Update the user's balance based on the deposited amount
    user.balance += amount;
    await user.save();

    interaction.reply(`Deposited ${amount} SOL into your wallet. New balance: ${user.balance} SOL`);
}

module.exports = { notifyDeposit, depositSOL };
