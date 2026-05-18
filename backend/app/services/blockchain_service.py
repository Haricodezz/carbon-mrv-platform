import json
import os
from pathlib import Path
from functools import lru_cache

from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

from app.core.config import settings


BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")


RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CARBON_TOKEN_CONTRACT_ADDRESS")


ABI_PATH = (
    BASE_DIR
    / "../blockchain/artifacts/contracts/CarbonCreditToken.sol/CarbonCreditToken.json"
)


def _simulated_receipt(action: str, **payload):
    seed = "|".join(
        [action]
        + [
            f"{key}:{value}"
            for key, value in sorted(payload.items())
        ]
    )
    tx_hash = Web3.keccak(text=seed).hex()
    if not tx_hash.startswith("0x"):
        tx_hash = f"0x{tx_hash}"

    return {
        "tx_hash": tx_hash,
        "block_number": 0,
        "status": 1,
        "simulated": True,
    }


@lru_cache
def get_blockchain_context():
    if not settings.ENABLE_BLOCKCHAIN:
        raise RuntimeError("Blockchain integration is disabled.")

    if (
        not RPC_URL
        or not PRIVATE_KEY
        or not CONTRACT_ADDRESS
        or "0x5FbDB2315678afecb367f032d93F642f64180aa3".lower()
        == CONTRACT_ADDRESS.lower()
    ):
        raise RuntimeError(
            "Missing or placeholder blockchain environment variables in backend/.env"
        )

    if not ABI_PATH.exists():
        raise RuntimeError(
            f"Blockchain contract artifact not found: {ABI_PATH}"
        )

    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        raise RuntimeError("Failed to connect to blockchain RPC.")

    deployer_account = Account.from_key(PRIVATE_KEY)

    with open(ABI_PATH, "r") as abi_file:
        contract_json = json.load(abi_file)
        contract_abi = contract_json["abi"]

    carbon_contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=contract_abi,
    )

    return w3, deployer_account, carbon_contract


def build_transaction(tx):
    w3, deployer_account, _ = get_blockchain_context()

    nonce = w3.eth.get_transaction_count(
        deployer_account.address
    )

    gas_estimate = tx.estimate_gas(
        {"from": deployer_account.address}
    )

    return tx.build_transaction(
        {
            "from": deployer_account.address,
            "nonce": nonce,
            "gas": gas_estimate,
            "gasPrice": w3.eth.gas_price,
        }
    )


def sign_and_send(transaction):
    w3, _, _ = get_blockchain_context()

    signed_tx = w3.eth.account.sign_transaction(
        transaction,
        PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    receipt = w3.eth.wait_for_transaction_receipt(
        tx_hash
    )

    return {
        "tx_hash": tx_hash.hex(),
        "block_number": receipt.blockNumber,
        "status": receipt.status,
    }


def mint_credits(
    recipient_wallet: str,
    amount: int,
    project_id: str
):
    try:
        _, _, carbon_contract = get_blockchain_context()
    except Exception:
        return _simulated_receipt(
            "mint",
            recipient_wallet=recipient_wallet,
            amount=amount,
            project_id=project_id,
        )

    recipient = Web3.to_checksum_address(
        recipient_wallet
    )

    tx = carbon_contract.functions.mintCredits(
        recipient,
        amount,
        project_id
    )

    built_tx = build_transaction(tx)

    return sign_and_send(built_tx)


def retire_credits(
    amount: int,
    reason: str
):
    try:
        _, _, carbon_contract = get_blockchain_context()
    except Exception:
        return _simulated_receipt(
            "retire",
            amount=amount,
            reason=reason,
        )

    tx = carbon_contract.functions.retireCredits(
        amount,
        reason
    )

    built_tx = build_transaction(tx)

    return sign_and_send(built_tx)


def get_wallet_balance(
    wallet_address: str
):
    try:
        _, _, carbon_contract = get_blockchain_context()
    except Exception:
        return {
            "wallet_address": wallet_address,
            "balance": 0,
            "token_symbol": "CMRV",
            "simulated": True,
        }

    address = Web3.to_checksum_address(
        wallet_address
    )

    balance = carbon_contract.functions.balanceOf(
        address
    ).call()

    return {
        "wallet_address": wallet_address,
        "balance": balance,
        "token_symbol": "CMRV",
    }


def transfer_credits(
    recipient_wallet: str,
    amount: int
):
    try:
        _, _, carbon_contract = get_blockchain_context()
    except Exception:
        return _simulated_receipt(
            "transfer",
            recipient_wallet=recipient_wallet,
            amount=amount,
        )

    recipient = Web3.to_checksum_address(
        recipient_wallet
    )

    tx = carbon_contract.functions.transfer(
        recipient,
        amount
    )

    built_tx = build_transaction(tx)

    return sign_and_send(built_tx)


def get_total_supply():
    try:
        _, _, carbon_contract = get_blockchain_context()
    except Exception:
        return {
            "total_supply": 0,
            "token_symbol": "CMRV",
            "simulated": True,
        }

    supply = carbon_contract.functions.totalSupply().call()

    return {
        "total_supply": supply,
        "token_symbol": "CMRV",
    }


def get_token_name():
    _, _, carbon_contract = get_blockchain_context()

    return carbon_contract.functions.name().call()


def get_token_symbol():
    _, _, carbon_contract = get_blockchain_context()

    return carbon_contract.functions.symbol().call()
