const crypto = require('crypto');

const addresses = [
    '0x1234567890123456789012345678901234567890',
    '0x1234567890123456789012345678901234567891',
    '0x1234567890123456789012345678901234567892',
    '0x1234567890123456789012345678901234567893',
    '0x1234567890123456789012345678901234567894'
];

function hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}


function generateMerkleTree(addresses) {
    let layers = [addresses.map(addr => hash(addr))]; 

    
    while (layers[layers.length - 1].length > 1) {
        const currentLayer = layers[layers.length - 1];
        const nextLayer = [];

        for (let i = 0; i < currentLayer.length; i += 2) {
            const left = currentLayer[i];
            const right = currentLayer[i + 1] || left; 
            nextLayer.push(hash(left + right));
        }

        layers.push(nextLayer);
    }

    const merkleRoot = layers[layers.length - 1][0];

    
    const proofs = addresses.map((_, index) => {
        let proof = [];
        let position = index;

        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i];
            const pairIndex = position % 2 === 0 ? position + 1 : position - 1;

            if (pairIndex < currentLayer.length) {
                proof.push({
                    position: position % 2 === 0 ? 'right' : 'left',
                    hash: currentLayer[pairIndex]
                });
            }

            position = Math.floor(position / 2);
        }

        return proof;
    });

    return { merkleRoot, proofs };
}


function verifyMerkleProof(proof, merkleRoot, address) {
    let computedHash = hash(address);

    for (const { position, hash: proofHash } of proof) {
        if (position === 'left') {
            computedHash = hash(proofHash + computedHash);
        } else {
            computedHash = hash(computedHash + proofHash);
        }
    }

    return computedHash === merkleRoot;
}


const { merkleRoot, proofs } = generateMerkleTree(addresses);
console.log('Merkle Root:', merkleRoot);

const proofIndex = 2; 
const proof = proofs[proofIndex];
const isValid = verifyMerkleProof(proof, merkleRoot, addresses[proofIndex]);
console.log('Is valid:', isValid);