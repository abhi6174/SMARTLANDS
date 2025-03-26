import { useState } from 'react';
import { pinFileToIPFS } from '../services/ipfsService';

const useIPFS = () => {
  const [ipfsHash, setIpfsHash] = useState('');

  const uploadToIPFS = async (file) => {
    const hash = await pinFileToIPFS(file);
    setIpfsHash(hash);
    return hash;
  };

  return { ipfsHash, uploadToIPFS };
};

export default useIPFS;