const fetch = require('node-fetch');
const ethers = require('ethers');
const lodash = require('lodash')

async function main(addresses) {
    const rpcUrls = [
        "https://eth1.lava.build/lava-referer-xxx/",
        "https://evmos.lava.build/lava-referer-xxx/",
        "https://evmos-testnet.lava.build/lava-referer-xxx/"
    ]
    const number = lodash.floor(4.006)
    const add = lodash.add(number, 1)
    console.log(add)

    const shuffledAddresses = addresses
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
		
	let idx = 0;
	while (1) {
		idx = Date.now() % shuffledAddresses.length;
        const address = shuffledAddresses[idx].split(',')[0].trim();
        if (!address) continue;

        const rpcUrl = rpcUrls[Math.floor(Math.random() * rpcUrls.length)];
        try {
            const result = await checkBalanceAndAppend(address, rpcUrl);
            console.log(idx, result, '\n');
        } catch (error) {
            console.error(`RPC error，can't get address's balance - ${address}: ${error.message}\n`);
        }
    }
}

async function fetchRPC(url, body) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
    });

    if (!response.ok) {
        throw new Error(`HTTP error! statu: ${response.status}, msg: ${await response.text()}`);
    }
    return response.json();
}

async function checkBalanceAndAppend(address, rpcUrl) {
    console.log(`use RPC: ${rpcUrl}`);
    const jsonRpcPayload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
    };

    const response = await fetchRPC(rpcUrl, jsonRpcPayload);
    if (response.error) {
        throw new Error(`RPC error: ${response.error.message}`);
    }

    const balance = ethers.utils.formatUnits(response.result, 'ether');
    return `query ok, address: ${address} - balance: ${balance} ETH`;
}

const addresses = [
    "0xf2f7ad044dfbaa417249c8568788d7aa1e6f1555",
]

main(addresses).catch(console.error);
