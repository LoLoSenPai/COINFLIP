# Coinflip Discord Bot

This "Coinflip" Discord bot lets users flip a coin using the SOL (Solana) cryptocurrency on the devnet.

## Features

- **Wallet creation**: Use `/register` to create a personal wallet.
- **Wallet viewing**: Type `/wallet` to view your wallet balance.
- **Deposit notification**: Use `/notify-deposit` to update the balance with your deposit.
- **Coinflip Game**: Enter `/coinflip` to start a game.
- **Main wallet**: Configure a default withdrawal wallet with `/main-wallet`.
- **Withdraw funds**: Use `/withdraw` and choose `true` to send funds to the registered wallet, or `new_wallet` to specify a new wallet.
- **Export wallet**: Export your private key with `/export-wallet`.

## How to play

1. **Register**: Create your wallet with `/register`.
2. **Deposit SOLs**: Send SOLs to your wallet.
3. **Balance update**: Confirm deposit with `/notify-deposit`.
4. **Play**: Start a game with `/coinflip`.
5. **Withdraw**: Withdraw your winnings with `/withdraw`.

## Installation

This bot requires initial configuration to connect to your Discord server and interact with the Solana network.

1. Clone this repository.
2. Install the necessary dependencies.
3. Configure the environment variables for your Discord bot and the Solana API.
4. Start the bot on your server.

## Contribution

Contributions to this project are welcome. Feel free to submit issues and pull requests for improvements or bug fixes.

---
