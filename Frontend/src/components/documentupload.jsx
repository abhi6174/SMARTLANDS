import React, { useState } from 'react';
import { uploadToIPFS, getIPFSGatewayUrl } from '../services/ipfsService';

const DocumentUpload = ({ onHashReceived }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const cid = await uploadToIPFS(file);
      console.log("cidd",cid)
      setIpfsHash(cid);
      onHashReceived(cid);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={isUploading}
      />
      
      <button 
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {ipfsHash && (
        <div className="ipfs-success">
          <p>Document uploaded successfully!</p>
          <a
            href={getIPFSGatewayUrl(ipfsHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on IPFS
          </a>
          <p className="cid">CID: {ipfsHash}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;