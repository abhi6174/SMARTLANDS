require("dotenv").config();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

// Upload file to IPFS via Pinata
async function uploadToPinata(filePath) {
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = { pinataMetadata: { name: "Land Document" } };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        return result.IpfsHash;  // Returns CID
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        return null;
    }
}

module.exports = { uploadToPinata };
