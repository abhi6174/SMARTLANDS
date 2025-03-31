export const uploadToIPFS = async (file) => {
  // Validate file before upload
  if (!file) throw new Error('No file selected');
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF, JPG, PNG, DOC, and DOCX are allowed');
  }

  const formData = new FormData();
  formData.append('file', file);

  // Add Pinata metadata
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      app: 'smartland'
    }
  });
  formData.append('pinataMetadata', metadata);

  // Add Pinata options
  const options = JSON.stringify({
    cidVersion: 1
  });
  formData.append('pinataOptions', options);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
        'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.IpfsHash; // Return the CID
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const getIPFSGatewayUrl = (cid) => {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

